import { splitPinyinSyllables } from "@/lib/pinyin-display";
import type { DesiredFeeling, GenderPreference } from "../types";
import type { GivenNameEntry } from "./corpus/given-names";
import { GIVEN_NAME_TRAITS } from "./corpus/given-name-traits";
import {
  CHARACTER_MEANINGS,
  ENGLISH_NAME_MEANINGS,
} from "./corpus/meanings";
import { stripTones } from "./corpus/reject";
import type { SurnameEntry } from "./corpus/surnames";

export type CharacterGloss = { hanzi: string; meaning: string };

export type PaidScoreBreakdown = {
  /** Final sampling weight; always > 0 for lexicon entries in the pool. */
  weight: number;
  genderWeight: number;
  feelingWeight: number;
  /** 0–4, from pronunciation similarity to the English name. */
  soundScore: number;
  /** 0–4, from keyword overlap with the English name's meaning. */
  meaningScore: number;
  /** max(sound, meaning): paid selection uses pronunciation OR meaning. */
  englishScore: number;
};

export type NameExplainContext = {
  characterMeanings: CharacterGloss[];
  givenMeaning: string | null;
  englishNameMeanings: string[];
};

const FEELING_MATCH = 4;
const FEELING_OTHER = 0.5;
const GENDER_MATCH = 3;
const GENDER_OTHER = 1;

/** Fold Latin letters, strip diacritics, keep a-z only. */
export function normalizeLatin(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z]/g, "");
}

function englishTokens(englishName: string): string[] {
  return englishName
    .split(/[\s'-]+/u)
    .map((part) => normalizeLatin(part))
    .filter(Boolean);
}

/**
 * Very small syllable split for English given names (not IPA).
 * "Elena" → ["e", "le", "na"]; "Claire" → ["clai", "re"] or similar.
 */
export function englishSyllables(normalized: string): string[] {
  if (!normalized) return [];
  const matches = normalized.match(/[^aeiouy]*[aeiouy]+(?:[^aeiouy]*$)?/g);
  return matches && matches.length > 0 ? matches : [normalized];
}

function syllableWindows(syllables: string[]): string[] {
  const out = new Set<string>();
  for (let i = 0; i < syllables.length; i++) {
    let acc = "";
    for (let j = i; j < syllables.length; j++) {
      acc += syllables[j]!;
      if (acc.length >= 2) out.add(acc);
    }
  }
  return [...out];
}

/** Fold y/i so "lin" can meet "lyn", and "yi" can meet "i". */
function softenVowels(value: string): string {
  return value.replace(/y/g, "i").replace(/ee/g, "i");
}

function expandEnglishForms(base: Iterable<string>): string[] {
  const forms = new Set<string>();
  for (const form of base) {
    if (form.length >= 2) forms.add(form);
    // "lena" / "elena" → "len" / "elen", so pinyin "lin" is one edit away.
    if (form.length >= 4 && /[aeiouy]$/.test(form)) {
      forms.add(form.slice(0, -1));
    }
    const soft = softenVowels(form);
    if (soft.length >= 2) forms.add(soft);
    if (soft.length >= 4 && /[aeiou]$/.test(soft)) {
      forms.add(soft.slice(0, -1));
    }
  }
  return [...forms];
}

function englishSoundForms(englishName: string): string[] {
  const raw = new Set<string>();
  const tokens = englishTokens(englishName);
  const joined = tokens.join("");
  if (joined) raw.add(joined);
  for (const token of tokens) {
    raw.add(token);
    const syl = englishSyllables(token);
    for (const s of syl) {
      if (s.length >= 2) raw.add(s);
    }
    for (const w of syllableWindows(syl)) raw.add(w);
  }
  return expandEnglishForms(raw);
}

function editDistance(a: string, b: string): number {
  if (a === b) return 0;
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i]![0] = i;
  for (let j = 0; j <= n; j++) dp[0]![j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i]![j] = Math.min(
        dp[i - 1]![j]! + 1,
        dp[i]![j - 1]! + 1,
        dp[i - 1]![j - 1]! + cost,
      );
    }
  }
  return dp[m]![n]!;
}

function onsetOf(syllable: string): string {
  return syllable.match(/^[^aeiou]*/)?.[0] ?? "";
}

function codaOf(syllable: string): string {
  return syllable.replace(/^[^aeiou]*/, "").replace(/^[aeiou]+/, "");
}

/**
 * One-edit matches count only when onset and coda stay the same
 * (lin/len, not lei/len).
 */
function closeSyllables(pinyin: string, english: string): boolean {
  if (pinyin.length < 3 || english.length < 3) return false;
  if (Math.abs(pinyin.length - english.length) > 1) return false;
  if (editDistance(pinyin, english) !== 1) return false;
  const onset = onsetOf(pinyin);
  return onset.length > 0 && onset === onsetOf(english) && codaOf(pinyin) === codaOf(english);
}

/**
 * How closely one tone-stripped pinyin syllable resembles English name chunks.
 * Short 1-letter matches are ignored so we do not overfit "e" / "a".
 */
export function syllableSoundScore(pinyinSyllable: string, englishForms: string[]): number {
  const p = stripTones(pinyinSyllable);
  if (p.length < 2) return 0;
  const pSoft = softenVowels(p);
  let best = 0;
  for (const form of englishForms) {
    const candidates = form === p || form === pSoft ? 4 : 0;
    if (candidates === 4) {
      best = Math.max(best, 4);
      continue;
    }
    // Prefix matches need 3+ letters so "le" does not drag in every lei/leng syllable.
    if (
      Math.min(form.length, p.length) >= 3 &&
      (form.startsWith(p) || p.startsWith(form) || form.startsWith(pSoft) || pSoft.startsWith(form))
    ) {
      best = Math.max(best, 3);
      continue;
    }
    if (
      form.length >= 3 &&
      p.length >= 3 &&
      (form.includes(p) || p.includes(form) || form.includes(pSoft) || pSoft.includes(form))
    ) {
      best = Math.max(best, 3);
      continue;
    }
    if (closeSyllables(p, form) || closeSyllables(pSoft, form)) {
      best = Math.max(best, 3);
    }
  }
  return best;
}

export function pinyinSoundScore(pinyin: string, englishName: string): number {
  const forms = englishSoundForms(englishName);
  const syllables = splitPinyinSyllables(pinyin);
  if (syllables.length === 0 || forms.length === 0) return 0;
  const scores = syllables.map((s) => syllableSoundScore(s, forms));
  const best = Math.max(...scores);
  const support = scores.filter((s) => s >= 3).length;
  return Math.min(4, best + (support > 1 ? 0.5 : 0));
}

export function englishNameMeaningKeywords(englishName: string): string[] {
  const tokens = englishTokens(englishName);
  const keys = new Set<string>();
  const joined = tokens.join("");
  if (joined && ENGLISH_NAME_MEANINGS[joined]) {
    for (const k of ENGLISH_NAME_MEANINGS[joined]!) keys.add(k);
  }
  for (const token of tokens) {
    const found = ENGLISH_NAME_MEANINGS[token];
    if (found) for (const k of found) keys.add(k);
  }
  return [...keys];
}

export function meaningOverlapScore(keywords: string[], englishName: string): number {
  if (keywords.length === 0) return 0;
  const target = new Set(englishNameMeaningKeywords(englishName));
  if (target.size === 0) return 0;
  const hits = keywords.filter((k) => target.has(k)).length;
  if (hits <= 0) return 0;
  if (hits === 1) return 3;
  return 4;
}

export function getGivenTraits(hanzi: string) {
  return GIVEN_NAME_TRAITS[hanzi] ?? null;
}

export function scoreGivenName(options: {
  given: GivenNameEntry;
  englishName: string;
  desiredFeeling: DesiredFeeling;
  genderPreference: GenderPreference;
}): PaidScoreBreakdown {
  const { given, englishName, desiredFeeling, genderPreference } = options;
  const traits = getGivenTraits(given.hanzi);
  const genderWeight = given.styles.includes(genderPreference)
    ? GENDER_MATCH
    : GENDER_OTHER;
  const feelingWeight = traits?.feelings.includes(desiredFeeling)
    ? FEELING_MATCH
    : FEELING_OTHER;
  const soundScore = pinyinSoundScore(given.pinyin, englishName);
  const meaningScore = meaningOverlapScore(traits?.keywords ?? [], englishName);
  const englishScore = Math.max(soundScore, meaningScore);
  // Feeling is the base multiplier so calm names are not crowded out by
  // meaning-only "light" names. English pronunciation or meaning is a boost.
  const bothBonus = feelingWeight >= FEELING_MATCH && englishScore >= 3 ? 1.5 : 1;
  const weight = genderWeight * feelingWeight * (1 + 0.5 * englishScore) * bothBonus;
  return {
    weight,
    genderWeight,
    feelingWeight,
    soundScore,
    meaningScore,
    englishScore,
  };
}

export function surnameSoundBoost(surname: SurnameEntry, englishName: string): number {
  const score = pinyinSoundScore(surname.pinyin, englishName);
  if (score >= 3) return 2;
  if (score >= 1) return 0.5;
  return 0;
}

export function characterMeaning(hanzi: string): string | null {
  return CHARACTER_MEANINGS[hanzi] ?? null;
}

export function buildNameExplainContext(
  fullHanzi: string,
  englishName: string,
): NameExplainContext {
  const characters = [...fullHanzi];
  const givenHanzi = characters.slice(1).join("");
  const traits = getGivenTraits(givenHanzi);
  const characterMeanings: CharacterGloss[] = characters.map((ch) => ({
    hanzi: ch,
    meaning: characterMeaning(ch) ?? "a Chinese character used in names",
  }));
  return {
    characterMeanings,
    givenMeaning: traits?.meaning ?? null,
    englishNameMeanings: englishNameMeaningKeywords(englishName),
  };
}

/** True if every given-name character (and the surname, if present) is in the meaning table. */
export function hasGroundedMeanings(fullHanzi: string): boolean {
  return [...fullHanzi].every((ch) => Boolean(CHARACTER_MEANINGS[ch]));
}

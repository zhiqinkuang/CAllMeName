import type { DesiredFeeling, FreeCard, FullCard, GenderPreference } from "../types";
import { GIVEN_NAMES, type GivenNameEntry } from "./corpus/given-names";
import { isRejectedName } from "./corpus/reject";
import { SURNAMES } from "./corpus/surnames";
import {
  scoreGivenName,
  surnameSoundBoost,
  type PaidScoreBreakdown,
} from "./paid-scoring";
import { toPhoneticHint } from "./phonetic";

export type GenerateOptions = {
  genderPreference: GenderPreference;
  desiredFeeling?: DesiredFeeling;
  count?: number;
  /** Injected for tests */
  random?: () => number;
};

export type GeneratePaidOptions = GenerateOptions & {
  englishName: string;
  desiredFeeling: DesiredFeeling;
};

export type PaidNameBase = {
  hanzi: string;
  pinyin: string;
  phoneticHint: string;
};

function pickWeighted<T>(
  items: T[],
  weight: (item: T) => number,
  random: () => number,
): T | null {
  if (items.length === 0) return null;
  const weights = items.map(weight);
  const total = weights.reduce((a, b) => a + b, 0);
  if (total <= 0) return null;
  let r = random() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i]!;
    if (r <= 0) return items[i]!;
  }
  return items[items.length - 1]!;
}

function hanziLen(s: string): number {
  return [...s].length;
}

function poolForPreference(genderPreference: GenderPreference): GivenNameEntry[] {
  const pool = GIVEN_NAMES.filter((g) => g.styles.includes(genderPreference));
  return pool.length > 0 ? pool : GIVEN_NAMES;
}

/**
 * Lexicon-only sampler. No LLM.
 * Preference MUST be used for weighted given-name selection (api-contract v1.1).
 * Free generation ignores englishName and desiredFeeling.
 */
export function generateFreeCards(options: GenerateOptions): FreeCard[] {
  const {
    genderPreference,
    count = 3,
    random = Math.random,
  } = options;

  const effectivePool = poolForPreference(genderPreference);

  const results: FreeCard[] = [];
  const seen = new Set<string>();
  let attempts = 0;
  const maxAttempts = count * 80;

  while (results.length < count && attempts < maxAttempts) {
    attempts++;
    const surname = SURNAMES[Math.floor(random() * SURNAMES.length)]!;
    const given = pickWeighted(
      effectivePool,
      (g) => (g.styles.includes(genderPreference) ? 3 : 1),
      random,
    );
    if (!given) continue;

    const hanzi = surname.hanzi + given.hanzi;
    const pinyin = `${surname.pinyin} ${given.pinyin}`;
    const len = hanziLen(hanzi);
    if (len < 2 || len > 3) continue;
    if (seen.has(hanzi)) continue;
    if (isRejectedName(hanzi, pinyin)) continue;

    seen.add(hanzi);
    results.push({ hanzi, pinyin });
  }

  if (results.length < count) {
    throw new Error("Failed to sample enough distinct names from lexicon");
  }
  return results;
}

/**
 * Paid lexicon sampler. Still lexicon-only (no invented hanzi, no transliteration).
 *
 * Inputs that affect selection: genderPreference, desiredFeeling, englishName, count, random.
 * Scoring is a pure function of the name + those inputs; `random` is the only source of chance.
 *
 * Weight = genderWeight * feelingWeight * (1 + 0.5 * englishScore) * bothBonus,
 * where englishScore is the better of pronunciation similarity and English-name
 * meaning overlap. Feeling stays the base so the selected Feeling is not crowded
 * out; a pronunciation or meaning link is a boost, never a license to invent 音译
 * names outside the lexicon. When the lexicon can support it, at least one of the
 * three names has a clear English-name link.
 */
export function generatePaidNameBases(
  options: GeneratePaidOptions,
): PaidNameBase[] {
  const {
    genderPreference,
    desiredFeeling,
    englishName,
    count = 3,
    random = Math.random,
  } = options;

  const effectivePool = poolForPreference(genderPreference);
  const givenWeights = new Map<string, number>();
  const givenEnglish = new Map<string, number>();
  for (const given of effectivePool) {
    const scored = scoreGivenName({
      given,
      englishName,
      desiredFeeling,
      genderPreference,
    });
    givenWeights.set(given.hanzi, scored.weight);
    givenEnglish.set(given.hanzi, scored.englishScore);
  }

  const results: PaidNameBase[] = [];
  const seen = new Set<string>();
  const usedGivens = new Set<string>();
  const usedSurnames = new Set<string>();
  let attempts = 0;
  const maxAttempts = count * 80;
  let remaining = effectivePool.slice();

  while (results.length < count && attempts < maxAttempts) {
    attempts++;
    if (remaining.length === 0) remaining = effectivePool.slice();

    const given = pickWeighted(
      remaining,
      (g) => givenWeights.get(g.hanzi) ?? 0.1,
      random,
    );
    if (!given) continue;

    const surnamePool = SURNAMES.filter((s) => !usedSurnames.has(s.hanzi));
    const surnames = surnamePool.length > 0 ? surnamePool : SURNAMES;
    const surname = pickWeighted(
      surnames,
      (s) => 1 + surnameSoundBoost(s, englishName),
      random,
    );
    if (!surname) continue;

    const hanzi = surname.hanzi + given.hanzi;
    const pinyin = `${surname.pinyin} ${given.pinyin}`;
    const len = hanziLen(hanzi);
    if (len < 2 || len > 3) continue;
    if (seen.has(hanzi) || usedGivens.has(given.hanzi)) {
      remaining = remaining.filter((g) => g.hanzi !== given.hanzi);
      continue;
    }
    if (isRejectedName(hanzi, pinyin)) continue;

    seen.add(hanzi);
    usedGivens.add(given.hanzi);
    usedSurnames.add(surname.hanzi);
    remaining = remaining.filter((g) => g.hanzi !== given.hanzi);
    results.push({
      hanzi,
      pinyin,
      phoneticHint: toPhoneticHint(pinyin),
    });
  }

  ensureEnglishLinkedName({
    results,
    seen,
    usedGivens,
    usedSurnames,
    effectivePool,
    givenEnglish,
    givenWeights,
    englishName,
    random,
  });

  if (results.length < count) {
    throw new Error("Failed to sample enough distinct names from lexicon");
  }
  return results;
}

function givenHanziOf(full: string): string {
  return [...full].slice(1).join("");
}

/**
 * If none of the sampled names has a clear English pronunciation or meaning
 * link, and the lexicon still has one, swap the last pick for a linked name.
 */
function ensureEnglishLinkedName(args: {
  results: PaidNameBase[];
  seen: Set<string>;
  usedGivens: Set<string>;
  usedSurnames: Set<string>;
  effectivePool: GivenNameEntry[];
  givenEnglish: Map<string, number>;
  givenWeights: Map<string, number>;
  englishName: string;
  random: () => number;
}): void {
  const {
    results,
    seen,
    usedGivens,
    usedSurnames,
    effectivePool,
    givenEnglish,
    givenWeights,
    englishName,
    random,
  } = args;
  if (results.length === 0) return;
  const alreadyLinked = results.some((base) => {
    const given = givenHanziOf(base.hanzi);
    return (givenEnglish.get(given) ?? 0) >= 3;
  });
  if (alreadyLinked) return;

  const linkedPool = effectivePool.filter(
    (g) => (givenEnglish.get(g.hanzi) ?? 0) >= 3 && !usedGivens.has(g.hanzi),
  );
  if (linkedPool.length === 0) return;
  // Prefer a Feeling-matching name that also has an English link.
  const preferred = linkedPool.filter((g) => (givenWeights.get(g.hanzi) ?? 0) >= 12);
  const pool = preferred.length > 0 ? preferred : linkedPool;

  let attempts = 0;
  while (attempts < 40) {
    attempts++;
    const given = pickWeighted(
      pool,
      (g) => givenWeights.get(g.hanzi) ?? 1,
      random,
    );
    if (!given) return;
    const surnamePool = SURNAMES.filter((s) => !usedSurnames.has(s.hanzi));
    const surnames = surnamePool.length > 0 ? surnamePool : SURNAMES;
    const surname = pickWeighted(
      surnames,
      (s) => 1 + surnameSoundBoost(s, englishName),
      random,
    );
    if (!surname) return;
    const hanzi = surname.hanzi + given.hanzi;
    const pinyin = `${surname.pinyin} ${given.pinyin}`;
    if (hanziLen(hanzi) < 2 || hanziLen(hanzi) > 3) continue;
    if (seen.has(hanzi) || isRejectedName(hanzi, pinyin)) continue;

    const replaced = results[results.length - 1]!;
    const replacedGiven = givenHanziOf(replaced.hanzi);
    const replacedSurname = [...replaced.hanzi][0]!;
    seen.delete(replaced.hanzi);
    usedGivens.delete(replacedGiven);
    usedSurnames.delete(replacedSurname);
    seen.add(hanzi);
    usedGivens.add(given.hanzi);
    usedSurnames.add(surname.hanzi);
    results[results.length - 1] = {
      hanzi,
      pinyin,
      phoneticHint: toPhoneticHint(pinyin),
    };
    return;
  }
}

export function scorePaidGiven(
  given: GivenNameEntry,
  options: {
    englishName: string;
    desiredFeeling: DesiredFeeling;
    genderPreference: GenderPreference;
  },
): PaidScoreBreakdown {
  return scoreGivenName({ given, ...options });
}

export function assertNoFortuneTelling(text: string): boolean {
  const lower = text.toLowerCase();
  const banned = [
    "bazi",
    "ba zi",
    "八字",
    "五行",
    "five elements",
    "lucky color",
    "幸运色",
    "fortune-telling",
    "horoscope",
  ];
  return !banned.some((b) => lower.includes(b) || text.includes(b));
}

export type { FullCard };

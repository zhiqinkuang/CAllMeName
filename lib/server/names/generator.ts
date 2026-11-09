import type { DesiredFeeling, FreeCard, FullCard, GenderPreference } from "../types";
import { GIVEN_NAMES } from "./corpus/given-names";
import { isRejectedName } from "./corpus/reject";
import { SURNAMES } from "./corpus/surnames";
import { toPhoneticHint } from "./phonetic";

export type GenerateOptions = {
  genderPreference: GenderPreference;
  desiredFeeling?: DesiredFeeling;
  count?: number;
  /** Injected for tests */
  random?: () => number;
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

/**
 * Lexicon-only sampler. No LLM.
 * Preference MUST be used for weighted given-name selection (api-contract v1.1).
 */
export function generateFreeCards(options: GenerateOptions): FreeCard[] {
  const {
    genderPreference,
    count = 3,
    random = Math.random,
  } = options;

  const pool = GIVEN_NAMES.filter((g) =>
    g.styles.includes(genderPreference),
  );
  const effectivePool = pool.length > 0 ? pool : GIVEN_NAMES;

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

export function generatePaidNameBases(
  options: GenerateOptions,
): Array<{ hanzi: string; pinyin: string; phoneticHint: string }> {
  const cards = generateFreeCards({ ...options, count: options.count ?? 3 });
  return cards.map((c) => ({
    ...c,
    phoneticHint: toPhoneticHint(c.pinyin),
  }));
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

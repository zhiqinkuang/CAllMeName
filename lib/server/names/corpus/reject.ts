/**
 * Self-built reject list: crude near-homophones / embarrassing pairings.
 * Checked against full hanzi and concatenated pinyin (tone marks stripped).
 */
export const REJECT_HANZI_SUBSTRINGS: string[] = [
  "死",
  "尸",
  "鬼",
  "粪",
  "屎",
  "尿",
  "娼",
  "妓",
  "奴",
];

/** Tone-less pinyin fragments to reject (lowercase). */
export const REJECT_PINYIN_FRAGMENTS: string[] = [
  "shiba",
  "jiba",
  "caonima",
  "gan",
  "sao",
];

export function stripTones(pinyin: string): string {
  return pinyin
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[·\s]/g, "")
    .toLowerCase();
}

export function isRejectedName(hanzi: string, pinyin: string): boolean {
  for (const bad of REJECT_HANZI_SUBSTRINGS) {
    if (hanzi.includes(bad)) return true;
  }
  const flat = stripTones(pinyin);
  for (const frag of REJECT_PINYIN_FRAGMENTS) {
    if (flat.includes(frag)) return true;
  }
  return false;
}

import { stripTones } from "./corpus/reject";

/**
 * English approximate reading for learners (not IPA).
 * Uses tone-stripped pinyin with simple syllable spacing.
 */
export function toPhoneticHint(pinyin: string): string {
  const parts = pinyin.trim().split(/\s+/);
  return parts
    .map((part) => {
      const toneLess = stripTones(part);
      // Capitalize first letter of each chunk for readability
      if (!toneLess) return part;
      return toneLess.charAt(0).toUpperCase() + toneLess.slice(1);
    })
    .join(" ");
}

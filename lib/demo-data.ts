import type { DesiredFeeling, GenderPreference } from "@/lib/api/types";

export type NameStyle = GenderPreference;

export type GeneratorState = "empty" | "generating" | "ready" | "limit" | "error";

/** @deprecated Prefer API FullCard; kept for style-QA fixtures only */
export type PaperId = "anran" | "jingxing" | "qingyue";

export const DEMO_CUSTOMER = {
  englishName: "Elena",
  nameStyle: "neutral" as NameStyle,
  feeling: "calm" as DesiredFeeling,
};

export const NAME_STYLE_OPTIONS: { value: NameStyle; label: string }[] = [
  { value: "feminine", label: "Typically feminine" },
  { value: "masculine", label: "Typically masculine" },
  { value: "neutral", label: "Either is fine" },
];

/** Contract six feelings only — no Warm / Nature-inspired / Strong / Gentle */
export const FEELING_OPTIONS: { value: DesiredFeeling; label: string }[] = [
  { value: "friendly", label: "Friendly" },
  { value: "calm", label: "Calm" },
  { value: "bright", label: "Bright" },
  { value: "elegant", label: "Elegant" },
  { value: "modern", label: "Modern" },
  { value: "scholarly", label: "Scholarly" },
];

export function parseGeneratorParam(
  value: string | null | undefined,
): GeneratorState | null {
  if (
    value === "empty" ||
    value === "generating" ||
    value === "ready" ||
    value === "limit"
  ) {
    return value;
  }
  return null;
}

/** QA only: primary card index 0|1|2 */
export function parsePaperIndex(
  value: string | null | undefined,
): number | null {
  if (value === "0" || value === "1" || value === "2") return Number(value);
  // legacy QA aliases
  if (value === "anran") return 0;
  if (value === "jingxing") return 1;
  if (value === "qingyue") return 2;
  return null;
}

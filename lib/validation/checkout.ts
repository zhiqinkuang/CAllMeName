import type { DesiredFeeling, GenderPreference } from "@/lib/api/types";

const ENGLISH_NAME_RE = /^[\p{Script=Latin}\p{M} '\-]{1,80}$/u;

export const DESIRED_FEELINGS: { value: DesiredFeeling; label: string }[] = [
  { value: "friendly", label: "Friendly" },
  { value: "calm", label: "Calm" },
  { value: "bright", label: "Bright" },
  { value: "elegant", label: "Elegant" },
  { value: "modern", label: "Modern" },
  { value: "scholarly", label: "Scholarly" },
];

export type CheckoutFormValues = {
  englishName: string;
  genderPreference: GenderPreference;
  desiredFeeling: DesiredFeeling | "";
};

export type CheckoutFieldErrors = {
  englishName?: string;
  genderPreference?: string;
  desiredFeeling?: string;
};

export function validateEnglishName(raw: string): string | undefined {
  const trimmed = raw.trim();
  if (!trimmed) return "Please enter your English name.";
  if (trimmed.length > 80) return "English name must be 80 characters or fewer.";
  if (!ENGLISH_NAME_RE.test(trimmed)) {
    return "Use letters (including accents), spaces, hyphens, or apostrophes.";
  }
  return undefined;
}

export function validateCheckoutForm(
  values: CheckoutFormValues,
): CheckoutFieldErrors {
  const errors: CheckoutFieldErrors = {};
  const en = validateEnglishName(values.englishName);
  if (en) errors.englishName = en;
  if (
    values.genderPreference !== "feminine" &&
    values.genderPreference !== "masculine" &&
    values.genderPreference !== "neutral"
  ) {
    errors.genderPreference = "Please choose a name style.";
  }
  if (!values.desiredFeeling) {
    errors.desiredFeeling = "Please choose a feeling.";
  }
  return errors;
}

export function isCheckoutValid(errors: CheckoutFieldErrors): boolean {
  return Object.keys(errors).length === 0;
}

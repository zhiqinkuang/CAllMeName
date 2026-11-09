import { validationError } from "./errors";
import type { DesiredFeeling, GenderPreference } from "./types";

const GENDERS = new Set<GenderPreference>(["feminine", "masculine", "neutral"]);
const FEELINGS = new Set<DesiredFeeling>([
  "friendly",
  "calm",
  "bright",
  "elegant",
  "modern",
  "scholarly",
]);

/** Latin letters (incl. diacritics), spaces, hyphen, apostrophe. */
const ENGLISH_NAME_RE = /^[\p{L}][\p{L}\s'\-]{0,79}$/u;

export function validateEnglishName(raw: unknown): string {
  if (typeof raw !== "string") {
    throw validationError("englishName is required", {
      englishName: "Required",
    });
  }
  const trimmed = raw.trim();
  if (trimmed.length < 1 || trimmed.length > 80) {
    throw validationError("englishName must be 1–80 characters after trim", {
      englishName: "Must be 1–80 characters",
    });
  }
  if (!ENGLISH_NAME_RE.test(trimmed)) {
    throw validationError(
      "englishName may contain Latin letters (including diacritics), spaces, hyphens, and apostrophes",
      { englishName: "Invalid characters" },
    );
  }
  return trimmed;
}

export function validateGenderPreference(raw: unknown): GenderPreference {
  if (typeof raw !== "string" || !GENDERS.has(raw as GenderPreference)) {
    throw validationError("genderPreference is invalid", {
      genderPreference: "Must be feminine, masculine, or neutral",
    });
  }
  return raw as GenderPreference;
}

/**
 * Optional on free endpoint: missing / null / undefined → neutral.
 * Invalid string → validation_error.
 */
export function parseOptionalGenderPreference(
  raw: unknown,
): GenderPreference {
  if (raw === undefined || raw === null || raw === "") {
    return "neutral";
  }
  return validateGenderPreference(raw);
}

export function validateDesiredFeeling(raw: unknown): DesiredFeeling {
  if (typeof raw !== "string" || !FEELINGS.has(raw as DesiredFeeling)) {
    throw validationError("desiredFeeling is invalid", {
      desiredFeeling:
        "Must be friendly, calm, bright, elegant, modern, or scholarly",
    });
  }
  return raw as DesiredFeeling;
}

export function validateCheckoutBody(body: unknown): {
  englishName: string;
  genderPreference: GenderPreference;
  desiredFeeling: DesiredFeeling;
} {
  if (!body || typeof body !== "object") {
    throw validationError("Request body must be a JSON object");
  }
  const b = body as Record<string, unknown>;
  const fields: Record<string, string> = {};
  let englishName = "";
  let genderPreference: GenderPreference | null = null;
  let desiredFeeling: DesiredFeeling | null = null;

  try {
    englishName = validateEnglishName(b.englishName);
  } catch (e) {
    if (e && typeof e === "object" && "body" in e) {
      Object.assign(fields, (e as { body: { fields?: Record<string, string> } }).body.fields);
    } else {
      fields.englishName = "Required";
    }
  }
  try {
    genderPreference = validateGenderPreference(b.genderPreference);
  } catch {
    fields.genderPreference = "Must be feminine, masculine, or neutral";
  }
  try {
    desiredFeeling = validateDesiredFeeling(b.desiredFeeling);
  } catch {
    fields.desiredFeeling =
      "Must be friendly, calm, bright, elegant, modern, or scholarly";
  }

  if (Object.keys(fields).length > 0) {
    const first = Object.keys(fields)[0];
    throw validationError(
      first === "englishName" && !b.englishName
        ? "englishName is required"
        : "Validation failed",
      fields,
    );
  }

  return {
    englishName,
    genderPreference: genderPreference!,
    desiredFeeling: desiredFeeling!,
  };
}

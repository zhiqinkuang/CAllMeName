import { describe, expect, it } from "vitest";
import { ApiError } from "@/lib/server/errors";
import {
  parseOptionalGenderPreference,
  validateCheckoutBody,
  validateEnglishName,
} from "@/lib/server/validation";

describe("validation (B-A3)", () => {
  it("accepts diacritics and punctuation in englishName", () => {
    for (const name of ["José", "François", "Mary-Jane", "O'Connor"]) {
      expect(validateEnglishName(name)).toBe(name);
    }
  });

  it("rejects empty / too long englishName", () => {
    expect(() => validateEnglishName("   ")).toThrow(ApiError);
    expect(() => validateEnglishName("a".repeat(81))).toThrow(ApiError);
  });

  it("parseOptionalGenderPreference defaults missing/null to neutral", () => {
    expect(parseOptionalGenderPreference(undefined)).toBe("neutral");
    expect(parseOptionalGenderPreference(null)).toBe("neutral");
    expect(parseOptionalGenderPreference("")).toBe("neutral");
  });

  it("parseOptionalGenderPreference accepts valid enums", () => {
    expect(parseOptionalGenderPreference("feminine")).toBe("feminine");
    expect(parseOptionalGenderPreference("masculine")).toBe("masculine");
    expect(parseOptionalGenderPreference("neutral")).toBe("neutral");
  });

  it("parseOptionalGenderPreference rejects illegal values", () => {
    expect(() => parseOptionalGenderPreference("other")).toThrow(ApiError);
    try {
      parseOptionalGenderPreference("other");
    } catch (e) {
      expect(e).toBeInstanceOf(ApiError);
      expect((e as ApiError).body.error).toBe("validation_error");
      expect((e as ApiError).body.fields?.genderPreference).toBeTruthy();
    }
  });

  it("checkout body validates all three fields", () => {
    const ok = validateCheckoutBody({
      englishName: " Alice ",
      genderPreference: "feminine",
      desiredFeeling: "elegant",
    });
    expect(ok.englishName).toBe("Alice");
    expect(() =>
      validateCheckoutBody({
        englishName: "Alice",
        genderPreference: "other",
        desiredFeeling: "elegant",
      }),
    ).toThrow(ApiError);
  });
});

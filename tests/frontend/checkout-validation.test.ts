import { describe, expect, it } from "vitest";
import {
  isCheckoutValid,
  validateCheckoutForm,
  validateEnglishName,
} from "@/lib/validation/checkout";

describe("F-T5 checkout validation", () => {
  it("accepts accented names, hyphens, apostrophes", () => {
    for (const name of ["José", "François", "Mary-Jane", "O'Connor", "Elena"]) {
      expect(validateEnglishName(name)).toBeUndefined();
    }
  });

  it("rejects empty / too long / illegal characters", () => {
    expect(validateEnglishName("   ")).toBeTruthy();
    expect(validateEnglishName("a".repeat(81))).toBeTruthy();
    expect(validateEnglishName("Alice123")).toBeTruthy();
    expect(validateEnglishName("李伟")).toBeTruthy();
  });

  it("requires all three fields", () => {
    const errors = validateCheckoutForm({
      englishName: "",
      genderPreference: "neutral",
      desiredFeeling: "",
    });
    expect(errors.englishName).toBeTruthy();
    expect(errors.desiredFeeling).toBeTruthy();
    expect(isCheckoutValid(errors)).toBe(false);
  });

  it("passes a complete valid form", () => {
    const errors = validateCheckoutForm({
      englishName: "Elena",
      genderPreference: "feminine",
      desiredFeeling: "calm",
    });
    expect(isCheckoutValid(errors)).toBe(true);
  });
});

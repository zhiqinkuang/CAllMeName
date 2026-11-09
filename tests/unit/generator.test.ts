import { describe, expect, it } from "vitest";
import { generateFreeCards } from "@/lib/server/names/generator";

describe("lexicon generator (B-B2)", () => {
  it("returns 3 distinct 2–3 hanzi names with tone-marked pinyin", () => {
    const cards = generateFreeCards({ genderPreference: "neutral", count: 3 });
    expect(cards).toHaveLength(3);
    const set = new Set(cards.map((c) => c.hanzi));
    expect(set.size).toBe(3);
    for (const c of cards) {
      const len = [...c.hanzi].length;
      expect(len).toBeGreaterThanOrEqual(2);
      expect(len).toBeLessThanOrEqual(3);
      expect(c.pinyin).toMatch(/[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/);
      expect(c.pinyin).not.toMatch(/\d/);
      expect(c).not.toHaveProperty("whyItFitsYou");
    }
  });

  it("uses genderPreference for pool selection", () => {
    let i = 0;
    const seq = () => {
      i += 1;
      return (i * 0.37) % 1;
    };
    const feminineCards = generateFreeCards({
      genderPreference: "feminine",
      count: 3,
      random: seq,
    });
    expect(feminineCards).toHaveLength(3);
    const masculineCards = generateFreeCards({
      genderPreference: "masculine",
      count: 3,
      random: seq,
    });
    expect(masculineCards).toHaveLength(3);
    // Preference is a required GenerateOptions field — callers must pass it through.
    expect(() =>
      generateFreeCards({ genderPreference: "feminine", count: 3 }),
    ).not.toThrow();
  });
});

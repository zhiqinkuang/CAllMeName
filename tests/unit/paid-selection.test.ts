import { describe, expect, it } from "vitest";
import { GIVEN_NAMES } from "@/lib/server/names/corpus/given-names";
import { GIVEN_NAME_TRAITS } from "@/lib/server/names/corpus/given-name-traits";
import { CHARACTER_MEANINGS } from "@/lib/server/names/corpus/meanings";
import { SURNAMES } from "@/lib/server/names/corpus/surnames";
import {
  generateFreeCards,
  generatePaidNameBases,
} from "@/lib/server/names/generator";
import {
  englishSyllables,
  hasGroundedMeanings,
  meaningOverlapScore,
  pinyinSoundScore,
  scoreGivenName,
} from "@/lib/server/names/paid-scoring";

function seeded(seed = 1): () => number {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

const elenaCalm = {
  englishName: "Elena",
  genderPreference: "neutral" as const,
  desiredFeeling: "calm" as const,
};

describe("paid corpus metadata", () => {
  it("tags every lexicon given name with feelings and a gloss", () => {
    for (const given of GIVEN_NAMES) {
      const traits = GIVEN_NAME_TRAITS[given.hanzi];
      expect(traits, given.hanzi).toBeDefined();
      expect(traits!.feelings.length).toBeGreaterThan(0);
      expect(traits!.meaning.length).toBeGreaterThan(0);
    }
  });

  it("has a grounded meaning for every surname and given-name character", () => {
    for (const surname of SURNAMES) {
      expect(CHARACTER_MEANINGS[surname.hanzi], surname.hanzi).toBeDefined();
    }
    for (const given of GIVEN_NAMES) {
      for (const ch of given.hanzi) {
        expect(CHARACTER_MEANINGS[ch], ch).toBeDefined();
      }
    }
  });
});

describe("English-name sound and meaning scoring", () => {
  it("splits Elena into recognizable chunks", () => {
    expect(englishSyllables("elena")).toEqual(["e", "le", "na"]);
  });

  it("scores 娜 and 依琳 as sound links to Elena, not 思远 or 磊", () => {
    expect(pinyinSoundScore("Nà", "Elena")).toBeGreaterThanOrEqual(3);
    expect(pinyinSoundScore("Yīlín", "Elena")).toBeGreaterThanOrEqual(3);
    expect(pinyinSoundScore("Lè", "Elena")).toBeGreaterThanOrEqual(3);
    expect(pinyinSoundScore("Sīyuǎn", "Elena")).toBeLessThan(3);
    expect(pinyinSoundScore("Lěi", "Elena")).toBeLessThan(3);
  });

  it("scores 明 as a meaning link to Elena (light) and 安然 on calm keywords only", () => {
    expect(meaningOverlapScore(["light", "bright", "shining"], "Elena")).toBeGreaterThanOrEqual(3);
    expect(
      meaningOverlapScore(["calm", "ease", "composure", "peace"], "Elena"),
    ).toBe(0);
  });
});

describe("generatePaidNameBases (Elena / neutral / calm)", () => {
  it("returns three lexicon names that are feeling-weighted and English-linked, not transliterations", () => {
    const bases = generatePaidNameBases({
      ...elenaCalm,
      count: 3,
      random: seeded(42),
    });
    expect(bases).toHaveLength(3);
    const lexGivens = new Set(GIVEN_NAMES.map((g) => g.hanzi));
    const lexSurnames = new Set(SURNAMES.map((s) => s.hanzi));
    const transliterations = ["埃琳娜", "伊莲娜", "叶莲娜", "爱丽娜", "艾莉娜"];

    for (const base of bases) {
      const chars = [...base.hanzi];
      expect(chars.length).toBeGreaterThanOrEqual(2);
      expect(chars.length).toBeLessThanOrEqual(3);
      expect(lexSurnames.has(chars[0]!)).toBe(true);
      expect(lexGivens.has(chars.slice(1).join(""))).toBe(true);
      expect(transliterations).not.toContain(base.hanzi);
      expect(hasGroundedMeanings(base.hanzi)).toBe(true);
      expect(base.pinyin).toMatch(/[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/);
    }

    const givenScores = bases.map((base) => {
      const givenHanzi = [...base.hanzi].slice(1).join("");
      const given = GIVEN_NAMES.find((g) => g.hanzi === givenHanzi)!;
      return { base, given, ...scoreGivenName({ given, ...elenaCalm }) };
    });

    // Feeling-weighted: most picks should be tagged calm.
    expect(givenScores.filter((s) => s.feelingWeight >= 4).length).toBeGreaterThanOrEqual(2);
    // Pronunciation OR meaning: at least one of the three has a clear English link.
    expect(givenScores.some((s) => s.englishScore >= 3)).toBe(true);
  });

  it("does not match unweighted free generation with the same random stream", () => {
    const paid = generatePaidNameBases({
      ...elenaCalm,
      count: 3,
      random: seeded(7),
    });
    const free = generateFreeCards({
      genderPreference: "neutral",
      count: 3,
      random: seeded(7),
    });
    expect(paid.map((c) => c.hanzi)).not.toEqual(free.map((c) => c.hanzi));
  });

  it("is deterministic for a fixed random function", () => {
    const a = generatePaidNameBases({ ...elenaCalm, random: seeded(99) });
    const b = generatePaidNameBases({ ...elenaCalm, random: seeded(99) });
    expect(a).toEqual(b);
  });

  it("ranks calm lexicon names above unmatched masculine-strength names for Elena + calm", () => {
    const anran = GIVEN_NAMES.find((g) => g.hanzi === "安然")!;
    const yilin = GIVEN_NAMES.find((g) => g.hanzi === "依琳")!;
    const qiang = GIVEN_NAMES.find((g) => g.hanzi === "强")!;
    const siyuan = GIVEN_NAMES.find((g) => g.hanzi === "思远")!;
    const calm = scoreGivenName({ given: anran, ...elenaCalm });
    const sound = scoreGivenName({ given: yilin, ...elenaCalm });
    const unmatched = scoreGivenName({ given: qiang, ...elenaCalm });
    const scholarly = scoreGivenName({ given: siyuan, ...elenaCalm });
    expect(calm.feelingWeight).toBeGreaterThan(unmatched.feelingWeight);
    expect(sound.englishScore).toBeGreaterThan(scholarly.englishScore);
    expect(calm.weight).toBeGreaterThan(unmatched.weight);
    expect(sound.weight).toBeGreaterThan(unmatched.weight);
  });
});

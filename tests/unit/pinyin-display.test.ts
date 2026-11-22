import { describe, expect, it } from "vitest";
import { GIVEN_NAMES } from "@/lib/server/names/corpus/given-names";
import { SURNAMES } from "@/lib/server/names/corpus/surnames";
import {
  formatPinyinSecondaryRow,
  formatPinyinSpecimen,
  splitPinyinSyllables,
} from "@/lib/pinyin-display";

describe("formatPinyinSpecimen", () => {
  it("formats exhibit homepage names with lowercase, middle dot, and brackets", () => {
    expect(formatPinyinSpecimen("Lín Ānrán")).toBe("[lín · ān rán]");
    expect(formatPinyinSpecimen("Sū Jǐngxíng")).toBe("[sū · jǐng xíng]");
    expect(formatPinyinSpecimen("Shěn Qīngyuè")).toBe("[shěn · qīng yuè]");
  });

  it("formats 段启明 as the exhibit lowercase specimen", () => {
    expect(formatPinyinSpecimen("Duàn Qǐmíng")).toBe("[duàn · qǐ míng]");
  });

  it("keeps a two-character name as surname · given", () => {
    expect(formatPinyinSpecimen("Lǐ Wěi")).toBe("[lǐ · wěi]");
    expect(formatPinyinSpecimen("Wáng Fāng")).toBe("[wáng · fāng]");
  });

  it("is idempotent for already-formatted specimen strings", () => {
    expect(formatPinyinSpecimen("[lín · ān rán]")).toBe("[lín · ān rán]");
  });

  it("splits tightly concatenated given names using valid syllables", () => {
    expect(formatPinyinSpecimen("Wáng Chéngān")).toBe("[wáng · chéng ān]");
    expect(formatPinyinSpecimen("Lǐ Lèān")).toBe("[lǐ · lè ān]");
    expect(formatPinyinSpecimen("Zhāng Xiǎoxuān")).toBe("[zhāng · xiǎo xuān]");
  });
});

describe("formatPinyinSecondaryRow", () => {
  it("keeps a title-case companion after the specimen form", () => {
    expect(formatPinyinSecondaryRow("Sū Jǐngxíng")).toBe(
      "[sū · jǐng xíng] · Sū Jǐngxíng",
    );
    expect(formatPinyinSecondaryRow("Lín Ānrán")).toBe(
      "[lín · ān rán] · Lín Ānrán",
    );
  });
});

describe("lexicon coverage", () => {
  it("segments every stored surname + given name into the expected syllable count", () => {
    const surname = SURNAMES[0]!;
    for (const given of GIVEN_NAMES) {
      const pinyin = `${surname.pinyin} ${given.pinyin}`;
      const syllables = splitPinyinSyllables(pinyin);
      const expected = 1 + [...given.hanzi].length;
      expect(syllables, pinyin).toHaveLength(expected);
      expect(formatPinyinSpecimen(pinyin)).toMatch(/^\[[^\]]+\]$/);
    }
  });
});

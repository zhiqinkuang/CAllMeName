import { describe, expect, it } from "vitest";
import { buildExplainPrompt } from "@/lib/server/llm/anthropic";
import { buildMockExplanation } from "@/lib/server/llm/mock";
import { buildNameExplainContext } from "@/lib/server/names/paid-scoring";
import type { LlmExplainInput } from "@/lib/server/llm/types";

function elenaAnranInput(): LlmExplainInput {
  const ctx = buildNameExplainContext("林安然", "Elena");
  return {
    englishName: "Elena",
    genderPreference: "neutral",
    desiredFeeling: "calm",
    hanzi: "林安然",
    pinyin: "Lín Ānrán",
    phoneticHint: "Lin Anran",
    characterMeanings: ctx.characterMeanings,
    givenMeaning: ctx.givenMeaning,
    englishNameMeanings: ctx.englishNameMeanings,
  };
}

describe("paid explanation prompt and mock", () => {
  it("asks the model to explain character meanings and the English-name + Feeling fit", () => {
    const prompt = buildExplainPrompt(elenaAnranInput());
    expect(prompt).toContain("林安然");
    expect(prompt).toContain("each character's meaning");
    expect(prompt).toContain("pronunciation or meaning");
    expect(prompt).toContain("desiredFeeling: calm");
    expect(prompt).toMatch(/林: forest/);
    expect(prompt).toMatch(/安: peace/);
    expect(prompt).toMatch(/然: as it is/);
    expect(prompt).toContain("feels like a natural Chinese name");
    expect(prompt).toContain("Do NOT write a generic template");
    expect(prompt).toContain("fortune-telling");
  });

  it("writes a contentful mock explanation from grounded meanings, not the old template", () => {
    const out = buildMockExplanation(elenaAnranInput());
    const template =
      "林安然 (Lín Ānrán) feels like a natural Chinese name for Elena, with a calm tone.";
    expect(out.whyItFitsYou).not.toBe(template);
    expect(out.whyItFitsYou).toContain("林安然");
    expect(out.whyItFitsYou).toContain("林");
    expect(out.whyItFitsYou).toContain("forest");
    expect(out.whyItFitsYou).toContain("peace");
    expect(out.whyItFitsYou).toContain("naturally");
    expect(out.whyItFitsYou).toContain("composure and ease");
    expect(out.whyItFitsYou).toContain("Elena");
    expect(out.whyItFitsYou).toMatch(/calm/);
    expect(out.whyItFitsYou).toMatch(/not a transliteration/i);
    expect(out.whyItFitsYou).toMatch(/sound link|composure and ease/);
    expect(out.selfIntroduction).toContain("林安然");
    expect(out.selfIntroduction).toContain("Lín Ānrán");
  });
});

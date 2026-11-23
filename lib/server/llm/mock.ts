import { getGivenTraits, meaningOverlapScore, pinyinSoundScore } from "../names/paid-scoring";
import type { LlmClient, LlmExplainInput, LlmExplainOutput } from "./types";

const FEELING_PHRASE: Record<string, string> = {
  friendly: "friendly, approachable tone",
  calm: "calm, settled tone",
  bright: "bright, open tone",
  elegant: "elegant tone",
  modern: "modern, unfussy tone",
  scholarly: "scholarly, thoughtful tone",
};

function feelingPhrase(feeling: string): string {
  return FEELING_PHRASE[feeling] ?? `${feeling} tone`;
}

function givenHanziOf(full: string): string {
  return [...full].slice(1).join("");
}

function englishFit(input: LlmExplainInput): string {
  const given = givenHanziOf(input.hanzi);
  const traits = getGivenTraits(given);
  const meaningHit = meaningOverlapScore(traits?.keywords ?? [], input.englishName);
  const soundHit = pinyinSoundScore(input.pinyin, input.englishName);
  const shared = (input.englishNameMeanings ?? []).filter((k) =>
    (traits?.keywords ?? []).includes(k),
  );
  const base = `It is a real lexicon name, not a transliteration of ${input.englishName}`;

  if (meaningHit >= 3 && shared.length > 0) {
    return `${base}. The given name also sits near the sense of ${input.englishName} (${shared.slice(0, 3).join(", ")})`;
  }
  if (soundHit >= 3) {
    return `${base}. A syllable in the name has a justifiable sound link to ${input.englishName}, without imitating the whole English name`;
  }
  return `${base}, chosen to sit comfortably beside ${input.englishName}`;
}

function characterClause(input: LlmExplainInput): string {
  const parts = input.characterMeanings.map(
    (c) => `${c.hanzi} (“${c.meaning}”)`,
  );
  if (parts.length === 0) {
    return `${input.hanzi} is a real Chinese name`;
  }
  if (parts.length === 1) {
    return `The character ${parts[0]} is the given name`;
  }
  const surname = parts[0];
  const given = parts.slice(1);
  const givenText =
    given.length === 1 ? given[0] : given.slice(0, -1).join(", ") + ", and " + given[given.length - 1];
  return `${input.hanzi} is built from ${surname} as the surname, and ${givenText} in the given name`;
}

/**
 * Deterministic, contentful mock copy for local / preview (LLM_DRIVER=mock).
 * Uses only grounded character meanings passed in from the lexicon table.
 */
export function buildMockExplanation(input: LlmExplainInput): LlmExplainOutput {
  const compound = input.givenMeaning
    ? ` Together, the given name suggests ${input.givenMeaning}.`
    : "";
  const whyItFitsYou =
    `${characterClause(input)}.${compound} ${englishFit(input)}, and it carries the ${feelingPhrase(input.desiredFeeling)} you asked for.`;
  const selfIntroduction = `Hi, my Chinese name is ${input.hanzi} (${input.pinyin}). You can roughly say it as "${input.phoneticHint}". Nice to meet you!`;
  return { whyItFitsYou, selfIntroduction };
}

export function createMockLlmClient(options?: {
  failTimes?: number;
  timeoutMs?: number;
}): LlmClient & { calls: LlmExplainInput[]; failTimes: number } {
  const state = {
    calls: [] as LlmExplainInput[],
    failTimes: options?.failTimes ?? 0,
  };

  return {
    get calls() {
      return state.calls;
    },
    get failTimes() {
      return state.failTimes;
    },
    set failTimes(n: number) {
      state.failTimes = n;
    },
    async explainName(input): Promise<LlmExplainOutput> {
      state.calls.push(input);
      if (state.failTimes > 0) {
        state.failTimes -= 1;
        throw new Error("mock llm failure");
      }
      return buildMockExplanation(input);
    },
  };
}

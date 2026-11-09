import type { LlmClient, LlmExplainInput, LlmExplainOutput } from "./types";

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
      // Must not rewrite hanzi — echo it in intro
      return {
        whyItFitsYou: `${input.hanzi} (${input.pinyin}) feels like a natural Chinese name for ${input.englishName}, with a ${input.desiredFeeling} tone.`,
        selfIntroduction: `Hi, my Chinese name is ${input.hanzi} (${input.pinyin}). You can roughly say it as "${input.phoneticHint}". Nice to meet you!`,
      };
    },
  };
}

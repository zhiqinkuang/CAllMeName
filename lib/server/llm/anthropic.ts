import Anthropic from "@anthropic-ai/sdk";
import type { LlmClient, LlmExplainInput, LlmExplainOutput } from "./types";

const TIMEOUT_MS = 22_000;

export function createAnthropicLlmClient(config: {
  apiKey: string;
  model: string;
}): LlmClient {
  const client = new Anthropic({ apiKey: config.apiKey });

  return {
    async explainName(input: LlmExplainInput): Promise<LlmExplainOutput> {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
      try {
        const msg = await client.messages.create(
          {
            model: config.model,
            max_tokens: 500,
            messages: [
              {
                role: "user",
                content: `You write short English copy for a Chinese given name product.
Do NOT change the Chinese characters. Do NOT mention bazi, five elements, lucky colors, or fortune-telling.
Return ONLY JSON: {"whyItFitsYou":"...","selfIntroduction":"..."}.

englishName: ${input.englishName}
genderPreference: ${input.genderPreference}
desiredFeeling: ${input.desiredFeeling}
hanzi: ${input.hanzi}
pinyin: ${input.pinyin}
phoneticHint: ${input.phoneticHint}

whyItFitsYou: 1-3 English sentences explaining why this name fits.
selfIntroduction: English line the learner can copy, must include the exact hanzi ${input.hanzi}.`,
              },
            ],
          },
          { signal: controller.signal },
        );
        const text = msg.content
          .filter((b) => b.type === "text")
          .map((b) => (b.type === "text" ? b.text : ""))
          .join("");
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("LLM did not return JSON");
        const parsed = JSON.parse(jsonMatch[0]) as LlmExplainOutput;
        if (!parsed.whyItFitsYou || !parsed.selfIntroduction) {
          throw new Error("LLM JSON missing fields");
        }
        if (
          !parsed.selfIntroduction.includes(input.hanzi) ||
          parsed.whyItFitsYou.includes("八字") ||
          /five elements|lucky color|bazi/i.test(
            parsed.whyItFitsYou + parsed.selfIntroduction,
          )
        ) {
          throw new Error("LLM safety filter");
        }
        return parsed;
      } finally {
        clearTimeout(timer);
      }
    },
  };
}

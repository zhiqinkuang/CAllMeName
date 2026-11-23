import Anthropic from "@anthropic-ai/sdk";
import type { LlmClient, LlmExplainInput, LlmExplainOutput } from "./types";

const TIMEOUT_MS = 22_000;

export function buildExplainPrompt(input: LlmExplainInput): string {
  const characterLines = input.characterMeanings
    .map((c) => `- ${c.hanzi}: ${c.meaning}`)
    .join("\n");
  const givenMeaning = input.givenMeaning
    ? `givenNameMeaning: ${input.givenMeaning}`
    : "givenNameMeaning: (use the character meanings only; do not invent a new compound sense)";
  const englishMeanings =
    input.englishNameMeanings && input.englishNameMeanings.length > 0
      ? `englishNameMeanings: ${input.englishNameMeanings.join(", ")}`
      : "englishNameMeanings: (unknown; you may use pronunciation, but do not invent an etymology)";

  return `You write short, learner-friendly English copy for a Chinese name product.
Do NOT change the Chinese characters. Do NOT mention bazi, five elements, lucky colors, horoscopes, or fortune-telling.
Do NOT write a generic template such as "${input.hanzi} (${input.pinyin}) feels like a natural Chinese name for ${input.englishName}, with a ${input.desiredFeeling} tone."
Use the provided character meanings; do not invent different meanings.

Return ONLY JSON: {"whyItFitsYou":"...","selfIntroduction":"..."}.

englishName: ${input.englishName}
genderPreference: ${input.genderPreference}
desiredFeeling: ${input.desiredFeeling}
hanzi: ${input.hanzi}
pinyin: ${input.pinyin}
phoneticHint: ${input.phoneticHint}
${givenMeaning}
${englishMeanings}

characterMeanings:
${characterLines}

whyItFitsYou: 2-4 English sentences that (1) explain what the name means, including each character's meaning, (2) explain why it fits this person — how it maps to the English name's pronunciation or meaning, AND the selected Feeling. Include the exact hanzi ${input.hanzi}. This is not fortune-telling.

selfIntroduction: One or two English sentences the learner can copy and say aloud. Must include the exact hanzi ${input.hanzi}. If you mention pinyin, keep the title-case tone-marked form.`;
}

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
            max_tokens: 700,
            messages: [
              {
                role: "user",
                content: buildExplainPrompt(input),
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

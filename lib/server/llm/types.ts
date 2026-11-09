export type LlmExplainInput = {
  englishName: string;
  genderPreference: string;
  desiredFeeling: string;
  hanzi: string;
  pinyin: string;
  phoneticHint: string;
};

export type LlmExplainOutput = {
  whyItFitsYou: string;
  selfIntroduction: string;
};

export type LlmClient = {
  explainName(input: LlmExplainInput): Promise<LlmExplainOutput>;
};

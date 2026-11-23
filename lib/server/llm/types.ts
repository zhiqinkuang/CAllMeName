export type LlmCharacterGloss = { hanzi: string; meaning: string };

export type LlmExplainInput = {
  englishName: string;
  genderPreference: string;
  desiredFeeling: string;
  hanzi: string;
  pinyin: string;
  phoneticHint: string;
  /** Grounded per-character glosses from the lexicon meaning table. */
  characterMeanings: LlmCharacterGloss[];
  /** Compound gloss of the given name, when known. */
  givenMeaning?: string | null;
  /** Etymology keywords of the English name, when known. */
  englishNameMeanings?: string[];
};

export type LlmExplainOutput = {
  whyItFitsYou: string;
  selfIntroduction: string;
};

export type LlmClient = {
  explainName(input: LlmExplainInput): Promise<LlmExplainOutput>;
};

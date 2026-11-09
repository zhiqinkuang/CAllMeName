export type SendResultEmailInput = {
  to: string;
  resultUrl: string;
  cards: Array<{
    hanzi: string;
    pinyin: string;
    phoneticHint: string;
    selfIntroduction: string;
  }>;
};

export type EmailClient = {
  sendResultEmail(input: SendResultEmailInput): Promise<void>;
};

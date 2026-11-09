export type GenderPreference = "feminine" | "masculine" | "neutral";
export type DesiredFeeling =
  | "friendly"
  | "calm"
  | "bright"
  | "elegant"
  | "modern"
  | "scholarly";

export type FreeCard = { hanzi: string; pinyin: string };

export type FullCard = {
  hanzi: string;
  pinyin: string;
  phoneticHint: string;
  audioUrl: string | null;
  whyItFitsYou: string;
  selfIntroduction: string;
};

export type ApiErrorBody = {
  error: string;
  message: string;
  retryAfterSeconds?: number;
  fields?: Record<string, string>;
};

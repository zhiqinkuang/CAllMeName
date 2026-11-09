export type NameStyle = "feminine" | "masculine" | "neutral";

export type FreeName = {
  id: "anran" | "jingxing" | "qingyue";
  hanzi: string;
  pinyinBracket: string;
  pinyinRoman: string;
};

export type PaidName = FreeName & {
  why: string;
  introZh: string;
  introEn: string;
  blurb: string;
  phoneticHint: string;
};

export const DEMO_CUSTOMER = {
  englishName: "Elena",
  nameStyle: "feminine" as NameStyle,
  feeling: "calm and clear",
};

export const DEMO_FREE_NAMES: FreeName[] = [
  {
    id: "anran",
    hanzi: "林安然",
    pinyinBracket: "[lín · ān rán]",
    pinyinRoman: "Lín Ānrán",
  },
  {
    id: "jingxing",
    hanzi: "苏景行",
    pinyinBracket: "[sū · jǐng xíng]",
    pinyinRoman: "Sū Jǐngxíng",
  },
  {
    id: "qingyue",
    hanzi: "沈清越",
    pinyinBracket: "[shěn · qīng yuè]",
    pinyinRoman: "Shěn Qīngyuè",
  },
];

export const DEMO_PAID_NAMES: PaidName[] = [
  {
    id: "anran",
    hanzi: "林安然",
    pinyinBracket: "[lín · ān rán]",
    pinyinRoman: "Lín Ānrán",
    phoneticHint: "leen ahn-rahn",
    why: "Elena, you asked for calm and clear. 安然 suggests composure and ease—a name you can settle into when you introduce yourself.",
    introZh: "大家好，我叫 Elena，我的中文名是林安然。请多多指教。",
    introEn:
      "Hello everyone, I'm Elena; my Chinese name is Lín Ānrán. Please take care of me.",
    blurb: "安然 suggests composure and ease—calm you can settle into.",
  },
  {
    id: "jingxing",
    hanzi: "苏景行",
    pinyinBracket: "[sū · jǐng xíng]",
    pinyinRoman: "Sū Jǐngxíng",
    phoneticHint: "soo jing-shing",
    why: "Elena, you asked for calm and clear. 景行 keeps the calm in an open path—clarity without noise, a name that moves forward when you introduce yourself.",
    introZh: "大家好，我叫 Elena，我的中文名是苏景行。请多多指教。",
    introEn:
      "Hello everyone, I'm Elena; my Chinese name is Sū Jǐngxíng. Please take care of me.",
    blurb:
      "景行 evokes an open, forward path—clarity with a quiet sense of moving ahead.",
  },
  {
    id: "qingyue",
    hanzi: "沈清越",
    pinyinBracket: "[shěn · qīng yuè]",
    pinyinRoman: "Shěn Qīngyuè",
    phoneticHint: "shun ching-yweh",
    why: "清越 means clear and far-reaching. Soft enough to feel calm, strong enough to carry across a room when you say your name.",
    introZh: "大家好，我叫 Elena，我的中文名是沈清越。请多多指教。",
    introEn:
      "Hello everyone, I'm Elena; my Chinese name is Shěn Qīngyuè. Please take care of me.",
    blurb:
      "清越 means clear and far-reaching—soft enough to feel calm, strong enough to carry.",
  },
];

export const NAME_STYLE_OPTIONS: { value: NameStyle; label: string }[] = [
  { value: "feminine", label: "Typically feminine" },
  { value: "masculine", label: "Typically masculine" },
  { value: "neutral", label: "Either is fine" },
];

export const FEELING_CHIPS = [
  "Calm",
  "Bright",
  "Warm",
  "Scholarly",
  "Nature-inspired",
  "Modern",
  "Strong",
  "Gentle",
] as const;

export type GeneratorState = "empty" | "generating" | "ready" | "limit";
export type PaperId = "anran" | "jingxing" | "qingyue";

export function parseGeneratorParam(
  value: string | null | undefined,
): GeneratorState | null {
  if (
    value === "empty" ||
    value === "generating" ||
    value === "ready" ||
    value === "limit"
  ) {
    return value;
  }
  return null;
}

export function parsePaperParam(
  value: string | null | undefined,
): PaperId | null {
  if (value === "anran" || value === "jingxing" || value === "qingyue") {
    return value;
  }
  return null;
}

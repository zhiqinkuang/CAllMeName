import type { DesiredFeeling } from "../../types";

export type GivenNameTraits = {
  /** Feeling tags used to weight paid sampling. */
  feelings: DesiredFeeling[];
  /** Short English gloss of the given name as a whole. */
  meaning: string;
  /** Lowercase keywords used to match English-name meanings. */
  keywords: string[];
};

/** Traits for every lexicon given name. Keyed by hanzi. */
export const GIVEN_NAME_TRAITS: Record<string, GivenNameTraits> = {
  芳: {
    feelings: ["elegant"],
    meaning: "fragrance",
    keywords: ["fragrance", "fragrant", "flower"],
  },
  婷: {
    feelings: ["elegant"],
    meaning: "gracefulness",
    keywords: ["graceful", "grace", "elegant"],
  },
  静: {
    feelings: ["calm"],
    meaning: "stillness and quiet",
    keywords: ["calm", "quiet", "still", "peace", "serene"],
  },
  丽: {
    feelings: ["elegant"],
    meaning: "beauty",
    keywords: ["beautiful", "beauty", "grace"],
  },
  娜: {
    feelings: ["elegant", "friendly"],
    meaning: "gracefulness",
    keywords: ["graceful", "grace", "elegant"],
  },
  雪: {
    feelings: ["elegant", "calm"],
    meaning: "snow",
    keywords: ["snow", "pure", "white", "winter"],
  },
  梅: {
    feelings: ["elegant"],
    meaning: "the plum blossom",
    keywords: ["plum", "flower", "blossom"],
  },
  慧: {
    feelings: ["scholarly", "elegant"],
    meaning: "wisdom",
    keywords: ["wisdom", "wise", "intelligence"],
  },
  欣: {
    feelings: ["bright", "friendly"],
    meaning: "gladness",
    keywords: ["gladness", "joy", "happy", "bright"],
  },
  悦: {
    feelings: ["bright", "friendly"],
    meaning: "delight",
    keywords: ["delight", "joy", "happy"],
  },
  诗涵: {
    feelings: ["scholarly", "elegant"],
    meaning: "a cultivated poetic inner life",
    keywords: ["poetry", "cultivated", "literary"],
  },
  雨桐: {
    feelings: ["elegant", "calm"],
    meaning: "rain and the paulownia tree",
    keywords: ["rain", "tree", "gentle"],
  },
  思琪: {
    feelings: ["scholarly", "modern"],
    meaning: "thoughtful fine jade",
    keywords: ["thought", "jade", "precious stone"],
  },
  梦瑶: {
    feelings: ["elegant"],
    meaning: "a dream of precious jade",
    keywords: ["dream", "jade", "precious stone"],
  },
  婉清: {
    feelings: ["elegant", "calm"],
    meaning: "gentle clarity",
    keywords: ["gentle", "clear", "graceful", "calm", "pure"],
  },
  雅琴: {
    feelings: ["elegant", "scholarly"],
    meaning: "an elegant zither",
    keywords: ["elegant", "grace", "music", "zither"],
  },
  晓萱: {
    feelings: ["bright", "elegant"],
    meaning: "dawn and the daylily",
    keywords: ["dawn", "light", "bright", "flower"],
  },
  若曦: {
    feelings: ["bright", "modern"],
    meaning: "like sunlight",
    keywords: ["sunlight", "light", "bright", "sun", "shining"],
  },
  安然: {
    feelings: ["calm"],
    meaning: "composure and ease",
    keywords: ["calm", "ease", "composure", "peace", "serene", "gentle"],
  },
  清扬: {
    feelings: ["elegant", "calm"],
    meaning: "clear and rising",
    keywords: ["clear", "pure", "rising", "bright"],
  },
  语嫣: {
    feelings: ["elegant"],
    meaning: "charming speech",
    keywords: ["charming", "speech", "grace"],
  },
  心怡: {
    feelings: ["friendly", "calm"],
    meaning: "a heart at ease",
    keywords: ["ease", "joy", "heart", "calm", "peace"],
  },
  佳宁: {
    feelings: ["friendly", "calm"],
    meaning: "fine and tranquil",
    keywords: ["tranquil", "peace", "calm", "fine"],
  },
  可欣: {
    feelings: ["friendly", "bright"],
    meaning: "worthy of gladness",
    keywords: ["gladness", "joy", "worthy"],
  },
  依琳: {
    feelings: ["elegant", "modern"],
    meaning: "leaning close to beautiful jade",
    keywords: ["jade", "precious stone", "grace", "close"],
  },
  雨萱: {
    feelings: ["elegant", "calm"],
    meaning: "rain and the daylily",
    keywords: ["rain", "flower", "gentle"],
  },
  芷若: {
    feelings: ["elegant"],
    meaning: "like a fragrant herb",
    keywords: ["fragrance", "fragrant", "herb", "grace"],
  },
  书瑶: {
    feelings: ["scholarly", "elegant"],
    meaning: "books and precious jade",
    keywords: ["books", "jade", "literary", "wisdom"],
  },
  明珠: {
    feelings: ["bright", "elegant"],
    meaning: "a bright pearl",
    keywords: ["light", "bright", "pearl", "shining", "brightness"],
  },
  柔安: {
    feelings: ["calm", "elegant"],
    meaning: "gentle peace",
    keywords: ["gentle", "peace", "calm", "ease", "serene"],
  },
  伟: {
    feelings: ["modern"],
    meaning: "greatness",
    keywords: ["greatness", "great", "strong"],
  },
  强: {
    feelings: ["modern"],
    meaning: "strength",
    keywords: ["strong", "strength"],
  },
  磊: {
    feelings: ["scholarly"],
    meaning: "an open, upright character",
    keywords: ["upright", "open", "honest"],
  },
  勇: {
    feelings: ["bright"],
    meaning: "courage",
    keywords: ["brave", "courage", "bold"],
  },
  军: {
    feelings: ["modern"],
    meaning: "an army",
    keywords: ["army", "martial"],
  },
  浩: {
    feelings: ["bright"],
    meaning: "vastness",
    keywords: ["vast", "great", "wide"],
  },
  鹏: {
    feelings: ["bright", "modern"],
    meaning: "a bird of great range",
    keywords: ["bird", "vast", "range"],
  },
  杰: {
    feelings: ["bright", "modern"],
    meaning: "outstanding character",
    keywords: ["outstanding", "excellent"],
  },
  峰: {
    feelings: ["modern"],
    meaning: "a mountain peak",
    keywords: ["peak", "mountain"],
  },
  涛: {
    feelings: ["bright"],
    meaning: "billowing waves",
    keywords: ["waves", "water", "sea"],
  },
  浩然: {
    feelings: ["bright", "scholarly"],
    meaning: "a vast, upright spirit",
    keywords: ["vast", "upright", "spirit"],
  },
  子轩: {
    feelings: ["modern"],
    meaning: "a lofty bearing",
    keywords: ["lofty", "high"],
  },
  明轩: {
    feelings: ["bright", "modern"],
    meaning: "bright and lofty",
    keywords: ["light", "bright", "shining", "brightness", "lofty"],
  },
  志强: {
    feelings: ["modern"],
    meaning: "a strong will",
    keywords: ["will", "strong", "aspiration"],
  },
  俊杰: {
    feelings: ["bright", "modern"],
    meaning: "talent and outstanding character",
    keywords: ["talented", "outstanding"],
  },
  文博: {
    feelings: ["scholarly"],
    meaning: "broad learning",
    keywords: ["learning", "wisdom", "literature", "knowledge"],
  },
  嘉诚: {
    feelings: ["friendly", "scholarly"],
    meaning: "excellence and sincerity",
    keywords: ["sincere", "excellent", "honest"],
  },
  宇轩: {
    feelings: ["modern"],
    meaning: "a vast and lofty bearing",
    keywords: ["lofty", "vast"],
  },
  天佑: {
    feelings: ["friendly"],
    meaning: "protected from above",
    keywords: ["protect", "protector", "guardian"],
  },
  立恒: {
    feelings: ["scholarly"],
    meaning: "established and lasting",
    keywords: ["lasting", "constant", "steadfast"],
  },
  永康: {
    feelings: ["friendly"],
    meaning: "lasting well-being",
    keywords: ["health", "lasting", "well-being"],
  },
  建华: {
    feelings: ["modern"],
    meaning: "to build splendor",
    keywords: ["build", "splendor"],
  },
  泽宇: {
    feelings: ["modern", "friendly"],
    meaning: "grace that fills a wide world",
    keywords: ["grace", "favor", "vast"],
  },
  正阳: {
    feelings: ["bright"],
    meaning: "the upright sun",
    keywords: ["sun", "light", "bright", "upright", "shining"],
  },
  思远: {
    feelings: ["scholarly"],
    meaning: "far-reaching thought",
    keywords: ["thought", "far-reaching", "wisdom"],
  },
  鸿飞: {
    feelings: ["bright", "modern"],
    meaning: "a great bird in flight",
    keywords: ["bird", "flight", "vast"],
  },
  景行: {
    feelings: ["scholarly", "calm"],
    meaning: "a bright, open path of conduct",
    keywords: ["bright", "path", "conduct", "clear", "upright"],
  },
  德明: {
    feelings: ["scholarly", "bright"],
    meaning: "virtue and light",
    keywords: ["virtue", "light", "bright", "shining", "brightness"],
  },
  一鸣: {
    feelings: ["bright"],
    meaning: "to resound as one",
    keywords: ["resound", "bright"],
  },
  启明: {
    feelings: ["bright"],
    meaning: "to bring forth light",
    keywords: ["light", "bright", "shining", "torch", "brightness", "dawn"],
  },
  安: {
    feelings: ["calm"],
    meaning: "peace",
    keywords: ["peace", "calm", "ease", "serene"],
  },
  平: {
    feelings: ["calm", "friendly"],
    meaning: "peace and evenness",
    keywords: ["peace", "calm", "even"],
  },
  明: {
    feelings: ["bright"],
    meaning: "light and brightness",
    keywords: ["light", "bright", "shining", "torch", "brightness"],
  },
  乐: {
    feelings: ["friendly", "bright"],
    meaning: "joy",
    keywords: ["joy", "happy", "delight"],
  },
  然: {
    feelings: ["calm"],
    meaning: "being as one naturally is",
    keywords: ["natural", "calm", "ease"],
  },
  辰: {
    feelings: ["modern", "scholarly"],
    meaning: "a celestial time-mark",
    keywords: ["star", "time", "celestial"],
  },
  言: {
    feelings: ["scholarly"],
    meaning: "speech and words",
    keywords: ["speech", "words"],
  },
  行: {
    feelings: ["scholarly", "modern"],
    meaning: "conduct; to walk a path",
    keywords: ["conduct", "path", "walk"],
  },
  知: {
    feelings: ["scholarly"],
    meaning: "knowing",
    keywords: ["knowledge", "wisdom", "to know"],
  },
  远: {
    feelings: ["scholarly"],
    meaning: "a far reach",
    keywords: ["far-reaching", "distant"],
  },
  清平: {
    feelings: ["calm"],
    meaning: "clear and peaceful",
    keywords: ["clear", "peace", "calm", "pure"],
  },
  明远: {
    feelings: ["scholarly", "bright"],
    meaning: "bright and far-reaching",
    keywords: ["light", "bright", "shining", "brightness", "far-reaching"],
  },
  知行: {
    feelings: ["scholarly"],
    meaning: "knowing and doing",
    keywords: ["knowledge", "conduct", "wisdom"],
  },
  一然: {
    feelings: ["calm"],
    meaning: "of one natural piece",
    keywords: ["natural", "calm", "ease"],
  },
  景然: {
    feelings: ["calm", "scholarly"],
    meaning: "composed brightness",
    keywords: ["bright", "calm", "composure", "clear"],
  },
  书涵: {
    feelings: ["scholarly"],
    meaning: "a cultivated life of books",
    keywords: ["books", "literary", "cultivated", "wisdom"],
  },
  文轩: {
    feelings: ["scholarly", "modern"],
    meaning: "a literary, lofty bearing",
    keywords: ["literary", "lofty", "culture"],
  },
  嘉言: {
    feelings: ["scholarly", "friendly"],
    meaning: "fine words",
    keywords: ["words", "speech", "excellent"],
  },
  立言: {
    feelings: ["scholarly"],
    meaning: "to establish one's words",
    keywords: ["words", "speech", "establish"],
  },
  启程: {
    feelings: ["modern"],
    meaning: "to set out on a journey",
    keywords: ["journey", "path", "beginning"],
  },
  向阳: {
    feelings: ["bright"],
    meaning: "toward the sun",
    keywords: ["sun", "light", "bright", "shining"],
  },
  乐安: {
    feelings: ["friendly", "calm"],
    meaning: "joyful peace",
    keywords: ["joy", "peace", "calm", "happy"],
  },
  云舟: {
    feelings: ["modern", "calm"],
    meaning: "a boat among the clouds",
    keywords: ["cloud", "boat", "calm"],
  },
  清和: {
    feelings: ["calm", "elegant"],
    meaning: "clear and harmonious",
    keywords: ["clear", "harmony", "calm", "peace", "pure"],
  },
  明哲: {
    feelings: ["scholarly"],
    meaning: "bright wisdom",
    keywords: ["wisdom", "light", "bright", "knowledge"],
  },
  思源: {
    feelings: ["scholarly"],
    meaning: "to remember the source",
    keywords: ["source", "origin", "thought"],
  },
  承安: {
    feelings: ["calm"],
    meaning: "to carry peace forward",
    keywords: ["peace", "calm", "carry"],
  },
  正心: {
    feelings: ["scholarly"],
    meaning: "an upright heart",
    keywords: ["upright", "heart", "honest"],
  },
  致远: {
    feelings: ["scholarly"],
    meaning: "to reach far",
    keywords: ["far-reaching", "devote"],
  },
};


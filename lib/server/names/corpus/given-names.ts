import type { GenderPreference } from "../../types";

export type GivenNameEntry = {
  hanzi: string;
  pinyin: string;
  /** Name-style tags this entry fits. */
  styles: GenderPreference[];
};

/** Self-built allow-list — not scraped from commercial naming sites. */
export const GIVEN_NAMES: GivenNameEntry[] = [
  {
    "hanzi": "芳",
    "pinyin": "Fāng",
    "styles": [
      "feminine",
      "neutral"
    ]
  },
  {
    "hanzi": "婷",
    "pinyin": "Tíng",
    "styles": [
      "feminine",
      "neutral"
    ]
  },
  {
    "hanzi": "静",
    "pinyin": "Jìng",
    "styles": [
      "feminine",
      "neutral"
    ]
  },
  {
    "hanzi": "丽",
    "pinyin": "Lì",
    "styles": [
      "feminine",
      "neutral"
    ]
  },
  {
    "hanzi": "娜",
    "pinyin": "Nà",
    "styles": [
      "feminine",
      "neutral"
    ]
  },
  {
    "hanzi": "雪",
    "pinyin": "Xuě",
    "styles": [
      "feminine",
      "neutral"
    ]
  },
  {
    "hanzi": "梅",
    "pinyin": "Méi",
    "styles": [
      "feminine",
      "neutral"
    ]
  },
  {
    "hanzi": "慧",
    "pinyin": "Huì",
    "styles": [
      "feminine",
      "neutral"
    ]
  },
  {
    "hanzi": "欣",
    "pinyin": "Xīn",
    "styles": [
      "feminine",
      "neutral"
    ]
  },
  {
    "hanzi": "悦",
    "pinyin": "Yuè",
    "styles": [
      "feminine",
      "neutral"
    ]
  },
  {
    "hanzi": "诗涵",
    "pinyin": "Shīhán",
    "styles": [
      "feminine",
      "neutral"
    ]
  },
  {
    "hanzi": "雨桐",
    "pinyin": "Yǔtóng",
    "styles": [
      "feminine",
      "neutral"
    ]
  },
  {
    "hanzi": "思琪",
    "pinyin": "Sīqí",
    "styles": [
      "feminine",
      "neutral"
    ]
  },
  {
    "hanzi": "梦瑶",
    "pinyin": "Mèngyáo",
    "styles": [
      "feminine",
      "neutral"
    ]
  },
  {
    "hanzi": "婉清",
    "pinyin": "Wǎnqīng",
    "styles": [
      "feminine",
      "neutral"
    ]
  },
  {
    "hanzi": "雅琴",
    "pinyin": "Yǎqín",
    "styles": [
      "feminine",
      "neutral"
    ]
  },
  {
    "hanzi": "晓萱",
    "pinyin": "Xiǎoxuān",
    "styles": [
      "feminine",
      "neutral"
    ]
  },
  {
    "hanzi": "若曦",
    "pinyin": "Ruòxī",
    "styles": [
      "feminine",
      "neutral"
    ]
  },
  {
    "hanzi": "安然",
    "pinyin": "Ānrán",
    "styles": [
      "feminine",
      "neutral"
    ]
  },
  {
    "hanzi": "清扬",
    "pinyin": "Qīngyáng",
    "styles": [
      "feminine",
      "neutral"
    ]
  },
  {
    "hanzi": "语嫣",
    "pinyin": "Yǔyān",
    "styles": [
      "feminine",
      "neutral"
    ]
  },
  {
    "hanzi": "心怡",
    "pinyin": "Xīnyí",
    "styles": [
      "feminine",
      "neutral"
    ]
  },
  {
    "hanzi": "佳宁",
    "pinyin": "Jiāníng",
    "styles": [
      "feminine",
      "neutral"
    ]
  },
  {
    "hanzi": "可欣",
    "pinyin": "Kěxīn",
    "styles": [
      "feminine",
      "neutral"
    ]
  },
  {
    "hanzi": "依琳",
    "pinyin": "Yīlín",
    "styles": [
      "feminine",
      "neutral"
    ]
  },
  {
    "hanzi": "雨萱",
    "pinyin": "Yǔxuān",
    "styles": [
      "feminine",
      "neutral"
    ]
  },
  {
    "hanzi": "芷若",
    "pinyin": "Zhǐruò",
    "styles": [
      "feminine",
      "neutral"
    ]
  },
  {
    "hanzi": "书瑶",
    "pinyin": "Shūyáo",
    "styles": [
      "feminine",
      "neutral"
    ]
  },
  {
    "hanzi": "明珠",
    "pinyin": "Míngzhū",
    "styles": [
      "feminine",
      "neutral"
    ]
  },
  {
    "hanzi": "柔安",
    "pinyin": "Róuān",
    "styles": [
      "feminine",
      "neutral"
    ]
  },
  {
    "hanzi": "伟",
    "pinyin": "Wěi",
    "styles": [
      "masculine",
      "neutral"
    ]
  },
  {
    "hanzi": "强",
    "pinyin": "Qiáng",
    "styles": [
      "masculine",
      "neutral"
    ]
  },
  {
    "hanzi": "磊",
    "pinyin": "Lěi",
    "styles": [
      "masculine",
      "neutral"
    ]
  },
  {
    "hanzi": "勇",
    "pinyin": "Yǒng",
    "styles": [
      "masculine",
      "neutral"
    ]
  },
  {
    "hanzi": "军",
    "pinyin": "Jūn",
    "styles": [
      "masculine",
      "neutral"
    ]
  },
  {
    "hanzi": "浩",
    "pinyin": "Hào",
    "styles": [
      "masculine",
      "neutral"
    ]
  },
  {
    "hanzi": "鹏",
    "pinyin": "Péng",
    "styles": [
      "masculine",
      "neutral"
    ]
  },
  {
    "hanzi": "杰",
    "pinyin": "Jié",
    "styles": [
      "masculine",
      "neutral"
    ]
  },
  {
    "hanzi": "峰",
    "pinyin": "Fēng",
    "styles": [
      "masculine",
      "neutral"
    ]
  },
  {
    "hanzi": "涛",
    "pinyin": "Tāo",
    "styles": [
      "masculine",
      "neutral"
    ]
  },
  {
    "hanzi": "浩然",
    "pinyin": "Hàorán",
    "styles": [
      "masculine",
      "neutral"
    ]
  },
  {
    "hanzi": "子轩",
    "pinyin": "Zǐxuān",
    "styles": [
      "masculine",
      "neutral"
    ]
  },
  {
    "hanzi": "明轩",
    "pinyin": "Míngxuān",
    "styles": [
      "masculine",
      "neutral"
    ]
  },
  {
    "hanzi": "志强",
    "pinyin": "Zhìqiáng",
    "styles": [
      "masculine",
      "neutral"
    ]
  },
  {
    "hanzi": "俊杰",
    "pinyin": "Jùnjié",
    "styles": [
      "masculine",
      "neutral"
    ]
  },
  {
    "hanzi": "文博",
    "pinyin": "Wénbó",
    "styles": [
      "masculine",
      "neutral"
    ]
  },
  {
    "hanzi": "嘉诚",
    "pinyin": "Jiāchéng",
    "styles": [
      "masculine",
      "neutral"
    ]
  },
  {
    "hanzi": "宇轩",
    "pinyin": "Yǔxuān",
    "styles": [
      "masculine",
      "neutral"
    ]
  },
  {
    "hanzi": "天佑",
    "pinyin": "Tiānyòu",
    "styles": [
      "masculine",
      "neutral"
    ]
  },
  {
    "hanzi": "立恒",
    "pinyin": "Lìhéng",
    "styles": [
      "masculine",
      "neutral"
    ]
  },
  {
    "hanzi": "永康",
    "pinyin": "Yǒngkāng",
    "styles": [
      "masculine",
      "neutral"
    ]
  },
  {
    "hanzi": "建华",
    "pinyin": "Jiànhuá",
    "styles": [
      "masculine",
      "neutral"
    ]
  },
  {
    "hanzi": "泽宇",
    "pinyin": "Zéyǔ",
    "styles": [
      "masculine",
      "neutral"
    ]
  },
  {
    "hanzi": "正阳",
    "pinyin": "Zhèngyáng",
    "styles": [
      "masculine",
      "neutral"
    ]
  },
  {
    "hanzi": "思远",
    "pinyin": "Sīyuǎn",
    "styles": [
      "masculine",
      "neutral"
    ]
  },
  {
    "hanzi": "鸿飞",
    "pinyin": "Hóngfēi",
    "styles": [
      "masculine",
      "neutral"
    ]
  },
  {
    "hanzi": "景行",
    "pinyin": "Jǐngxíng",
    "styles": [
      "masculine",
      "neutral"
    ]
  },
  {
    "hanzi": "德明",
    "pinyin": "Démíng",
    "styles": [
      "masculine",
      "neutral"
    ]
  },
  {
    "hanzi": "一鸣",
    "pinyin": "Yīmíng",
    "styles": [
      "masculine",
      "neutral"
    ]
  },
  {
    "hanzi": "启明",
    "pinyin": "Qǐmíng",
    "styles": [
      "masculine",
      "neutral"
    ]
  },
  {
    "hanzi": "安",
    "pinyin": "Ān",
    "styles": [
      "neutral",
      "feminine",
      "masculine"
    ]
  },
  {
    "hanzi": "平",
    "pinyin": "Píng",
    "styles": [
      "neutral",
      "feminine",
      "masculine"
    ]
  },
  {
    "hanzi": "明",
    "pinyin": "Míng",
    "styles": [
      "neutral",
      "feminine",
      "masculine"
    ]
  },
  {
    "hanzi": "乐",
    "pinyin": "Lè",
    "styles": [
      "neutral",
      "feminine",
      "masculine"
    ]
  },
  {
    "hanzi": "然",
    "pinyin": "Rán",
    "styles": [
      "neutral",
      "feminine",
      "masculine"
    ]
  },
  {
    "hanzi": "辰",
    "pinyin": "Chén",
    "styles": [
      "neutral",
      "feminine",
      "masculine"
    ]
  },
  {
    "hanzi": "言",
    "pinyin": "Yán",
    "styles": [
      "neutral",
      "feminine",
      "masculine"
    ]
  },
  {
    "hanzi": "行",
    "pinyin": "Xíng",
    "styles": [
      "neutral",
      "feminine",
      "masculine"
    ]
  },
  {
    "hanzi": "知",
    "pinyin": "Zhī",
    "styles": [
      "neutral",
      "feminine",
      "masculine"
    ]
  },
  {
    "hanzi": "远",
    "pinyin": "Yuǎn",
    "styles": [
      "neutral",
      "feminine",
      "masculine"
    ]
  },
  {
    "hanzi": "安然",
    "pinyin": "Ānrán",
    "styles": [
      "neutral",
      "feminine",
      "masculine"
    ]
  },
  {
    "hanzi": "清平",
    "pinyin": "Qīngpíng",
    "styles": [
      "neutral",
      "feminine",
      "masculine"
    ]
  },
  {
    "hanzi": "明远",
    "pinyin": "Míngyuǎn",
    "styles": [
      "neutral",
      "feminine",
      "masculine"
    ]
  },
  {
    "hanzi": "知行",
    "pinyin": "Zhīxíng",
    "styles": [
      "neutral",
      "feminine",
      "masculine"
    ]
  },
  {
    "hanzi": "一然",
    "pinyin": "Yīrán",
    "styles": [
      "neutral",
      "feminine",
      "masculine"
    ]
  },
  {
    "hanzi": "景然",
    "pinyin": "Jǐngrán",
    "styles": [
      "neutral",
      "feminine",
      "masculine"
    ]
  },
  {
    "hanzi": "书涵",
    "pinyin": "Shūhán",
    "styles": [
      "neutral",
      "feminine",
      "masculine"
    ]
  },
  {
    "hanzi": "文轩",
    "pinyin": "Wénxuān",
    "styles": [
      "neutral",
      "feminine",
      "masculine"
    ]
  },
  {
    "hanzi": "嘉言",
    "pinyin": "Jiāyán",
    "styles": [
      "neutral",
      "feminine",
      "masculine"
    ]
  },
  {
    "hanzi": "立言",
    "pinyin": "Lìyán",
    "styles": [
      "neutral",
      "feminine",
      "masculine"
    ]
  },
  {
    "hanzi": "启程",
    "pinyin": "Qǐchéng",
    "styles": [
      "neutral",
      "feminine",
      "masculine"
    ]
  },
  {
    "hanzi": "向阳",
    "pinyin": "Xiàngyáng",
    "styles": [
      "neutral",
      "feminine",
      "masculine"
    ]
  },
  {
    "hanzi": "乐安",
    "pinyin": "Lèān",
    "styles": [
      "neutral",
      "feminine",
      "masculine"
    ]
  },
  {
    "hanzi": "云舟",
    "pinyin": "Yúnzhōu",
    "styles": [
      "neutral",
      "feminine",
      "masculine"
    ]
  },
  {
    "hanzi": "清和",
    "pinyin": "Qīnghé",
    "styles": [
      "neutral",
      "feminine",
      "masculine"
    ]
  },
  {
    "hanzi": "明哲",
    "pinyin": "Míngzhé",
    "styles": [
      "neutral",
      "feminine",
      "masculine"
    ]
  },
  {
    "hanzi": "思源",
    "pinyin": "Sīyuán",
    "styles": [
      "neutral",
      "feminine",
      "masculine"
    ]
  },
  {
    "hanzi": "承安",
    "pinyin": "Chéngān",
    "styles": [
      "neutral",
      "feminine",
      "masculine"
    ]
  },
  {
    "hanzi": "正心",
    "pinyin": "Zhèngxīn",
    "styles": [
      "neutral",
      "feminine",
      "masculine"
    ]
  },
  {
    "hanzi": "致远",
    "pinyin": "Zhìyuǎn",
    "styles": [
      "neutral",
      "feminine",
      "masculine"
    ]
  }
];

/**
 * Display helpers for exhibit-style pinyin annotation.
 * API / stored pinyin stays tone-marked title case (e.g. "Lín Ānrán").
 */

const SYLLABLES = new Set<string>([
  'a', 'ai', 'an', 'ang', 'ao', 'ba', 'bai', 'ban', 'bang', 'bao', 'bei', 'ben', 'beng', 'bi', 'bian', 'biao', 'bie', 'bin', 'bing', 'bo', 'bu', 'ca', 'cai', 'can', 'cang', 'cao', 'ce', 'cei', 'cen', 'ceng', 'cha', 'chai', 'chan', 'chang', 'chao', 'che', 'chen', 'cheng', 'chi', 'chong', 'chou', 'chu', 'chua', 'chuai', 'chuan', 'chuang', 'chui', 'chun', 'chuo', 'ci', 'cong', 'cou', 'cu', 'cuan', 'cui', 'cun', 'cuo', 'da', 'dai', 'dan', 'dang', 'dao', 'de', 'dei', 'den', 'deng', 'di', 'dia', 'dian', 'diao', 'die', 'ding', 'diu', 'dong', 'dou', 'du', 'duan', 'dui', 'dun', 'duo', 'e', 'ei', 'en', 'eng', 'er', 'fa', 'fan', 'fang', 'fei', 'fen', 'feng', 'fo', 'fou', 'fu', 'ga', 'gai', 'gan', 'gang', 'gao', 'ge', 'gei', 'gen', 'geng', 'gong', 'gou', 'gu', 'gua', 'guai', 'guan', 'guang', 'gui', 'gun', 'guo', 'ha', 'hai', 'han', 'hang', 'hao', 'he', 'hei', 'hen', 'heng', 'hong', 'hou', 'hu', 'hua', 'huai', 'huan', 'huang', 'hui', 'hun', 'huo', 'ji', 'jia', 'jian', 'jiang', 'jiao', 'jie', 'jin', 'jing', 'jiong', 'jiu', 'ju', 'juan', 'jue', 'jun', 'ka', 'kai', 'kan', 'kang', 'kao', 'ke', 'kei', 'ken', 'keng', 'kong', 'kou', 'ku', 'kua', 'kuai', 'kuan', 'kuang', 'kui', 'kun', 'kuo', 'la', 'lai', 'lan', 'lang', 'lao', 'le', 'lei', 'leng', 'li', 'lia', 'lian', 'liang', 'liao', 'lie', 'lin', 'ling', 'liu', 'lo', 'long', 'lou', 'lu', 'lu:', 'lu:e', 'luan', 'lun', 'luo', 'lv', 'lve', 'lü', 'lüe', 'ma', 'mai', 'man', 'mang', 'mao', 'me', 'mei', 'men', 'meng', 'mi', 'mian', 'miao', 'mie', 'min', 'ming', 'miu', 'mo', 'mou', 'mu', 'na', 'nai', 'nan', 'nang', 'nao', 'ne', 'nei', 'nen', 'neng', 'ni', 'nian', 'niang', 'niao', 'nie', 'nin', 'ning', 'niu', 'nong', 'nou', 'nu', 'nu:', 'nu:e', 'nuan', 'nun', 'nuo', 'nv', 'nve', 'nü', 'nüe', 'o', 'ou', 'pa', 'pai', 'pan', 'pang', 'pao', 'pei', 'pen', 'peng', 'pi', 'pian', 'piao', 'pie', 'pin', 'ping', 'po', 'pou', 'pu', 'qi', 'qia', 'qian', 'qiang', 'qiao', 'qie', 'qin', 'qing', 'qiong', 'qiu', 'qu', 'quan', 'que', 'qun', 'ran', 'rang', 'rao', 're', 'ren', 'reng', 'ri', 'rong', 'rou', 'ru', 'rua', 'ruan', 'rui', 'run', 'ruo', 'sa', 'sai', 'san', 'sang', 'sao', 'se', 'sen', 'seng', 'sha', 'shai', 'shan', 'shang', 'shao', 'she', 'shei', 'shen', 'sheng', 'shi', 'shou', 'shu', 'shua', 'shuai', 'shuan', 'shuang', 'shui', 'shun', 'shuo', 'si', 'song', 'sou', 'su', 'suan', 'sui', 'sun', 'suo', 'ta', 'tai', 'tan', 'tang', 'tao', 'te', 'tei', 'teng', 'ti', 'tian', 'tiao', 'tie', 'ting', 'tong', 'tou', 'tu', 'tuan', 'tui', 'tun', 'tuo', 'wa', 'wai', 'wan', 'wang', 'wei', 'wen', 'weng', 'wo', 'wu', 'xi', 'xia', 'xian', 'xiang', 'xiao', 'xie', 'xin', 'xing', 'xiong', 'xiu', 'xu', 'xuan', 'xue', 'xun', 'ya', 'yan', 'yang', 'yao', 'ye', 'yi', 'yin', 'ying', 'yo', 'yong', 'you', 'yu', 'yuan', 'yue', 'yun', 'za', 'zai', 'zan', 'zang', 'zao', 'ze', 'zei', 'zen', 'zeng', 'zha', 'zhai', 'zhan', 'zhang', 'zhao', 'zhe', 'zhei', 'zhen', 'zheng', 'zhi', 'zhong', 'zhou', 'zhu', 'zhua', 'zhuai', 'zhuan', 'zhuang', 'zhui', 'zhun', 'zhuo', 'zi', 'zong', 'zou', 'zu', 'zuan', 'zui', 'zun', 'zuo'
]);

const TONE_TO_BASE: Record<string, string> = {
  ā: "a",
  á: "a",
  ǎ: "a",
  à: "a",
  ē: "e",
  é: "e",
  ě: "e",
  è: "e",
  ī: "i",
  í: "i",
  ǐ: "i",
  ì: "i",
  ō: "o",
  ó: "o",
  ǒ: "o",
  ò: "o",
  ū: "u",
  ú: "u",
  ǔ: "u",
  ù: "u",
  ǖ: "v",
  ǘ: "v",
  ǚ: "v",
  ǜ: "v",
  ü: "v",
};

function foldSyllable(input: string): string {
  return [...input.toLowerCase()]
    .map((ch) => TONE_TO_BASE[ch] ?? ch)
    .join("")
    .replace(/ü/g, "v")
    .replace(/u:/g, "v");
}

function isLatinToken(token: string): boolean {
  return /^[\p{Script=Latin}üÜǖǘǚǜ:]+$/u.test(token);
}

function segmentToken(token: string): string[] {
  const lower = token.toLowerCase();
  if (!isLatinToken(lower)) return [lower];
  const folded = foldSyllable(lower);
  if (SYLLABLES.has(folded)) return [lower];

  const parts = segmentFolded(folded);
  if (!parts) return [lower];

  const out: string[] = [];
  let cursor = 0;
  for (const piece of parts) {
    const next = cursor + piece.length;
    out.push(lower.slice(cursor, next));
    cursor = next;
  }
  return out;
}

function segmentFolded(folded: string): string[] | null {
  const memo = new Map<number, string[] | null>();

  function walk(start: number): string[] | null {
    if (start === folded.length) return [];
    const cached = memo.get(start);
    if (cached !== undefined) return cached;

    let best: string[] | null = null;
    for (let end = folded.length; end > start; end--) {
      const slice = folded.slice(start, end);
      if (!SYLLABLES.has(slice)) continue;
      const rest = walk(end);
      if (!rest) continue;
      best = [slice, ...rest];
      break; // longest match first
    }
    memo.set(start, best);
    return best;
  }

  return walk(0);
}

/** Lowercase tone-marked syllables, surname first. */
export function splitPinyinSyllables(pinyin: string): string[] {
  const trimmed = pinyin.trim().replace(/^\[+/, "").replace(/\]+$/, "");
  if (!trimmed) return [];
  const tokens = trimmed
    .split(/[·•\s]+/u)
    .map((t) => t.trim())
    .filter(Boolean);
  return tokens.flatMap(segmentToken);
}

/**
 * Homepage / primary-paper annotation: `[lín · ān rán]`.
 * Middle dot after the surname; spaces between given-name syllables.
 */
export function formatPinyinSpecimen(pinyin: string): string {
  const syllables = splitPinyinSyllables(pinyin);
  if (syllables.length === 0) return "";
  if (syllables.length === 1) return `[${syllables[0]}]`;
  const [surname, ...given] = syllables;
  return `[${surname} · ${given.join(" ")}]`;
}

/**
 * Result-page secondary row: `[sū · jǐng xíng] · Sū Jǐngxíng`.
 * The companion stays the stored title-case pinyin, never the lowercase form.
 */
export function formatPinyinSecondaryRow(pinyin: string): string {
  const compact = pinyin.trim().replace(/^\[+/, "").replace(/\]+$/, "").trim();
  // If already a combined secondary row, format the specimen side only once.
  const companion = compact.includes(" · ") && compact.startsWith("[")
    ? compact.slice(compact.lastIndexOf(" · ") + 3)
    : pinyin.trim();
  return `${formatPinyinSpecimen(companion || pinyin)} · ${companion || pinyin.trim()}`;
}

import type { FreeCard } from "@/lib/api/types";

/**
 * Search-engine and social-preview crawlers only.
 * Regular browsers, Playwright Chromium, and HeadlessChrome are not treated
 * as crawlers so real visits still go through generation + rate limits.
 */
const CRAWLER_UA =
  /googlebot|google-inspectiontool|bingbot|bingpreview|slurp|duckduckbot|baiduspider|yandex(bot|images)|facebookexternalhit|facebot|twitterbot|linkedinbot|embedly|quora link preview|pinterest|slackbot|redditbot|applebot|semrushbot|ahrefsbot|mj12bot|dotbot|petalbot|bytespider|gptbot|chatgpt-user|ccbot|anthropic-ai|claudebot|claude-web|omgili|ia_archiver|amazonbot|sogou|exabot|seznambot|qwantify/i;

export function isCrawler(userAgent?: string | null): boolean {
  if (!userAgent) return false;
  return CRAWLER_UA.test(userAgent);
}

/** Fixed exhibit-style specimens for crawlers. Never counted against quota. */
export const CRAWLER_SAMPLE_CARDS: FreeCard[] = [
  { hanzi: "林安然", pinyin: "Lín Ānrán" },
  { hanzi: "苏景行", pinyin: "Sū Jǐngxíng" },
  { hanzi: "沈清越", pinyin: "Shěn Qīngyuè" },
];

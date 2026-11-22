import { describe, expect, it } from "vitest";
import { CRAWLER_SAMPLE_CARDS, isCrawler } from "@/lib/crawlers";

describe("isCrawler", () => {
  it("detects common search and social preview bots", () => {
    const bots = [
      "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
      "Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)",
      "DuckDuckBot/1.0; (+http://duckduckgo.com/duckduckbot.html)",
      "Mozilla/5.0 (compatible; Baiduspider/2.0; +http://www.baidu.com/search/spider.html)",
      "Mozilla/5.0 (compatible; YandexBot/3.0; +http://yandex.com/bots)",
      "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
      "Twitterbot/1.0",
      "Slackbot-LinkExpanding 1.0 (+https://api.slack.com/robots)",
      "LinkedInBot/1.0",
      "Mozilla/5.0 (compatible; Applebot/0.3; +http://www.apple.com/go/applebot)",
      "Mozilla/5.0 (compatible; Bytespider; ...)",
      "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.0)",
      "Mozilla/5.0 (compatible; ClaudeBot/1.0; +https://www.anthropic.com/)",
    ];
    for (const ua of bots) {
      expect(isCrawler(ua), ua).toBe(true);
    }
  });

  it("does not treat regular browsers or Playwright Chromium as crawlers", () => {
    const humans = [
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:132.0) Gecko/20100101 Firefox/132.0",
      "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1",
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    ];
    for (const ua of humans) {
      expect(isCrawler(ua), ua).toBe(false);
    }
  });

  it("treats missing or empty user-agents as non-crawlers", () => {
    expect(isCrawler(undefined)).toBe(false);
    expect(isCrawler(null)).toBe(false);
    expect(isCrawler("")).toBe(false);
  });
});

describe("CRAWLER_SAMPLE_CARDS", () => {
  it("is a fixed set of three lightweight names", () => {
    expect(CRAWLER_SAMPLE_CARDS).toHaveLength(3);
    for (const card of CRAWLER_SAMPLE_CARDS) {
      expect(card.hanzi).toMatch(/\p{Script=Han}{2,3}/u);
      expect(card.pinyin.length).toBeGreaterThan(0);
      expect(card).not.toHaveProperty("whyItFitsYou");
      expect(card).not.toHaveProperty("selfIntroduction");
    }
    const unique = new Set(CRAWLER_SAMPLE_CARDS.map((c) => c.hanzi));
    expect(unique.size).toBe(3);
  });
});

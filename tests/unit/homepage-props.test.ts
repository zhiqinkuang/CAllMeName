import { describe, expect, it } from "vitest";
import { CRAWLER_SAMPLE_CARDS } from "@/lib/crawlers";
import { resolveHomepageProps } from "@/lib/homepage-props";

describe("resolveHomepageProps", () => {
  it("leaves ordinary visitors without sample cards so the client can auto-generate", () => {
    expect(
      resolveHomepageProps({
        userAgent:
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      }),
    ).toEqual({ forcedState: null, sampleCards: null });
  });

  it("gives crawlers the fixed sample set and no QA override", () => {
    expect(
      resolveHomepageProps({
        userAgent:
          "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
      }),
    ).toEqual({ forcedState: null, sampleCards: CRAWLER_SAMPLE_CARDS });
  });

  it("lets QA ?generator= override crawler samples", () => {
    expect(
      resolveHomepageProps({
        generatorParam: "empty",
        userAgent:
          "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
      }),
    ).toEqual({ forcedState: "empty", sampleCards: null });
  });
});

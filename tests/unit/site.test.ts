import { describe, expect, it } from "vitest";
import { getSiteUrl } from "@/lib/site";

describe("getSiteUrl", () => {
  it("prefers NEXT_PUBLIC_SITE_URL over APP_BASE_URL", () => {
    expect(
      getSiteUrl({
        NEXT_PUBLIC_SITE_URL: "https://www.example.com/",
        APP_BASE_URL: "https://callmeming.com",
        VERCEL_URL: "ignored.vercel.app",
      }),
    ).toBe("https://www.example.com");
  });

  it("falls back to APP_BASE_URL", () => {
    expect(
      getSiteUrl({
        APP_BASE_URL: "https://callmeming.com/",
      }),
    ).toBe("https://callmeming.com");
  });

  it("uses VERCEL_URL when no explicit base is set", () => {
    expect(
      getSiteUrl({
        VERCEL_URL: "callmeming.vercel.app",
      }),
    ).toBe("https://callmeming.vercel.app");
  });

  it("defaults to localhost for local builds", () => {
    expect(getSiteUrl({})).toBe("http://localhost:3000");
  });
});

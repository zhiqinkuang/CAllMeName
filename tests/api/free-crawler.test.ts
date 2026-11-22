import { afterEach, describe, expect, it } from "vitest";
import { POST } from "@/app/api/names/free/route";
import { CRAWLER_SAMPLE_CARDS } from "@/lib/crawlers";
import { buildTestApp } from "../helpers/app";

async function postFree(body: unknown, ip: string, userAgent?: string) {
  const headers: Record<string, string> = {
    "content-type": "application/json",
    "x-forwarded-for": ip,
  };
  if (userAgent) headers["user-agent"] = userAgent;
  return POST(
    new Request("http://localhost/api/names/free", {
      method: "POST",
      headers,
      body: JSON.stringify(body ?? {}),
    }),
  );
}

describe("POST /api/names/free crawler short-circuit", () => {
  let app: ReturnType<typeof buildTestApp>;
  afterEach(() => app?.reset());

  it("returns the fixed sample set for a search crawler and does not count or generate", async () => {
    app = buildTestApp();
    const res = await postFree(
      { genderPreference: "neutral" },
      "10.8.0.1",
      "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.cards).toEqual(CRAWLER_SAMPLE_CARDS);
    expect(app.preferenceLog).toEqual([]);
    expect(app.persistence.__dump().rate).toHaveLength(0);
  });

  it("still rate-limits and generates for ordinary browsers", async () => {
    app = buildTestApp();
    const ua =
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
    const ip = "10.8.0.2";
    expect((await postFree({}, ip, ua)).status).toBe(200);
    expect((await postFree({}, ip, ua)).status).toBe(200);
    expect((await postFree({}, ip, ua)).status).toBe(200);
    const limited = await postFree({}, ip, ua);
    expect(limited.status).toBe(429);
    expect(app.preferenceLog).toHaveLength(3);
    expect(app.persistence.__dump().rate).toHaveLength(3);
  });
});

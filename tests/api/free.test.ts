import { afterEach, describe, expect, it } from "vitest";
import { POST } from "@/app/api/names/free/route";
import { buildTestApp } from "../helpers/app";

async function postFree(body: unknown, ip = "10.0.0.1") {
  return POST(
    new Request("http://localhost/api/names/free", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": ip,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
  );
}

describe("POST /api/names/free (B-B3 + v1.1 genderPreference)", () => {
  let app: ReturnType<typeof buildTestApp>;
  afterEach(() => app?.reset());

  it("empty {} returns 200 with 3 free cards and uses neutral", async () => {
    app = buildTestApp();
    const res = await postFree({}, "10.0.0.10");
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.cards).toHaveLength(3);
    expect(json.cards[0]).toEqual(
      expect.objectContaining({ hanzi: expect.any(String), pinyin: expect.any(String) }),
    );
    expect(json.cards[0].whyItFitsYou).toBeUndefined();
    expect(app.preferenceLog).toEqual(["neutral"]);
  });

  it("missing field / null genderPreference → neutral, not 400", async () => {
    app = buildTestApp();
    const res1 = await postFree({}, "10.0.0.11");
    expect(res1.status).toBe(200);
    const res2 = await postFree({ genderPreference: null }, "10.0.0.12");
    expect(res2.status).toBe(200);
    expect(app.preferenceLog).toEqual(["neutral", "neutral"]);
  });

  it("passes feminine/masculine/neutral into generator", async () => {
    app = buildTestApp();
    for (const g of ["feminine", "masculine", "neutral"] as const) {
      const res = await postFree({ genderPreference: g }, `10.0.1.${g.length}`);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.cards).toHaveLength(3);
    }
    expect(app.preferenceLog).toEqual(["feminine", "masculine", "neutral"]);
  });

  it("illegal genderPreference returns 400 validation_error", async () => {
    app = buildTestApp();
    const res = await postFree({ genderPreference: "other" }, "10.0.0.99");
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("validation_error");
    expect(json.fields?.genderPreference).toBeTruthy();
    expect(app.preferenceLog).toEqual([]);
  });

  it("rate limits with 429", async () => {
    app = buildTestApp();
    const ip = "10.0.0.50";
    expect((await postFree({}, ip)).status).toBe(200);
    expect((await postFree({}, ip)).status).toBe(200);
    expect((await postFree({}, ip)).status).toBe(200);
    const limited = await postFree({}, ip);
    expect(limited.status).toBe(429);
    const json = await limited.json();
    expect(json.error).toBe("rate_limited");
    expect(json.retryAfterSeconds).toBeGreaterThan(0);
    expect(json.cards).toBeUndefined();
  });

  it("does not persist free name text", async () => {
    app = buildTestApp();
    await postFree({}, "10.0.0.60");
    const dump = app.persistence.__dump();
    expect(dump.cards).toHaveLength(0);
    expect(dump.rate.length).toBeGreaterThan(0);
  });
});

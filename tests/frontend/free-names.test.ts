import { describe, expect, it, vi } from "vitest";
import { postFreeNames } from "@/lib/api/free-names";

describe("F-T3/F-T4 postFreeNames", () => {
  it("sends genderPreference in body (default neutral)", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        cards: [
          { hanzi: "林安然", pinyin: "Lín Ānrán" },
          { hanzi: "苏景行", pinyin: "Sū Jǐngxíng" },
          { hanzi: "沈清越", pinyin: "Shěn Qīngyuè" },
        ],
      }),
    });
    const result = await postFreeNames(undefined, fetchImpl as unknown as typeof fetch);
    expect(fetchImpl).toHaveBeenCalledWith(
      "/api/names/free",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ genderPreference: "neutral" }),
      }),
    );
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.cards).toHaveLength(3);
  });

  it("forwards feminine / masculine / neutral", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        cards: [
          { hanzi: "A", pinyin: "a" },
          { hanzi: "B", pinyin: "b" },
          { hanzi: "C", pinyin: "c" },
        ],
      }),
    });
    await postFreeNames("feminine", fetchImpl as unknown as typeof fetch);
    expect(JSON.parse(fetchImpl.mock.calls[0][1].body)).toEqual({
      genderPreference: "feminine",
    });
  });

  it("maps 429 to rate_limited", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      json: async () => ({
        error: "rate_limited",
        retryAfterSeconds: 10,
        message: "Too many free generations. Try again later.",
      }),
    });
    const result = await postFreeNames("neutral", fetchImpl as unknown as typeof fetch);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.kind).toBe("rate_limited");
    }
  });

  it("rejects malformed 200 (not exactly 3 cards)", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ cards: [{ hanzi: "A", pinyin: "a" }] }),
    });
    const result = await postFreeNames("neutral", fetchImpl as unknown as typeof fetch);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.kind).toBe("error");
  });

  it("handles network failure", async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new Error("offline"));
    const result = await postFreeNames("neutral", fetchImpl as unknown as typeof fetch);
    expect(result.ok).toBe(false);
  });
});

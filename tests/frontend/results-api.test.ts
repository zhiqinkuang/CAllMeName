import { describe, expect, it, vi } from "vitest";
import { getResult } from "@/lib/api/results";

const full = {
  hanzi: "林安然",
  pinyin: "Lín Ānrán",
  phoneticHint: "leen ahn-rahn",
  audioUrl: null,
  whyItFitsYou: "calm",
  selfIntroduction: "Hi, my Chinese name is 林安然.",
};

describe("F-T7/F-T8 getResult", () => {
  it("parses ready with 3 FullCards", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        status: "ready",
        cards: [full, { ...full, hanzi: "苏景行" }, { ...full, hanzi: "沈清越" }],
      }),
    });
    const result = await getResult("tok", fetchImpl as unknown as typeof fetch);
    expect(result).toMatchObject({ ok: true, status: "ready" });
    if (result.ok && result.status === "ready") {
      expect(result.cards).toHaveLength(3);
      expect(result.cards[0].audioUrl).toBeNull();
    }
  });

  it("parses 202 generating", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      status: 202,
      json: async () => ({ status: "generating" }),
    });
    const result = await getResult("tok", fetchImpl as unknown as typeof fetch);
    expect(result).toEqual({ ok: true, status: "generating" });
  });

  it("parses failed and not_found", async () => {
    const failed = await getResult(
      "tok",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          status: "failed",
          message: "We could not prepare your names.",
        }),
      }) as unknown as typeof fetch,
    );
    expect(failed).toMatchObject({ ok: false, status: "failed" });

    const missing = await getResult(
      "tok",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => ({
          error: "not_found",
          message: "This result link is invalid.",
        }),
      }) as unknown as typeof fetch,
    );
    expect(missing).toMatchObject({
      ok: false,
      status: "not_found",
      message: "This result link is invalid.",
    });
  });
});

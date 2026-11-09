import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { postCheckout, redirectToCheckout } from "@/lib/api/checkout";

describe("F-T6 postCheckout + redirect", () => {
  it("posts camelCase body and returns checkoutUrl", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        checkoutUrl: "https://checkout.waffo.ai/cs_test",
      }),
    });
    const result = await postCheckout(
      {
        englishName: "  Elena  ",
        genderPreference: "feminine",
        desiredFeeling: "calm",
      },
      fetchImpl as unknown as typeof fetch,
    );
    expect(JSON.parse(fetchImpl.mock.calls[0][1].body)).toEqual({
      englishName: "Elena",
      genderPreference: "feminine",
      desiredFeeling: "calm",
    });
    expect(result).toEqual({
      ok: true,
      checkoutUrl: "https://checkout.waffo.ai/cs_test",
    });
  });

  it("maps 400 validation_error with fields", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({
        error: "validation_error",
        message: "englishName is required",
        fields: { englishName: "Required" },
      }),
    });
    const result = await postCheckout(
      {
        englishName: "Elena",
        genderPreference: "neutral",
        desiredFeeling: "calm",
      },
      fetchImpl as unknown as typeof fetch,
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.kind).toBe("validation_error");
      if (result.kind === "validation_error") {
        expect(result.fields?.englishName).toBe("Required");
      }
    }
  });

  it("maps 502 checkout_create_failed", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: false,
      status: 502,
      json: async () => ({
        error: "checkout_create_failed",
        message: "Checkout is temporarily unavailable. Please try again.",
      }),
    });
    const result = await postCheckout(
      {
        englishName: "Elena",
        genderPreference: "neutral",
        desiredFeeling: "calm",
      },
      fetchImpl as unknown as typeof fetch,
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.kind).toBe("checkout_create_failed");
      expect(result.message).toContain("temporarily unavailable");
    }
  });

  it("redirectToCheckout uses location.href not window.open", () => {
    const open = vi.fn();
    const hrefSetter = vi.fn();
    const loc: { href: string } = { href: "" };
    Object.defineProperty(loc, "href", {
      set: hrefSetter,
      get: () => "",
      configurable: true,
    });
    const fakeWindow = { location: loc, open };
    vi.stubGlobal("window", fakeWindow);
    vi.stubGlobal("location", loc);
    vi.stubGlobal("open", open);
    redirectToCheckout("https://checkout.waffo.ai/cs_x");
    expect(hrefSetter).toHaveBeenCalledWith("https://checkout.waffo.ai/cs_x");
    expect(open).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });
});

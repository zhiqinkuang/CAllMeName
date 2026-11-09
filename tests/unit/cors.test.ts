import { describe, expect, it } from "vitest";
import { corsHeaders, parseAllowedOrigins } from "@/lib/server/cors";

describe("CORS (B-F1)", () => {
  it("never allows *", () => {
    expect(parseAllowedOrigins("*,https://callmeming.com")).toEqual([
      "https://callmeming.com",
    ]);
  });

  it("reflects only whitelisted origins", () => {
    const allowed = ["https://callmeming.com"];
    const ok = new Request("http://localhost/api/health", {
      headers: { origin: "https://callmeming.com" },
    });
    expect(corsHeaders(ok, allowed)["Access-Control-Allow-Origin"]).toBe(
      "https://callmeming.com",
    );
    const bad = new Request("http://localhost/api/health", {
      headers: { origin: "https://evil.example" },
    });
    expect(corsHeaders(bad, allowed)["Access-Control-Allow-Origin"]).toBeUndefined();
  });
});

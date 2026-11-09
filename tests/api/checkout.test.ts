import { afterEach, describe, expect, it } from "vitest";
import { POST } from "@/app/api/checkout/route";
import { buildTestApp } from "../helpers/app";

async function postCheckout(body: unknown) {
  return POST(
    new Request("http://localhost/api/checkout", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }),
  );
}

const valid = {
  englishName: "Alice",
  genderPreference: "feminine",
  desiredFeeling: "elegant",
};

describe("POST /api/checkout (B-C1..C3)", () => {
  let app: ReturnType<typeof buildTestApp>;
  afterEach(() => app?.reset());

  it("returns only checkoutUrl and stores token hash", async () => {
    app = buildTestApp();
    const res = await postCheckout(valid);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(Object.keys(json)).toEqual(["checkoutUrl"]);
    expect(json.checkoutUrl).toMatch(/^https:\/\/checkout\.waffo\.ai\//);

    expect(app.waffo.lastRequest).toMatchObject({
      productId: "PROD_test_product",
      currency: "USD",
      language: "en",
      metadata: { orderId: expect.any(String) },
    });
    expect(app.waffo.lastRequest!.orderMerchantExternalId).toBeTruthy();
    expect(app.waffo.lastRequest!.successUrl).toMatch(
      /^https:\/\/callmeming\.com\/results\//,
    );
    expect(app.waffo.lastRequest).not.toHaveProperty("buyerEmail");
    expect(app.waffo.lastRequest).not.toHaveProperty("cancelUrl");

    const dump = app.persistence.__dump();
    expect(dump.orders).toHaveLength(1);
    expect(dump.orders[0]!.status).toBe("awaiting_payment");
    expect(dump.orders[0]!.resultTokenHash).toHaveLength(64);
    expect(dump.orders[0]!.amountUsd).toBe("6.99");
    expect(JSON.stringify(dump.orders[0])).not.toMatch(/rawResultToken/);
    expect(dump.cards).toHaveLength(0);

    // expires = created + 365 days
    const created = Date.parse(dump.orders[0]!.createdAt);
    const expires = Date.parse(dump.orders[0]!.resultExpiresAt);
    expect(expires - created).toBe(365 * 24 * 60 * 60 * 1000);
  });

  it("accepts José / François", async () => {
    app = buildTestApp();
    for (const englishName of ["José", "François"]) {
      const res = await postCheckout({ ...valid, englishName });
      expect(res.status).toBe(200);
    }
  });

  it("400 validation_error on bad fields", async () => {
    app = buildTestApp();
    const res = await postCheckout({
      englishName: "Alice",
      genderPreference: "other",
      desiredFeeling: "elegant",
    });
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe("validation_error");
    expect(app.waffo.lastRequest).toBeNull();
  });

  it("502 when Waffo fails", async () => {
    app = buildTestApp();
    app.waffo.failNext = true;
    const res = await postCheckout(valid);
    expect(res.status).toBe(502);
    expect((await res.json()).error).toBe("checkout_create_failed");
  });
});

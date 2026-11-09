import { afterEach, describe, expect, it } from "vitest";
import { POST as freePost } from "@/app/api/names/free/route";
import { POST as checkoutPost } from "@/app/api/checkout/route";
import { GET as resultsGet } from "@/app/api/results/[token]/route";
import { POST as webhookPost } from "@/app/api/webhooks/waffo/route";
import { peekRawToken } from "@/lib/server/services/checkout";
import { buildTestApp } from "../helpers/app";

describe("e2e fixture free → checkout → webhook → ready → email (B-F2)", () => {
  let app: ReturnType<typeof buildTestApp>;
  afterEach(() => app?.reset());

  it("walks the happy path with mocks", async () => {
    app = buildTestApp();

    const free = await freePost(
      new Request("http://localhost/api/names/free", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-forwarded-for": "203.0.113.10",
        },
        body: JSON.stringify({ genderPreference: "neutral" }),
      }),
    );
    expect(free.status).toBe(200);
    expect(app.preferenceLog).toEqual(["neutral"]);

    const checkoutRes = await checkoutPost(
      new Request("http://localhost/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          englishName: "Sam",
          genderPreference: "neutral",
          desiredFeeling: "modern",
        }),
      }),
    );
    expect(checkoutRes.status).toBe(200);
    const { checkoutUrl } = await checkoutRes.json();
    expect(checkoutUrl).toBeTruthy();

    const order = app.persistence.__dump().orders[0]!;
    const rawToken = peekRawToken(order.id)!;

    const payload = {
      eventType: "order.completed",
      eventId: "PAY_e2e",
      data: {
        orderId: "ORD_e2e",
        buyerEmail: "sam@example.com",
        paymentStatus: "succeeded",
        paymentId: "PAY_e2e",
        orderMerchantExternalId: order.id,
        orderMetadata: { orderId: order.id },
      },
    };
    const raw = JSON.stringify(payload);
    const wh = await webhookPost(
      new Request("http://localhost/api/webhooks/waffo", {
        method: "POST",
        headers: {
          "x-waffo-signature": app.sign(raw),
          "x-waffo-event": "order.completed",
        },
        body: raw,
      }),
    );
    expect(wh.status).toBe(200);

    await app.container.fulfillment.fulfillOrder(order.id, rawToken);

    const results = await resultsGet(
      new Request(`http://localhost/api/results/${rawToken}`),
      { params: Promise.resolve({ token: rawToken }) },
    );
    expect(results.status).toBe(200);
    const body = await results.json();
    expect(body.status).toBe("ready");
    expect(body.cards).toHaveLength(3);
    expect(app.email.sent[0]!.to).toBe("sam@example.com");
    expect(app.email.sent[0]!.cards).toHaveLength(3);
  });
});

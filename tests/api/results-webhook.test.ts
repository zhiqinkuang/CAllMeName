import { afterEach, describe, expect, it } from "vitest";
import { POST as checkoutPost } from "@/app/api/checkout/route";
import { GET as resultsGet } from "@/app/api/results/[token]/route";
import { POST as webhookPost } from "@/app/api/webhooks/waffo/route";
import { peekRawToken } from "@/lib/server/services/checkout";
import { buildTestApp } from "../helpers/app";

async function checkout(app: ReturnType<typeof buildTestApp>) {
  const res = await checkoutPost(
    new Request("http://localhost/api/checkout", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        englishName: "Alice",
        genderPreference: "feminine",
        desiredFeeling: "elegant",
      }),
    }),
  );
  expect(res.status).toBe(200);
  const order = app.persistence.__dump().orders[0]!;
  const rawToken = peekRawToken(order.id)!;
  return { order, rawToken };
}

function completedPayload(orderId: string, eventId = "PAY_test_1") {
  return {
    id: eventId,
    timestamp: "2026-11-09T04:01:00.000Z",
    eventType: "order.completed",
    eventId,
    storeId: "STO_test",
    storeName: "Test",
    mode: "test",
    data: {
      orderId: "ORD_waffo_1",
      orderStatus: "completed",
      buyerEmail: "buyer@example.com",
      currency: "USD",
      orderMetadata: { orderId },
      orderMerchantExternalId: orderId,
      paymentId: eventId,
      paymentStatus: "succeeded",
      productName: "CallMeMing Custom Names",
    },
  };
}

describe("results + webhook fulfillment (B-D*, B-E*)", () => {
  let app: ReturnType<typeof buildTestApp>;
  afterEach(() => app?.reset());

  it("202 generating before payment; ready after webhook+fulfill", async () => {
    app = buildTestApp();
    const { order, rawToken } = await checkout(app);

    const early = await resultsGet(
      new Request(`http://localhost/api/results/${rawToken}`),
      { params: Promise.resolve({ token: rawToken }) },
    );
    expect(early.status).toBe(202);
    expect(await early.json()).toEqual({ status: "generating" });

    const body = JSON.stringify(completedPayload(order.id));
    const sig = app.sign(body);
    const wh = await webhookPost(
      new Request("http://localhost/api/webhooks/waffo", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-waffo-signature": sig,
          "x-waffo-event": "order.completed",
        },
        body,
      }),
    );
    expect(wh.status).toBe(200);

    // after() may not run in unit context — call fulfill directly
    await app.container.fulfillment.fulfillOrder(order.id, rawToken);

    const ready = await resultsGet(
      new Request(`http://localhost/api/results/${rawToken}`),
      { params: Promise.resolve({ token: rawToken }) },
    );
    expect(ready.status).toBe(200);
    const json = await ready.json();
    expect(json.status).toBe("ready");
    expect(json.cards).toHaveLength(3);
    for (const c of json.cards) {
      expect(c.hanzi).toBeTruthy();
      expect(c.pinyin).toMatch(/[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/);
      expect(c.phoneticHint).toBeTruthy();
      expect(c.whyItFitsYou).toBeTruthy();
      expect(c.selfIntroduction).toContain(c.hanzi);
      expect(c.audioUrl).toBeNull();
    }

    expect(app.email.sent).toHaveLength(1);
    expect(app.email.sent[0]!.to).toBe("buyer@example.com");
    expect(app.email.sent[0]!.resultUrl).toContain(rawToken);
  });

  it("401 on bad signature", async () => {
    app = buildTestApp();
    const { order } = await checkout(app);
    const body = JSON.stringify(completedPayload(order.id));
    const res = await webhookPost(
      new Request("http://localhost/api/webhooks/waffo", {
        method: "POST",
        headers: {
          "x-waffo-signature": "t=1,v1=deadbeef",
          "x-waffo-event": "order.completed",
        },
        body,
      }),
    );
    expect(res.status).toBe(401);
  });

  it("missing order alerts and returns 2xx", async () => {
    const alerts: unknown[] = [];
    app = buildTestApp({ alertMissingOrder: (info) => alerts.push(info) });
    const body = JSON.stringify(completedPayload("nonexistent-order"));
    const sig = app.sign(body);
    const res = await webhookPost(
      new Request("http://localhost/api/webhooks/waffo", {
        method: "POST",
        headers: {
          "x-waffo-signature": sig,
          "x-waffo-event": "order.completed",
        },
        body,
      }),
    );
    expect(res.status).toBe(200);
    expect(alerts.length).toBe(1);
  });

  it("idempotent webhook does not duplicate cards", async () => {
    app = buildTestApp();
    const { order, rawToken } = await checkout(app);
    const body = JSON.stringify(completedPayload(order.id, "PAY_idem"));
    const sig = app.sign(body);
    const headers = {
      "content-type": "application/json",
      "x-waffo-signature": sig,
      "x-waffo-event": "order.completed",
    };
    expect(
      (await webhookPost(new Request("http://localhost/api/webhooks/waffo", { method: "POST", headers, body }))).status,
    ).toBe(200);
    await app.container.fulfillment.fulfillOrder(order.id, rawToken);
    expect(
      (await webhookPost(new Request("http://localhost/api/webhooks/waffo", { method: "POST", headers, body }))).status,
    ).toBe(200);
    await app.container.fulfillment.fulfillOrder(order.id, rawToken);
    expect(await app.persistence.countNameCards(order.id)).toBe(3);
  });

  it("expired then completed still fulfills", async () => {
    app = buildTestApp();
    const { order, rawToken } = await checkout(app);
    await app.persistence.updateOrder(order.id, { status: "expired" });
    const body = JSON.stringify(completedPayload(order.id, "PAY_expired"));
    const sig = app.sign(body);
    await webhookPost(
      new Request("http://localhost/api/webhooks/waffo", {
        method: "POST",
        headers: {
          "x-waffo-signature": sig,
          "x-waffo-event": "order.completed",
        },
        body,
      }),
    );
    await app.container.fulfillment.fulfillOrder(order.id, rawToken);
    const ready = await resultsGet(
      new Request(`http://localhost/api/results/${rawToken}`),
      { params: Promise.resolve({ token: rawToken }) },
    );
    expect(ready.status).toBe(200);
    expect((await ready.json()).status).toBe("ready");
  });

  it("refunded maps to 404 same message as unknown", async () => {
    app = buildTestApp();
    const { order, rawToken } = await checkout(app);
    const payBody = JSON.stringify(completedPayload(order.id, "PAY_ref"));
    await webhookPost(
      new Request("http://localhost/api/webhooks/waffo", {
        method: "POST",
        headers: {
          "x-waffo-signature": app.sign(payBody),
          "x-waffo-event": "order.completed",
        },
        body: payBody,
      }),
    );
    await app.container.fulfillment.fulfillOrder(order.id, rawToken);

    const refundBody = JSON.stringify({
      eventType: "refund.succeeded",
      eventId: "REF_1",
      data: {
        orderMerchantExternalId: order.id,
        orderId: "ORD_waffo_1",
        refundStatus: "succeeded",
      },
    });
    await webhookPost(
      new Request("http://localhost/api/webhooks/waffo", {
        method: "POST",
        headers: {
          "x-waffo-signature": app.sign(refundBody),
          "x-waffo-event": "refund.succeeded",
        },
        body: refundBody,
      }),
    );

    const res = await resultsGet(
      new Request(`http://localhost/api/results/${rawToken}`),
      { params: Promise.resolve({ token: rawToken }) },
    );
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({
      error: "not_found",
      message: "This result link is invalid.",
    });

    const unknown = await resultsGet(
      new Request("http://localhost/api/results/not-a-real-token"),
      { params: Promise.resolve({ token: "not-a-real-token" }) },
    );
    expect(unknown.status).toBe(404);
    expect(await unknown.json()).toEqual({
      error: "not_found",
      message: "This result link is invalid.",
    });
  });

  it("email failure still leaves ready", async () => {
    app = buildTestApp();
    app.email.failNext = true;
    const { order, rawToken } = await checkout(app);
    const body = JSON.stringify(completedPayload(order.id, "PAY_email_fail"));
    await webhookPost(
      new Request("http://localhost/api/webhooks/waffo", {
        method: "POST",
        headers: {
          "x-waffo-signature": app.sign(body),
          "x-waffo-event": "order.completed",
        },
        body,
      }),
    );
    await app.container.fulfillment.fulfillOrder(order.id, rawToken);
    const ready = await resultsGet(
      new Request(`http://localhost/api/results/${rawToken}`),
      { params: Promise.resolve({ token: rawToken }) },
    );
    expect(ready.status).toBe(200);
    expect((await ready.json()).status).toBe("ready");
    const updated = await app.persistence.getOrderById(order.id);
    expect(updated!.emailError).toBeTruthy();
  });
});

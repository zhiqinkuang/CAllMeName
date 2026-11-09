import { unauthorized } from "../errors";
import type { Clock } from "../clock";
import type { FulfillmentService } from "../fulfillment/service";
import type { Persistence } from "../persistence/types";
import type { WaffoWebhookVerifier } from "../waffo/types";
import { peekRawToken, rememberRawToken } from "./checkout";

export type WebhookService = {
  /**
   * Verify + idempotent write quickly; schedule fulfillment async via returned job.
   */
  handle(rawBody: string, headers: {
    signature: string | null;
    event: string | null;
  }): Promise<{
    httpStatus: number;
    body: { received: true };
    asyncJob?: () => Promise<void>;
  }>;
};

type WaffoPayload = {
  eventType?: string;
  eventId?: string;
  data?: {
    orderId?: string;
    paymentId?: string;
    paymentStatus?: string;
    buyerEmail?: string;
    orderMerchantExternalId?: string;
    orderMetadata?: { orderId?: string };
  };
};

export function createWebhookService(deps: {
  persistence: Persistence;
  verifier: WaffoWebhookVerifier;
  fulfillment: FulfillmentService;
  clock: Clock;
  alertMissingOrder?: (info: unknown) => void;
}): WebhookService {
  const {
    persistence,
    verifier,
    fulfillment,
    clock,
    alertMissingOrder = (info) =>
      console.error("[HIGH] waffo webhook order not found", info),
  } = deps;

  return {
    async handle(rawBody, headers) {
      if (!verifier.verify(rawBody, headers.signature)) {
        throw unauthorized();
      }

      let payload: WaffoPayload;
      try {
        payload = JSON.parse(rawBody) as WaffoPayload;
      } catch {
        // Valid signature but bad JSON — acknowledge to avoid retry storms
        return { httpStatus: 200, body: { received: true } };
      }

      const eventType = payload.eventType || headers.event || "unknown";
      const eventId = payload.eventId || payload.data?.paymentId || "unknown";

      const { inserted } = await persistence.insertWebhookEvent({
        eventType,
        eventId,
        payload,
        receivedAt: clock.now().toISOString(),
        processedAt: null,
      });

      if (!inserted) {
        // Duplicate — already handled
        return { httpStatus: 200, body: { received: true } };
      }

      if (eventType === "order.completed") {
        const data = payload.data || {};
        if (data.paymentStatus !== "succeeded") {
          await persistence.markWebhookProcessed(eventType, eventId);
          return { httpStatus: 200, body: { received: true } };
        }

        const localId =
          data.orderMerchantExternalId || data.orderMetadata?.orderId;
        if (!localId) {
          alertMissingOrder({ eventType, eventId, reason: "no_local_id" });
          await persistence.markWebhookProcessed(eventType, eventId);
          return { httpStatus: 200, body: { received: true } };
        }

        const order = await persistence.getOrderById(localId);
        if (!order) {
          alertMissingOrder({ eventType, eventId, localId });
          await persistence.markWebhookProcessed(eventType, eventId);
          return { httpStatus: 200, body: { received: true } };
        }

        // Mark paid even if previously expired
        await persistence.updateOrder(order.id, {
          status: "paid",
          buyerEmail: data.buyerEmail ?? order.buyerEmail,
          waffoOrderId: data.orderId ?? order.waffoOrderId,
          waffoPaymentId: data.paymentId ?? order.waffoPaymentId,
          updatedAt: clock.now().toISOString(),
        });

        await persistence.markWebhookProcessed(eventType, eventId);

        const rawToken = peekRawToken(order.id);
        // If process restarted, email link may omit token; results still work via successUrl client.
        // For email we need raw token — if missing, still fulfill cards; email step skips without token.
        const tokenForEmail = rawToken || "";

        return {
          httpStatus: 200,
          body: { received: true },
          asyncJob: async () => {
            if (!tokenForEmail) {
              // Still generate cards; email will skip without URL token
              rememberRawToken(order.id, "missing-token-after-restart");
            }
            await fulfillment.fulfillOrder(
              order.id,
              tokenForEmail || "missing-token-after-restart",
            );
          },
        };
      }

      if (eventType === "refund.succeeded") {
        const data = payload.data || {};
        const localId =
          data.orderMerchantExternalId || data.orderMetadata?.orderId;
        let order = localId
          ? await persistence.getOrderById(localId)
          : null;
        if (!order && data.orderId) {
          order = await persistence.getOrderByWaffoOrderId(data.orderId);
        }
        if (order) {
          await persistence.updateOrder(order.id, {
            status: "refunded",
            updatedAt: clock.now().toISOString(),
          });
        } else {
          alertMissingOrder({ eventType, eventId, localId });
        }
        await persistence.markWebhookProcessed(eventType, eventId);
        return { httpStatus: 200, body: { received: true } };
      }

      await persistence.markWebhookProcessed(eventType, eventId);
      return { httpStatus: 200, body: { received: true } };
    },
  };
}

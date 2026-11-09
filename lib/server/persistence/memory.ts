import { generateId } from "../crypto";
import type {
  NameCardRecord,
  OrderRecord,
  RateLimitEvent,
  WebhookEventRecord,
} from "../types";
import type { Persistence } from "./types";

export function createMemoryPersistence(): Persistence & {
  __dump(): {
    orders: OrderRecord[];
    cards: NameCardRecord[];
    rate: RateLimitEvent[];
    webhooks: WebhookEventRecord[];
  };
} {
  const rateEvents: RateLimitEvent[] = [];
  const orders = new Map<string, OrderRecord>();
  const cards: NameCardRecord[] = [];
  const webhooks = new Map<string, WebhookEventRecord>();

  const key = (t: string, id: string) => `${t}::${id}`;

  return {
    async insertRateLimitEvent(ipHash, at) {
      const ev: RateLimitEvent = {
        id: generateId("rl"),
        ipHash,
        createdAt: at.toISOString(),
      };
      rateEvents.push(ev);
      return ev;
    },
    async listRateLimitEvents(ipHash, since) {
      const sinceMs = since.getTime();
      return rateEvents.filter(
        (e) => e.ipHash === ipHash && Date.parse(e.createdAt) >= sinceMs,
      );
    },
    async countRateLimitEventsSince(ipHash, since) {
      const list = await this.listRateLimitEvents(ipHash, since);
      return list.length;
    },
    async countRateLimitEventsUtcDay(ipHash, dayStartUtc) {
      const start = dayStartUtc.getTime();
      const end = start + 24 * 60 * 60 * 1000;
      return rateEvents.filter((e) => {
        if (e.ipHash !== ipHash) return false;
        const t = Date.parse(e.createdAt);
        return t >= start && t < end;
      }).length;
    },
    async earliestRateLimitEventSince(ipHash, since) {
      const list = await this.listRateLimitEvents(ipHash, since);
      if (list.length === 0) return null;
      return list.reduce((a, b) =>
        Date.parse(a.createdAt) <= Date.parse(b.createdAt) ? a : b,
      );
    },

    async createOrder(order) {
      const record: OrderRecord = {
        ...order,
        updatedAt: order.updatedAt ?? order.createdAt,
        waffoSessionId: order.waffoSessionId ?? null,
        waffoCheckoutUrl: order.waffoCheckoutUrl ?? null,
        waffoExpiresAt: order.waffoExpiresAt ?? null,
        waffoOrderId: order.waffoOrderId ?? null,
        waffoPaymentId: order.waffoPaymentId ?? null,
        buyerEmail: order.buyerEmail ?? null,
        fulfilledAt: order.fulfilledAt ?? null,
        emailSentAt: order.emailSentAt ?? null,
        emailError: order.emailError ?? null,
        failureCode: order.failureCode ?? null,
      };
      // Never persist raw token
      delete (record as { rawResultToken?: string }).rawResultToken;
      orders.set(record.id, record);
      return { ...record };
    },

    async updateOrder(id, patch) {
      const existing = orders.get(id);
      if (!existing) return null;
      const next = { ...existing, ...patch, id: existing.id };
      delete (next as { rawResultToken?: string }).rawResultToken;
      orders.set(id, next);
      return { ...next };
    },

    async getOrderById(id) {
      const o = orders.get(id);
      return o ? { ...o } : null;
    },

    async getOrderByTokenHash(hash) {
      for (const o of orders.values()) {
        if (o.resultTokenHash === hash) return { ...o };
      }
      return null;
    },

    async getOrderByWaffoOrderId(waffoOrderId) {
      for (const o of orders.values()) {
        if (o.waffoOrderId === waffoOrderId) return { ...o };
      }
      return null;
    },

    async insertNameCards(rows) {
      cards.push(...rows.map((r) => ({ ...r })));
    },

    async listNameCards(orderId) {
      return cards
        .filter((c) => c.orderId === orderId)
        .sort((a, b) => a.rank - b.rank)
        .map((c) => ({ ...c }));
    },

    async countNameCards(orderId) {
      return cards.filter((c) => c.orderId === orderId).length;
    },

    async insertWebhookEvent(event) {
      const k = key(event.eventType, event.eventId);
      if (webhooks.has(k)) {
        return { inserted: false, record: { ...webhooks.get(k)! } };
      }
      const record = { ...event };
      webhooks.set(k, record);
      return { inserted: true, record: { ...record } };
    },

    async markWebhookProcessed(eventType, eventId) {
      const k = key(eventType, eventId);
      const existing = webhooks.get(k);
      if (existing) {
        webhooks.set(k, {
          ...existing,
          processedAt: new Date().toISOString(),
        });
      }
    },

    async getWebhookEvent(eventType, eventId) {
      const r = webhooks.get(key(eventType, eventId));
      return r ? { ...r } : null;
    },

    __dump() {
      return {
        orders: [...orders.values()],
        cards: [...cards],
        rate: [...rateEvents],
        webhooks: [...webhooks.values()],
      };
    },
  };
}

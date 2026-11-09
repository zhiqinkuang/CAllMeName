import type {
  NameCardRecord,
  OrderRecord,
  OrderStatus,
  RateLimitEvent,
  WebhookEventRecord,
} from "../types";

export type Persistence = {
  insertRateLimitEvent(ipHash: string, at: Date): Promise<RateLimitEvent>;
  listRateLimitEvents(ipHash: string, since: Date): Promise<RateLimitEvent[]>;
  countRateLimitEventsSince(ipHash: string, since: Date): Promise<number>;
  countRateLimitEventsUtcDay(ipHash: string, dayStartUtc: Date): Promise<number>;
  earliestRateLimitEventSince(ipHash: string, since: Date): Promise<RateLimitEvent | null>;

  createOrder(
    order: Omit<OrderRecord, "updatedAt"> & { updatedAt?: string },
  ): Promise<OrderRecord>;
  updateOrder(
    id: string,
    patch: Partial<OrderRecord>,
  ): Promise<OrderRecord | null>;
  getOrderById(id: string): Promise<OrderRecord | null>;
  getOrderByTokenHash(hash: string): Promise<OrderRecord | null>;
  getOrderByWaffoOrderId(waffoOrderId: string): Promise<OrderRecord | null>;

  insertNameCards(cards: NameCardRecord[]): Promise<void>;
  listNameCards(orderId: string): Promise<NameCardRecord[]>;
  countNameCards(orderId: string): Promise<number>;

  insertWebhookEvent(
    event: WebhookEventRecord,
  ): Promise<{ inserted: boolean; record: WebhookEventRecord }>;
  markWebhookProcessed(eventType: string, eventId: string): Promise<void>;
  getWebhookEvent(
    eventType: string,
    eventId: string,
  ): Promise<WebhookEventRecord | null>;
};

export type CreateOrderInput = {
  id: string;
  status: OrderStatus;
  englishName: string;
  genderPreference: OrderRecord["genderPreference"];
  desiredFeeling: OrderRecord["desiredFeeling"];
  amountUsd: string;
  currency: string;
  resultTokenHash: string;
  resultExpiresAt: string;
  createdAt: string;
  waffoSessionId?: string | null;
  waffoCheckoutUrl?: string | null;
  waffoExpiresAt?: string | null;
};

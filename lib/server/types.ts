export type GenderPreference = "feminine" | "masculine" | "neutral";
export type DesiredFeeling =
  | "friendly"
  | "calm"
  | "bright"
  | "elegant"
  | "modern"
  | "scholarly";

export type OrderStatus =
  | "created"
  | "awaiting_payment"
  | "expired"
  | "paid"
  | "fulfilling"
  | "ready"
  | "failed"
  | "refunded";

export type FreeCard = { hanzi: string; pinyin: string };

export type FullCard = {
  hanzi: string;
  pinyin: string;
  phoneticHint: string;
  audioUrl: string | null;
  whyItFitsYou: string;
  selfIntroduction: string;
};

export type NameCardRecord = FullCard & {
  id: string;
  orderId: string;
  rank: 1 | 2 | 3;
};

export type OrderRecord = {
  id: string;
  status: OrderStatus;
  englishName: string;
  genderPreference: GenderPreference;
  desiredFeeling: DesiredFeeling;
  amountUsd: string;
  currency: string;
  resultTokenHash: string;
  resultExpiresAt: string;
  createdAt: string;
  updatedAt: string;
  waffoSessionId: string | null;
  waffoCheckoutUrl: string | null;
  waffoExpiresAt: string | null;
  waffoOrderId: string | null;
  waffoPaymentId: string | null;
  buyerEmail: string | null;
  fulfilledAt: string | null;
  emailSentAt: string | null;
  emailError: string | null;
  failureCode: string | null;
  /** Ephemeral: raw token only held in-memory during checkout create for successUrl/email. Never persisted. */
  rawResultToken?: string;
};

export type RateLimitEvent = {
  id: string;
  ipHash: string;
  createdAt: string;
};

export type WebhookEventRecord = {
  eventType: string;
  eventId: string;
  payload: unknown;
  receivedAt: string;
  processedAt: string | null;
};

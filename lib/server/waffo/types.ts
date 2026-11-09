export type CreateSessionInput = {
  productId: string;
  currency: "USD";
  language: "en";
  orderMerchantExternalId: string;
  metadata: { orderId: string };
  successUrl: string;
  expiresInSeconds?: number;
  /** Must NOT be sent for CallMeMing MVP */
  buyerEmail?: never;
  cancelUrl?: never;
};

export type CreateSessionResult = {
  sessionId: string;
  checkoutUrl: string;
  expiresAt: string;
};

export type WaffoClient = {
  createSession(input: CreateSessionInput): Promise<CreateSessionResult>;
};

export type WaffoWebhookVerifier = {
  verify(rawBody: string, signatureHeader: string | null): boolean;
};

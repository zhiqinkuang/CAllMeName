import { WaffoPancake } from "@waffo/pancake-ts";
import type { CreateSessionInput, CreateSessionResult, WaffoClient } from "./types";

export function createRealWaffoClient(config: {
  merchantId: string;
  privateKey: string;
}): WaffoClient {
  const client = new WaffoPancake({
    merchantId: config.merchantId,
    privateKey: config.privateKey,
  });

  return {
    async createSession(input: CreateSessionInput): Promise<CreateSessionResult> {
      // Do not pass buyerEmail or cancelUrl
      const session = await client.checkout.createSession({
        productId: input.productId,
        currency: input.currency,
        language: input.language,
        orderMerchantExternalId: input.orderMerchantExternalId,
        metadata: input.metadata,
        successUrl: input.successUrl,
        ...(input.expiresInSeconds != null
          ? { expiresInSeconds: input.expiresInSeconds }
          : {}),
      });
      return {
        sessionId: session.sessionId,
        checkoutUrl: session.checkoutUrl,
        expiresAt: session.expiresAt,
      };
    },
  };
}

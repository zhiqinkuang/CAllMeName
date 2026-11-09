import { generateId, generateResultToken, hashResultToken } from "../crypto";
import { checkoutCreateFailed } from "../errors";
import type { Clock } from "../clock";
import type { Persistence } from "../persistence/types";
import { validateCheckoutBody } from "../validation";
import type { WaffoClient } from "../waffo/types";

const AMOUNT_USD = "6.99";
const CURRENCY = "USD";
const YEAR_MS = 365 * 24 * 60 * 60 * 1000;

export type CheckoutService = {
  checkout(body: unknown): Promise<{
    checkoutUrl: string;
    /** Test-only: raw token never returned by HTTP layer */
    __rawToken?: string;
    __orderId?: string;
  }>;
};

export function createCheckoutService(deps: {
  persistence: Persistence;
  waffo: WaffoClient;
  clock: Clock;
  appBaseUrl: string;
  productId: string;
  exposeInternals?: boolean;
}): CheckoutService {
  const {
    persistence,
    waffo,
    clock,
    appBaseUrl,
    productId,
    exposeInternals,
  } = deps;

  return {
    async checkout(body) {
      const fields = validateCheckoutBody(body);
      const now = clock.now();
      const orderId = generateId(); // uuid-like hex; fine for merchant external id
      const rawToken = generateResultToken();
      const tokenHash = hashResultToken(rawToken);
      const createdAt = now.toISOString();
      const resultExpiresAt = new Date(now.getTime() + YEAR_MS).toISOString();
      const successUrl = `${appBaseUrl}/results/${rawToken}`;

      await persistence.createOrder({
        id: orderId,
        status: "awaiting_payment",
        englishName: fields.englishName,
        genderPreference: fields.genderPreference,
        desiredFeeling: fields.desiredFeeling,
        amountUsd: AMOUNT_USD,
        currency: CURRENCY,
        resultTokenHash: tokenHash,
        resultExpiresAt,
        createdAt,
        updatedAt: createdAt,
        waffoSessionId: null,
        waffoCheckoutUrl: null,
        waffoExpiresAt: null,
        waffoOrderId: null,
        waffoPaymentId: null,
        buyerEmail: null,
        fulfilledAt: null,
        emailSentAt: null,
        emailError: null,
        failureCode: null,
      });

      // Hold raw token in-memory map for webhook fulfillment email URL
      rememberRawToken(orderId, rawToken);

      let session;
      try {
        session = await waffo.createSession({
          productId,
          currency: "USD",
          language: "en",
          orderMerchantExternalId: orderId,
          metadata: { orderId },
          successUrl,
        });
      } catch {
        throw checkoutCreateFailed();
      }

      await persistence.updateOrder(orderId, {
        waffoSessionId: session.sessionId,
        waffoCheckoutUrl: session.checkoutUrl,
        waffoExpiresAt: session.expiresAt,
        updatedAt: clock.now().toISOString(),
      });

      const result: {
        checkoutUrl: string;
        __rawToken?: string;
        __orderId?: string;
      } = { checkoutUrl: session.checkoutUrl };
      if (exposeInternals) {
        result.__rawToken = rawToken;
        result.__orderId = orderId;
      }
      return result;
    },
  };
}

const rawTokenByOrder = new Map<string, string>();

export function rememberRawToken(orderId: string, token: string) {
  rawTokenByOrder.set(orderId, token);
}

export function takeRawToken(orderId: string): string | undefined {
  const t = rawTokenByOrder.get(orderId);
  return t;
}

export function peekRawToken(orderId: string): string | undefined {
  return rawTokenByOrder.get(orderId);
}

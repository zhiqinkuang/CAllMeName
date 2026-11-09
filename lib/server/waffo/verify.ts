import { verifyWebhook } from "@waffo/pancake-ts";
import type { WaffoWebhookVerifier } from "./types";
import { createPemWebhookVerifier } from "./mock";

/**
 * Prefer SDK verifyWebhook (embedded keys) when no explicit PEM is set.
 * For local/mock tests, inject createPemWebhookVerifier with fixture keys.
 */
export function createSdkWebhookVerifier(): WaffoWebhookVerifier {
  return {
    verify(rawBody, signatureHeader) {
      if (!signatureHeader) return false;
      try {
        verifyWebhook(rawBody, signatureHeader);
        return true;
      } catch {
        return false;
      }
    },
  };
}

export function createConfiguredWebhookVerifier(
  publicKeyPem: string | undefined,
): WaffoWebhookVerifier {
  if (publicKeyPem && publicKeyPem.trim()) {
    return createPemWebhookVerifier(publicKeyPem);
  }
  return createSdkWebhookVerifier();
}

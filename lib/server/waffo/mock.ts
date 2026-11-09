import { createSign, createVerify, generateKeyPairSync } from "crypto";
import type {
  CreateSessionInput,
  CreateSessionResult,
  WaffoClient,
  WaffoWebhookVerifier,
} from "./types";

export type MockWaffoClient = WaffoClient & {
  lastRequest: CreateSessionInput | null;
  failNext: boolean;
  sessions: CreateSessionResult[];
};

export function createMockWaffoClient(): MockWaffoClient {
  const client: MockWaffoClient = {
    lastRequest: null,
    failNext: false,
    sessions: [],
    async createSession(input) {
      if ("buyerEmail" in input && (input as { buyerEmail?: string }).buyerEmail) {
        throw new Error("mock waffo: buyerEmail must not be sent");
      }
      if ("cancelUrl" in input && (input as { cancelUrl?: string }).cancelUrl) {
        throw new Error("mock waffo: cancelUrl must not be sent");
      }
      client.lastRequest = { ...input, metadata: { ...input.metadata } };
      if (client.failNext) {
        client.failNext = false;
        throw new Error("mock waffo createSession failed");
      }
      const sessionId = `cs_mock_${client.sessions.length + 1}`;
      const result: CreateSessionResult = {
        sessionId,
        checkoutUrl: `https://checkout.waffo.ai/mock/checkout/${sessionId}`,
        expiresAt: new Date(Date.now() + 86400_000).toISOString(),
      };
      client.sessions.push(result);
      return result;
    },
  };
  return client;
}

export function createTestKeyPair(): { privateKey: string; publicKey: string } {
  const { privateKey, publicKey } = generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
  });
  return { privateKey, publicKey };
}

export function signWaffoWebhook(
  rawBody: string,
  privateKeyPem: string,
  timestampMs = Date.now(),
): string {
  const input = `${timestampMs}.${rawBody}`;
  const signer = createSign("RSA-SHA256");
  signer.update(input);
  signer.end();
  const v1 = signer.sign(privateKeyPem, "base64");
  return `t=${timestampMs},v1=${v1}`;
}

export function createPemWebhookVerifier(
  publicKeyPem: string,
  options?: { clock?: () => number; toleranceMs?: number },
): WaffoWebhookVerifier {
  const tolerance = options?.toleranceMs ?? 45 * 60 * 1000;
  const now = options?.clock ?? (() => Date.now());
  return {
    verify(rawBody, signatureHeader) {
      if (!signatureHeader) return false;
      const parts: Record<string, string> = {};
      for (const pair of signatureHeader.split(",")) {
        const [k, ...rest] = pair.split("=");
        if (!k) continue;
        parts[k.trim()] = rest.join("=").trim();
      }
      const t = parts.t;
      const v1 = parts.v1;
      if (!t || !v1) return false;
      if (Math.abs(now() - Number(t)) > tolerance) return false;
      const verifier = createVerify("RSA-SHA256");
      verifier.update(`${t}.${rawBody}`);
      verifier.end();
      try {
        return verifier.verify(publicKeyPem, v1, "base64");
      } catch {
        return false;
      }
    },
  };
}

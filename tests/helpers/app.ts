import { createFixedClock } from "@/lib/server/clock";
import { loadConfig } from "@/lib/server/config";
import {
  createContainer,
  setContainer,
  type AppContainer,
} from "@/lib/server/container";
import { createMemoryPersistence } from "@/lib/server/persistence/memory";
import { createMockEmailClient } from "@/lib/server/email/mock";
import { createMockLlmClient } from "@/lib/server/llm/mock";
import {
  createMockWaffoClient,
  createPemWebhookVerifier,
  signWaffoWebhook,
} from "@/lib/server/waffo/mock";
import {
  TEST_WAFFO_PRIVATE_KEY,
  TEST_WAFFO_PUBLIC_KEY,
} from "./rsa";
import type { GenderPreference } from "@/lib/server/types";

export function buildTestApp(options?: {
  now?: string;
  freePreferenceLog?: GenderPreference[];
  alertMissingOrder?: (info: unknown) => void;
}) {
  const clock = createFixedClock(options?.now ?? "2026-11-09T04:00:00.000Z");
  const persistence = createMemoryPersistence();
  const waffo = createMockWaffoClient();
  const llm = createMockLlmClient();
  const email = createMockEmailClient();
  const preferenceLog: GenderPreference[] = options?.freePreferenceLog ?? [];
  const verifier = createPemWebhookVerifier(TEST_WAFFO_PUBLIC_KEY, {
    clock: () => clock.now().getTime(),
  });

  const config = loadConfig({
    ...process.env,
    PERSISTENCE_DRIVER: "memory",
    WAFFO_DRIVER: "mock",
    LLM_DRIVER: "mock",
    EMAIL_DRIVER: "mock",
    APP_BASE_URL: "https://callmeming.com",
    WAFFO_PRODUCT_ID: "PROD_test_product",
    RATE_LIMIT_PEPPER: "test-pepper",
    CORS_ALLOWED_ORIGINS: "https://callmeming.com",
  });

  const container = createContainer({
    config,
    clock,
    persistence,
    waffo,
    llm,
    email,
    verifier,
    exposeCheckoutInternals: true,
    freeNamesHooks: {
      onGenerate: (g) => preferenceLog.push(g),
    },
    alertMissingOrder: options?.alertMissingOrder,
  });

  setContainer(container);

  return {
    container,
    clock,
    persistence,
    waffo,
    llm,
    email,
    preferenceLog,
    sign(body: string, ts?: number) {
      return signWaffoWebhook(
        body,
        TEST_WAFFO_PRIVATE_KEY,
        ts ?? clock.now().getTime(),
      );
    },
    reset() {
      setContainer(null);
    },
  };
}

export type TestApp = ReturnType<typeof buildTestApp>;

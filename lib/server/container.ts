import { systemClock, type Clock } from "./clock";
import { loadConfig, type AppConfig } from "./config";
import { createMockEmailClient } from "./email/mock";
import { createResendEmailClient } from "./email/resend";
import type { EmailClient } from "./email/types";
import { createFulfillmentService, type FulfillmentService } from "./fulfillment/service";
import { createAnthropicLlmClient } from "./llm/anthropic";
import { createMockLlmClient } from "./llm/mock";
import type { LlmClient } from "./llm/types";
import { createMemoryPersistence } from "./persistence/memory";
import { createSupabasePersistence } from "./persistence/supabase";
import type { Persistence } from "./persistence/types";
import { createRateLimitService, type RateLimitService } from "./rate-limit/service";
import { createCheckoutService, type CheckoutService } from "./services/checkout";
import {
  createFreeNamesService,
  type FreeNamesHooks,
  type FreeNamesService,
} from "./services/free-names";
import { createResultsService, type ResultsService } from "./services/results";
import { createWebhookService, type WebhookService } from "./services/webhook";
import { createRealWaffoClient } from "./waffo/client";
import { createMockWaffoClient, type MockWaffoClient } from "./waffo/mock";
import type { WaffoClient, WaffoWebhookVerifier } from "./waffo/types";
import { createConfiguredWebhookVerifier } from "./waffo/verify";
import { createPemWebhookVerifier } from "./waffo/mock";
import { parseAllowedOrigins } from "./cors";

export type AppContainer = {
  config: AppConfig;
  clock: Clock;
  persistence: Persistence;
  rateLimit: RateLimitService;
  freeNames: FreeNamesService;
  checkout: CheckoutService;
  results: ResultsService;
  webhook: WebhookService;
  fulfillment: FulfillmentService;
  waffo: WaffoClient;
  llm: LlmClient;
  email: EmailClient;
  verifier: WaffoWebhookVerifier;
  corsAllowedOrigins: string[];
  /** test helpers */
  mocks: {
    waffo?: MockWaffoClient;
    email?: ReturnType<typeof createMockEmailClient>;
    llm?: ReturnType<typeof createMockLlmClient>;
  };
};

let singleton: AppContainer | null = null;

export type CreateContainerOptions = {
  config?: AppConfig;
  clock?: Clock;
  persistence?: Persistence;
  waffo?: WaffoClient;
  llm?: LlmClient;
  email?: EmailClient;
  verifier?: WaffoWebhookVerifier;
  freeNamesHooks?: FreeNamesHooks;
  exposeCheckoutInternals?: boolean;
  alertMissingOrder?: (info: unknown) => void;
};

export function createContainer(
  options: CreateContainerOptions = {},
): AppContainer {
  const config = options.config ?? loadConfig();
  const clock = options.clock ?? systemClock;

  let persistence = options.persistence;
  if (!persistence) {
    if (
      config.persistenceDriver === "supabase" &&
      config.supabaseUrl &&
      config.supabaseServiceRoleKey
    ) {
      persistence = createSupabasePersistence(
        config.supabaseUrl,
        config.supabaseServiceRoleKey,
      );
    } else {
      persistence = createMemoryPersistence();
    }
  }

  let waffo = options.waffo;
  let mockWaffo: MockWaffoClient | undefined;
  if (!waffo) {
    if (
      config.waffoDriver === "real" &&
      config.waffoMerchantId &&
      config.waffoPrivateKey
    ) {
      waffo = createRealWaffoClient({
        merchantId: config.waffoMerchantId,
        privateKey: config.waffoPrivateKey,
      });
    } else {
      mockWaffo = createMockWaffoClient();
      waffo = mockWaffo;
    }
  }

  let llm = options.llm;
  let mockLlm: ReturnType<typeof createMockLlmClient> | undefined;
  if (!llm) {
    if (config.llmDriver === "anthropic" && config.anthropicApiKey) {
      llm = createAnthropicLlmClient({
        apiKey: config.anthropicApiKey,
        model: config.anthropicModel,
      });
    } else {
      mockLlm = createMockLlmClient();
      llm = mockLlm;
    }
  }

  let email = options.email;
  let mockEmail: ReturnType<typeof createMockEmailClient> | undefined;
  if (!email) {
    if (config.emailDriver === "resend" && config.resendApiKey) {
      email = createResendEmailClient({
        apiKey: config.resendApiKey,
        from: config.emailFrom,
      });
    } else {
      mockEmail = createMockEmailClient();
      email = mockEmail;
    }
  }

  const verifier =
    options.verifier ??
    createConfiguredWebhookVerifier(config.waffoWebhookPublicKey);

  const rateLimit = createRateLimitService({
    persistence,
    clock,
    pepper: config.rateLimitPepper,
  });

  const freeNames = createFreeNamesService({
    rateLimit,
    hooks: options.freeNamesHooks,
  });

  const checkout = createCheckoutService({
    persistence,
    waffo,
    clock,
    appBaseUrl: config.appBaseUrl,
    productId: config.waffoProductId,
    exposeInternals: options.exposeCheckoutInternals,
  });

  const results = createResultsService({ persistence, clock });

  const fulfillment = createFulfillmentService({
    persistence,
    llm,
    email,
    clock,
    appBaseUrl: config.appBaseUrl,
  });

  const webhook = createWebhookService({
    persistence,
    verifier,
    fulfillment,
    clock,
    alertMissingOrder: options.alertMissingOrder,
  });

  return {
    config,
    clock,
    persistence,
    rateLimit,
    freeNames,
    checkout,
    results,
    webhook,
    fulfillment,
    waffo,
    llm,
    email,
    verifier,
    corsAllowedOrigins: config.corsAllowedOrigins.length
      ? config.corsAllowedOrigins
      : parseAllowedOrigins(process.env.CORS_ALLOWED_ORIGINS),
    mocks: { waffo: mockWaffo, email: mockEmail, llm: mockLlm },
  };
}

export function getContainer(): AppContainer {
  if (!singleton) singleton = createContainer();
  return singleton;
}

/** Tests only */
export function setContainer(c: AppContainer | null) {
  singleton = c;
}

export { createPemWebhookVerifier };

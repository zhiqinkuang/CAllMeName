export type AppConfig = {
  appBaseUrl: string;
  corsAllowedOrigins: string[];
  rateLimitPepper: string;
  persistenceDriver: "memory" | "supabase";
  supabaseUrl?: string;
  supabaseServiceRoleKey?: string;
  waffoDriver: "mock" | "real";
  waffoMerchantId?: string;
  waffoPrivateKey?: string;
  waffoProductId: string;
  waffoWebhookPublicKey?: string;
  llmDriver: "mock" | "anthropic";
  anthropicApiKey?: string;
  anthropicModel: string;
  emailDriver: "mock" | "resend";
  resendApiKey?: string;
  emailFrom: string;
};

function splitOrigins(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter((o) => o && o !== "*");
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  return {
    appBaseUrl: (env.APP_BASE_URL || "http://localhost:3000").replace(/\/$/, ""),
    corsAllowedOrigins: splitOrigins(env.CORS_ALLOWED_ORIGINS),
    rateLimitPepper: env.RATE_LIMIT_PEPPER || "dev-insecure-pepper",
    persistenceDriver:
      env.PERSISTENCE_DRIVER === "supabase" ? "supabase" : "memory",
    supabaseUrl: env.SUPABASE_URL,
    supabaseServiceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
    waffoDriver: env.WAFFO_DRIVER === "real" ? "real" : "mock",
    waffoMerchantId: env.WAFFO_MERCHANT_ID,
    waffoPrivateKey: env.WAFFO_PRIVATE_KEY,
    waffoProductId: env.WAFFO_PRODUCT_ID || "PROD_placeholder",
    waffoWebhookPublicKey: env.WAFFO_WEBHOOK_PUBLIC_KEY,
    llmDriver: env.LLM_DRIVER === "anthropic" ? "anthropic" : "mock",
    anthropicApiKey: env.ANTHROPIC_API_KEY,
    anthropicModel:
      env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514",
    emailDriver: env.EMAIL_DRIVER === "resend" ? "resend" : "mock",
    resendApiKey: env.RESEND_API_KEY,
    emailFrom:
      env.EMAIL_FROM || "CallMeMing <hello@mail.callmeming.com>",
  };
}

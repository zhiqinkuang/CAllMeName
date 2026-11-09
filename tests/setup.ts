import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => {
  cleanup();
});

process.env.RATE_LIMIT_PEPPER = process.env.RATE_LIMIT_PEPPER || "test-pepper";
process.env.APP_BASE_URL = process.env.APP_BASE_URL || "https://callmeming.com";
process.env.WAFFO_PRODUCT_ID = process.env.WAFFO_PRODUCT_ID || "PROD_test_product";
process.env.WAFFO_ENV = process.env.WAFFO_ENV || "test";
process.env.CORS_ALLOWED_ORIGINS =
  process.env.CORS_ALLOWED_ORIGINS || "https://callmeming.com";
process.env.EMAIL_FROM =
  process.env.EMAIL_FROM || "CallMeMing <hello@mail.callmeming.com>";
process.env.PERSISTENCE_DRIVER = "memory";
process.env.WAFFO_DRIVER = "mock";
process.env.LLM_DRIVER = "mock";
process.env.EMAIL_DRIVER = "mock";

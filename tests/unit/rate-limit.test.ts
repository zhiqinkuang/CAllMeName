import { describe, expect, it } from "vitest";
import { createFixedClock } from "@/lib/server/clock";
import { ApiError } from "@/lib/server/errors";
import { createMemoryPersistence } from "@/lib/server/persistence/memory";
import { createRateLimitService } from "@/lib/server/rate-limit/service";

describe("IP rate limit (B-B1)", () => {
  it("allows 3 per rolling hour then 429", async () => {
    const clock = createFixedClock("2026-11-09T10:00:00.000Z");
    const persistence = createMemoryPersistence();
    const rl = createRateLimitService({
      persistence,
      clock,
      pepper: "pepper",
    });
    await rl.assertAndRecord("1.1.1.1");
    await rl.assertAndRecord("1.1.1.1");
    await rl.assertAndRecord("1.1.1.1");
    await expect(rl.assertAndRecord("1.1.1.1")).rejects.toMatchObject({
      status: 429,
      body: { error: "rate_limited" },
    });
  });

  it("enforces UTC day limit of 10", async () => {
    const clock = createFixedClock("2026-11-09T00:00:00.000Z");
    const persistence = createMemoryPersistence();
    const rl = createRateLimitService({
      persistence,
      clock,
      pepper: "pepper",
    });
    for (let i = 0; i < 10; i++) {
      // space requests so hour window doesn't trip first: advance 10 minutes
      clock.set(
        new Date(
          Date.parse("2026-11-09T00:00:00.000Z") + i * 10 * 60 * 1000,
        ).toISOString(),
      );
      // reset hour by jumping? Actually rolling hour of 3 will trip earlier.
      // Use different approach: seed 10 events across >1 hour via persistence directly
    }
    // Seed 10 events in UTC day with timestamps spread > 1 hour apart conceptually
    // by inserting directly, then asserting the 11th
    const { hashIp } = await import("@/lib/server/crypto");
    const ipHash = hashIp("2.2.2.2", "pepper");
    for (let i = 0; i < 10; i++) {
      await persistence.insertRateLimitEvent(
        ipHash,
        new Date(Date.UTC(2026, 10, 9, i, 0, 0)),
      );
    }
    clock.set("2026-11-09T12:00:00.000Z");
    await expect(rl.assertAndRecord("2.2.2.2")).rejects.toBeInstanceOf(ApiError);
  });

  it("stores only hashed IP", async () => {
    const clock = createFixedClock("2026-11-09T10:00:00.000Z");
    const persistence = createMemoryPersistence();
    const rl = createRateLimitService({
      persistence,
      clock,
      pepper: "pepper",
    });
    await rl.assertAndRecord("9.9.9.9");
    const dump = persistence.__dump();
    expect(dump.rate[0]!.ipHash).not.toContain("9.9.9.9");
    expect(dump.rate[0]!.ipHash).toHaveLength(64);
  });
});

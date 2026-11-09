import { hashIp } from "../crypto";
import { rateLimited } from "../errors";
import type { Clock } from "../clock";
import type { Persistence } from "../persistence/types";

const HOUR_MS = 60 * 60 * 1000;
const HOUR_LIMIT = 3;
const DAY_LIMIT = 10;

function utcDayStart(now: Date): Date {
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
}

export type RateLimitService = {
  /**
   * Throws ApiError 429 if over limit; otherwise records a successful attempt.
   * Call AFTER generation succeeds so failed gens don't burn quota? Spec says
   * record on free generation — we record on successful path only.
   */
  assertAndRecord(ip: string): Promise<void>;
};

export function createRateLimitService(deps: {
  persistence: Persistence;
  clock: Clock;
  pepper: string;
}): RateLimitService {
  const { persistence, clock, pepper } = deps;

  return {
    async assertAndRecord(ip: string) {
      const now = clock.now();
      const ipHash = hashIp(ip, pepper);
      const hourAgo = new Date(now.getTime() - HOUR_MS);
      const dayStart = utcDayStart(now);

      const hourCount = await persistence.countRateLimitEventsSince(
        ipHash,
        hourAgo,
      );
      if (hourCount >= HOUR_LIMIT) {
        const earliest = await persistence.earliestRateLimitEventSince(
          ipHash,
          hourAgo,
        );
        const retryAfterSeconds = earliest
          ? Math.max(
              1,
              Math.ceil(
                (Date.parse(earliest.createdAt) + HOUR_MS - now.getTime()) /
                  1000,
              ),
            )
          : 3600;
        throw rateLimited(retryAfterSeconds);
      }

      const dayCount = await persistence.countRateLimitEventsUtcDay(
        ipHash,
        dayStart,
      );
      if (dayCount >= DAY_LIMIT) {
        const nextDay = new Date(dayStart.getTime() + 24 * HOUR_MS);
        const retryAfterSeconds = Math.max(
          1,
          Math.ceil((nextDay.getTime() - now.getTime()) / 1000),
        );
        throw rateLimited(retryAfterSeconds);
      }

      await persistence.insertRateLimitEvent(ipHash, now);
    },
  };
}

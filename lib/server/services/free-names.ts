import type { RateLimitService } from "../rate-limit/service";
import { generateFreeCards } from "../names/generator";
import { parseOptionalGenderPreference } from "../validation";
import type { FreeCard, GenderPreference } from "../types";

export type FreeNamesService = {
  generate(args: {
    body: unknown;
    ip: string;
  }): Promise<{ cards: FreeCard[]; genderPreference: GenderPreference }>;
};

/**
 * Optional spy hook for tests: records preference actually passed to generator.
 */
export type FreeNamesHooks = {
  onGenerate?: (genderPreference: GenderPreference) => void;
};

export function createFreeNamesService(deps: {
  rateLimit: RateLimitService;
  hooks?: FreeNamesHooks;
}): FreeNamesService {
  const { rateLimit, hooks } = deps;

  return {
    async generate({ body, ip }) {
      const raw =
        body && typeof body === "object"
          ? (body as Record<string, unknown>).genderPreference
          : undefined;
      const genderPreference = parseOptionalGenderPreference(raw);

      // Rate limit before generation
      await rateLimit.assertAndRecord(ip);

      hooks?.onGenerate?.(genderPreference);

      const cards = generateFreeCards({ genderPreference, count: 3 });
      return { cards, genderPreference };
    },
  };
}

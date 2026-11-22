import type { FreeCard } from "@/lib/api/types";
import { CRAWLER_SAMPLE_CARDS, isCrawler } from "@/lib/crawlers";
import {
  parseGeneratorParam,
  type GeneratorState,
} from "@/lib/demo-data";

export function resolveHomepageProps(args: {
  generatorParam?: string | null;
  userAgent?: string | null;
}): {
  forcedState: GeneratorState | null;
  sampleCards: FreeCard[] | null;
} {
  const forcedState = parseGeneratorParam(args.generatorParam ?? null);
  if (forcedState) {
    return { forcedState, sampleCards: null };
  }
  if (isCrawler(args.userAgent)) {
    return { forcedState: null, sampleCards: CRAWLER_SAMPLE_CARDS };
  }
  return { forcedState: null, sampleCards: null };
}

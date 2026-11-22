import type { FreeCard } from "@/lib/api/types";
import { postFreeNames, type FreeNamesResult } from "@/lib/api/free-names";
import type { GenderPreference } from "@/lib/api/types";

export const FREE_NAMES_SESSION_KEY = "callmeming.freeNames.v1";

export type FreeNamesSession = {
  cards: FreeCard[];
};

function isThreeCards(value: unknown): value is FreeCard[] {
  return (
    Array.isArray(value) &&
    value.length === 3 &&
    value.every(
      (card) =>
        !!card &&
        typeof card === "object" &&
        typeof (card as FreeCard).hanzi === "string" &&
        typeof (card as FreeCard).pinyin === "string",
    )
  );
}

function resolveStorage(storage?: Storage | null): Storage | null {
  if (storage !== undefined) return storage;
  try {
    if (typeof sessionStorage === "undefined") return null;
    return sessionStorage;
  } catch {
    return null;
  }
}

export function readFreeNamesSession(
  storage?: Storage | null,
): FreeNamesSession | null {
  const store = resolveStorage(storage);
  if (!store) return null;
  try {
    const raw = store.getItem(FREE_NAMES_SESSION_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    const cards =
      parsed && typeof parsed === "object"
        ? (parsed as { cards?: unknown }).cards
        : undefined;
    if (!isThreeCards(cards)) return null;
    return { cards };
  } catch {
    return null;
  }
}

export function writeFreeNamesSession(
  session: FreeNamesSession,
  storage?: Storage | null,
): void {
  if (!isThreeCards(session.cards)) return;
  const store = resolveStorage(storage);
  if (!store) return;
  try {
    store.setItem(FREE_NAMES_SESSION_KEY, JSON.stringify({ cards: session.cards }));
  } catch {
    // Private mode or quota — session reuse is best-effort; IP limits still apply.
  }
}

let inFlight: { key: string; promise: Promise<FreeNamesResult> } | null = null;

/** Share an in-flight first-load request so React Strict Mode remounts do not double-count. */
export function requestFreeNames(
  genderPreference: GenderPreference,
): Promise<FreeNamesResult> {
  if (inFlight && inFlight.key === genderPreference) return inFlight.promise;
  const promise = postFreeNames(genderPreference).finally(() => {
    if (inFlight?.promise === promise) inFlight = null;
  });
  inFlight = { key: genderPreference, promise };
  return promise;
}

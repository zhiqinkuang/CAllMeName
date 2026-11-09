import type { ApiErrorBody, FreeCard, GenderPreference } from "./types";

export type FreeNamesSuccess = { ok: true; cards: FreeCard[] };
export type FreeNamesRateLimited = {
  ok: false;
  kind: "rate_limited";
  retryAfterSeconds?: number;
  message: string;
};
export type FreeNamesFailure = {
  ok: false;
  kind: "error";
  message: string;
};
export type FreeNamesResult =
  | FreeNamesSuccess
  | FreeNamesRateLimited
  | FreeNamesFailure;

function isFreeCard(v: unknown): v is FreeCard {
  return (
    !!v &&
    typeof v === "object" &&
    typeof (v as FreeCard).hanzi === "string" &&
    typeof (v as FreeCard).pinyin === "string"
  );
}

export async function postFreeNames(
  genderPreference: GenderPreference = "neutral",
  fetchImpl: typeof fetch = fetch,
): Promise<FreeNamesResult> {
  let res: Response;
  try {
    res = await fetchImpl("/api/names/free", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ genderPreference }),
    });
  } catch {
    return { ok: false, kind: "error", message: "Network error. Please try again." };
  }

  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }

  if (res.status === 429) {
    const err = (body ?? {}) as ApiErrorBody;
    return {
      ok: false,
      kind: "rate_limited",
      retryAfterSeconds: err.retryAfterSeconds,
      message: err.message || "Too many free generations. Try again later.",
    };
  }

  if (!res.ok) {
    const err = (body ?? {}) as ApiErrorBody;
    return {
      ok: false,
      kind: "error",
      message: err.message || "Something went wrong. Please try again.",
    };
  }

  const cards = (body as { cards?: unknown })?.cards;
  if (!Array.isArray(cards) || cards.length !== 3 || !cards.every(isFreeCard)) {
    return {
      ok: false,
      kind: "error",
      message: "Unexpected response. Please try again.",
    };
  }

  return { ok: true, cards };
}

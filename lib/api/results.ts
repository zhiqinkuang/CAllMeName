import type { ApiErrorBody, FullCard } from "./types";

export type ResultsReady = { ok: true; status: "ready"; cards: FullCard[] };
export type ResultsGenerating = { ok: true; status: "generating" };
export type ResultsFailed = {
  ok: false;
  status: "failed";
  message: string;
};
export type ResultsNotFound = {
  ok: false;
  status: "not_found";
  message: string;
};
export type ResultsError = {
  ok: false;
  status: "error";
  message: string;
};
export type ResultsResult =
  | ResultsReady
  | ResultsGenerating
  | ResultsFailed
  | ResultsNotFound
  | ResultsError;

function isFullCard(v: unknown): v is FullCard {
  if (!v || typeof v !== "object") return false;
  const c = v as FullCard;
  return (
    typeof c.hanzi === "string" &&
    typeof c.pinyin === "string" &&
    typeof c.phoneticHint === "string" &&
    (c.audioUrl === null || typeof c.audioUrl === "string") &&
    typeof c.whyItFitsYou === "string" &&
    typeof c.selfIntroduction === "string"
  );
}

export async function getResult(
  token: string,
  fetchImpl: typeof fetch = fetch,
): Promise<ResultsResult> {
  let res: Response;
  try {
    res = await fetchImpl(`/api/results/${encodeURIComponent(token)}`, {
      method: "GET",
      headers: { Accept: "application/json" },
    });
  } catch {
    return {
      ok: false,
      status: "error",
      message: "Network error. Please try again.",
    };
  }

  let json: unknown = null;
  try {
    json = await res.json();
  } catch {
    json = null;
  }

  if (res.status === 404) {
    const err = (json ?? {}) as ApiErrorBody;
    return {
      ok: false,
      status: "not_found",
      message: err.message || "This result link is invalid.",
    };
  }

  if (res.status === 202) {
    return { ok: true, status: "generating" };
  }

  if (!res.ok) {
    const err = (json ?? {}) as ApiErrorBody;
    return {
      ok: false,
      status: "error",
      message: err.message || "Something went wrong. Please try again.",
    };
  }

  const status = (json as { status?: string })?.status;
  if (status === "failed") {
    const msg = (json as { message?: string })?.message;
    return {
      ok: false,
      status: "failed",
      message:
        msg ||
        "We could not prepare your names. Please contact support with your payment email.",
    };
  }

  if (status === "ready") {
    const cards = (json as { cards?: unknown })?.cards;
    if (!Array.isArray(cards) || cards.length !== 3 || !cards.every(isFullCard)) {
      return {
        ok: false,
        status: "error",
        message: "Unexpected response. Please try again.",
      };
    }
    return { ok: true, status: "ready", cards };
  }

  if (status === "generating") {
    return { ok: true, status: "generating" };
  }

  return {
    ok: false,
    status: "error",
    message: "Unexpected response. Please try again.",
  };
}

export const RESULTS_POLL_MS = 2000;
export const RESULTS_TIMEOUT_MS = 60_000;

import type { ApiErrorBody, DesiredFeeling, GenderPreference } from "./types";

export type CheckoutRequest = {
  englishName: string;
  genderPreference: GenderPreference;
  desiredFeeling: DesiredFeeling;
};

export type CheckoutSuccess = { ok: true; checkoutUrl: string };
export type CheckoutValidation = {
  ok: false;
  kind: "validation_error";
  message: string;
  fields?: Record<string, string>;
};
export type CheckoutUnavailable = {
  ok: false;
  kind: "checkout_create_failed";
  message: string;
};
export type CheckoutFailure = {
  ok: false;
  kind: "error";
  message: string;
};
export type CheckoutResult =
  | CheckoutSuccess
  | CheckoutValidation
  | CheckoutUnavailable
  | CheckoutFailure;

export async function postCheckout(
  body: CheckoutRequest,
  fetchImpl: typeof fetch = fetch,
): Promise<CheckoutResult> {
  let res: Response;
  try {
    res = await fetchImpl("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        englishName: body.englishName.trim(),
        genderPreference: body.genderPreference,
        desiredFeeling: body.desiredFeeling,
      }),
    });
  } catch {
    return {
      ok: false,
      kind: "error",
      message: "Network error. Please try again.",
    };
  }

  let json: unknown = null;
  try {
    json = await res.json();
  } catch {
    json = null;
  }

  if (res.status === 400) {
    const err = (json ?? {}) as ApiErrorBody;
    return {
      ok: false,
      kind: "validation_error",
      message: err.message || "Please check your form.",
      fields: err.fields,
    };
  }

  if (res.status === 502) {
    const err = (json ?? {}) as ApiErrorBody;
    return {
      ok: false,
      kind: "checkout_create_failed",
      message:
        err.message ||
        "Checkout is temporarily unavailable. Please try again.",
    };
  }

  if (!res.ok) {
    const err = (json ?? {}) as ApiErrorBody;
    return {
      ok: false,
      kind: "error",
      message: err.message || "Something went wrong. Please try again.",
    };
  }

  const checkoutUrl = (json as { checkoutUrl?: unknown })?.checkoutUrl;
  if (typeof checkoutUrl !== "string" || !checkoutUrl) {
    return {
      ok: false,
      kind: "error",
      message: "Unexpected response. Please try again.",
    };
  }

  return { ok: true, checkoutUrl };
}

/** Navigate to hosted checkout. Must use location.href — never window.open. */
export function redirectToCheckout(checkoutUrl: string): void {
  // Prefer window when present (browser); fall back to globalThis.location for tests.
  const w = typeof window !== "undefined" ? window : undefined;
  if (w) {
    w.location.href = checkoutUrl;
    return;
  }
  (globalThis as { location: { href: string } }).location.href = checkoutUrl;
}

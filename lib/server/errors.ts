export type ApiErrorBody = {
  error: string;
  message: string;
  retryAfterSeconds?: number;
  fields?: Record<string, string>;
};

export class ApiError extends Error {
  readonly status: number;
  readonly body: ApiErrorBody;

  constructor(status: number, body: ApiErrorBody) {
    super(body.message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

export function validationError(
  message: string,
  fields?: Record<string, string>,
): ApiError {
  return new ApiError(400, {
    error: "validation_error",
    message,
    ...(fields ? { fields } : {}),
  });
}

export function rateLimited(retryAfterSeconds: number): ApiError {
  return new ApiError(429, {
    error: "rate_limited",
    message: "Too many free generations. Try again later.",
    retryAfterSeconds,
  });
}

export function notFound(): ApiError {
  return new ApiError(404, {
    error: "not_found",
    message: "This result link is invalid.",
  });
}

export function checkoutCreateFailed(): ApiError {
  return new ApiError(502, {
    error: "checkout_create_failed",
    message: "Checkout is temporarily unavailable. Please try again.",
  });
}

export function unauthorized(): ApiError {
  return new ApiError(401, {
    error: "unauthorized",
    message: "Invalid webhook signature.",
  });
}

export function internalError(message = "Internal server error."): ApiError {
  return new ApiError(500, {
    error: "internal_error",
    message,
  });
}

export function jsonError(err: unknown): Response {
  if (err instanceof ApiError) {
    return Response.json(err.body, { status: err.status });
  }
  console.error(err);
  return Response.json(
    { error: "internal_error", message: "Internal server error." },
    { status: 500 },
  );
}

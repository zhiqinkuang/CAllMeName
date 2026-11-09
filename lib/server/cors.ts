export function parseAllowedOrigins(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .filter((o) => o !== "*");
}

export function corsHeaders(
  request: Request,
  allowedOrigins: string[],
): Record<string, string> {
  const origin = request.headers.get("origin");
  const headers: Record<string, string> = {
    Vary: "Origin",
  };
  if (origin && allowedOrigins.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Access-Control-Allow-Methods"] = "GET,POST,OPTIONS";
    headers["Access-Control-Allow-Headers"] = "Content-Type";
  }
  return headers;
}

export function withCors(
  request: Request,
  response: Response,
  allowedOrigins: string[],
): Response {
  const headers = corsHeaders(request, allowedOrigins);
  const next = new Headers(response.headers);
  for (const [k, v] of Object.entries(headers)) next.set(k, v);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: next,
  });
}

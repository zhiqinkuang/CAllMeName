import { withCors } from "./cors";
import { jsonError } from "./errors";
import { getContainer } from "./container";
import { extractClientIp } from "./ip";

export function apiJson(
  request: Request,
  body: unknown,
  init?: { status?: number },
): Response {
  const { corsAllowedOrigins } = getContainer();
  const res = Response.json(body, {
    status: init?.status ?? 200,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
  return withCors(request, res, corsAllowedOrigins);
}

export function handleOptions(request: Request): Response {
  const { corsAllowedOrigins } = getContainer();
  return withCors(
    request,
    new Response(null, { status: 204 }),
    corsAllowedOrigins,
  );
}

export async function readJsonBody(request: Request): Promise<unknown> {
  const text = await request.text();
  if (!text || !text.trim()) return {};
  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
}

export { extractClientIp, jsonError };

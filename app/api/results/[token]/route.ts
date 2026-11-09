import { getContainer } from "@/lib/server/container";
import { apiJson, handleOptions, jsonError } from "@/lib/server/http";

export async function GET(
  request: Request,
  context: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await context.params;
    const { results } = getContainer();
    const out = await results.getByToken(token);
    return apiJson(request, out.body, { status: out.httpStatus });
  } catch (err) {
    const { corsAllowedOrigins } = getContainer();
    const res = jsonError(err);
    const { withCors } = await import("@/lib/server/cors");
    return withCors(request, res, corsAllowedOrigins);
  }
}

export async function OPTIONS(request: Request) {
  return handleOptions(request);
}

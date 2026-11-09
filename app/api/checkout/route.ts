import { getContainer } from "@/lib/server/container";
import {
  apiJson,
  handleOptions,
  jsonError,
  readJsonBody,
} from "@/lib/server/http";

export async function POST(request: Request) {
  try {
    const body = await readJsonBody(request);
    const { checkout } = getContainer();
    const result = await checkout.checkout(body);
    // Strict contract: only checkoutUrl
    return apiJson(request, { checkoutUrl: result.checkoutUrl });
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

import { getContainer } from "@/lib/server/container";
import {
  apiJson,
  extractClientIp,
  handleOptions,
  jsonError,
  readJsonBody,
} from "@/lib/server/http";

export async function POST(request: Request) {
  try {
    const body = await readJsonBody(request);
    const ip = extractClientIp(request);
    const { freeNames } = getContainer();
    const { cards } = await freeNames.generate({ body, ip });
    return apiJson(request, { cards });
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

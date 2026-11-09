import { apiJson, handleOptions } from "@/lib/server/http";

export async function GET(request: Request) {
  return apiJson(request, { ok: true });
}

export async function OPTIONS(request: Request) {
  return handleOptions(request);
}

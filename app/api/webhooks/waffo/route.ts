import { getContainer } from "@/lib/server/container";
import { jsonError } from "@/lib/server/errors";

async function scheduleAfter(job: () => Promise<void>) {
  try {
    const { after } = await import("next/server");
    after(async () => {
      try {
        await job();
      } catch (e) {
        console.error("async fulfillment error", e);
      }
    });
  } catch {
    // Vitest / non-request scope: do not block 2xx; tests call fulfill explicitly.
  }
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-waffo-signature");
    const event = request.headers.get("x-waffo-event");
    const { webhook } = getContainer();
    const result = await webhook.handle(rawBody, { signature, event });

    if (result.asyncJob) {
      await scheduleAfter(result.asyncJob);
    }

    return Response.json(result.body, { status: result.httpStatus });
  } catch (err) {
    return jsonError(err);
  }
}

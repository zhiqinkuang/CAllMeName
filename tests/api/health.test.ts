import { afterEach, describe, expect, it } from "vitest";
import { GET } from "@/app/api/health/route";
import { buildTestApp } from "../helpers/app";

describe("GET /api/health (B-A1)", () => {
  let app: ReturnType<typeof buildTestApp>;
  afterEach(() => app?.reset());

  it("returns { ok: true }", async () => {
    app = buildTestApp();
    const res = await GET(new Request("http://localhost/api/health"));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });
});

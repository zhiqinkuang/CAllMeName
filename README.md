# CallMeMing — frontend (exhibit baseline + F-T3–F-T8 clients)

Visual layer on **`/workspace/callmeming-ui/exhibit/`**, wired to OpenSpec API contract **v1.1** (`/workspace/openspec/callmeming-mvp/api-contract.md`).

## Design baseline

**Visual source of truth:** `/workspace/callmeming-ui/exhibit/`. Root MVP pen/previews are archive only.

## Workspace

- Project: `/workspace/callmeming`
- Local box only for this task. No GitHub/Origin push required from F-T3–F-T8.

## Stack

- Next.js 15 (App Router) + TypeScript
- Custom CSS from exhibit tokens (no Tailwind / shadcn)
- Lucide icons
- Client modules: `lib/api/{free-names,checkout,results,types}.ts`, `lib/validation/checkout.ts`
- Vitest + Testing Library (`npm test`)

## Run

```bash
cd /workspace/callmeming
npm install --legacy-peer-deps
npm test
npm run build
npx next start -p 3010
```

If native SWC bus-errors, keep `@next/swc-wasm-nodejs`.

## Pages

| Route | What |
|-------|------|
| `/` | Hero → Generator (`POST /api/names/free`) → Free vs Custom → Customize (`POST /api/checkout` → `location.href`) → How it works → FAQ×3 → Footer |
| `/results/[token]` | `GET /api/results/:token`; poll 202 every 2s; ready / failed / not_found |

### Name style (v1.1)

- Default **Either is fine** → body `{ "genderPreference": "neutral" }` (UI always sends the enum; does not rely on empty `{}`)
- Typically feminine / Typically masculine → `feminine` / `masculine`
- 429 UI copy: “a few names each day” only

### Feeling chips

Contract six only: Friendly / Calm / Bright / Elegant / Modern / Scholarly.

### Results interactions

- Copy name = `hanzi` only; Copy intro = `selfIntroduction`
- Play = visual Playing… + `phoneticHint` (`audioUrl` null this MVP)
- Open paper → elevates that card to primary (`?paper=0|1|2`)

### QA query params

- Homepage: `/?generator=empty|generating|limit` (forces visual state; ready is not seeded with demo names)
- Results: `/results/{token}?paper=0|1|2` (legacy `anran|jingxing|qingyue` aliases still parse)

## Tests

`tests/frontend/*` cover F-T3–F-T8 clients and Generator / CustomizeForm / ResultView wiring (27 tests).

## Style QA

See `style-qa/` and `STYLE-NOTES.md` (includes API vs exhibit diffs).

## Docs

- Deploy / PR prep (B-F3): [`docs/DEPLOY-CHECKLIST.md`](docs/DEPLOY-CHECKLIST.md)

## Scope note

This F-T3–F-T8 pass implements **frontend clients + UI wiring**. Empty `app/api/**` placeholders may be filled by a parallel backend agent on the shared box; this frontend task did not author Route Handlers.

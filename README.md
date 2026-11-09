# CallMeMing — style preview (frontend)

Visual / presentation layer for CallMeMing. **Not** a production business implementation.

## Design baseline (confirmed)

**Development visual source of truth:** `/workspace/callmeming-ui/exhibit/` (展厅标本).

- Design notes: `exhibit/CallMeMing-展厅标本-设计说明.md`
- Motion: `exhibit/CallMeMing-展厅标本-关键动效说明.md`
- Previews: `exhibit/previews/`

Root-directory MVP files (`/workspace/callmeming-ui/CallMeMing-*.pen`, `previews/`, `CallMeMing-设计说明.md`, etc.) are **archived only** — do not implement against them.

## Workspace

- Project: `/workspace/callmeming`
- Local box workspace (Cursor / Grok Bot). No GitHub/Origin push from this task.

## Stack

- Next.js 15 (App Router) + TypeScript
- Custom CSS from `exhibit/previews/_tokens.css` (no Tailwind / shadcn)
- Lucide icons
- Local mock data (Elena · 林安然 / 苏景行 / 沈清越)

## Run

```bash
cd /workspace/callmeming
npm install
npm run build
npx next start -p 3010
```

If native SWC bus-errors in this environment, keep `@next/swc-wasm-nodejs` and leave `@next/swc-linux-x64-gnu` renamed/disabled.

## Pages

| Route | What |
|-------|------|
| `/` | Hero → generator (one state) → Free vs Custom → exhibit form → How it works → FAQ×3 → Footer |
| `/results/[token]` | One primary paper + Other candidates. Any token shows Elena demo. |

### QA query params

- Homepage: `/?generator=empty|generating|ready|limit` (default `empty`)
- Results: `/results/demo?paper=anran|jingxing|qingyue` (default `anran`)

### Mock interactions

- Generate → generating → ready stage (no `POST /api/names/free`)
- Continue to payment → validates English name → `/results/demo` (no Waffo)
- Open paper → elevates that name to the only primary paper
- Copy name = hanzi only; Copy intro = Chinese self-intro; Copied ~1.6s
- Play = visual `Playing…` only (`audioUrl` always null this round)

## Style QA

See `/workspace/callmeming/style-qa/` (`exhibit-*.png`) and `STYLE-NOTES.md`.

## Out of scope

Real APIs, webhooks, Waffo, auth walls, static card export, numerology.

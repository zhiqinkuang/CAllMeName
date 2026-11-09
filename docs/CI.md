# CI

GitHub Actions (`.github/workflows/ci.yml`) runs on pull requests and pushes to `main`.

## What it runs

- Node.js 20
- `npm ci`
- `npm run lint`
- `npm run typecheck` (`tsc --noEmit`)
- `npm test` (Vitest unit/API tests, including `tests/api/e2e.test.ts`)

There is no Playwright browser e2e job in CI.

## Out of scope for this setup

- Vercel / Supabase project wiring
- Real Waffo payment keys
- Real Resend (or other) email delivery keys

Those stay local/manual until secrets and hosting are configured separately.

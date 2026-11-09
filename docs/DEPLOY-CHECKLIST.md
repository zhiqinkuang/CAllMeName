# Deploy / PR prep checklist (B-F3)

Local deploy-prep for CallMeMing. **No real domain purchase and no live Waffo / Resend / production secrets required to complete this doc.** Fill placeholders when ops is ready; never commit real secrets.

Repo: `https://github.com/zhiqinkuang/CAllMeName` · suggested Vercel project name: `callmeming`

---

## 1. Database migration

- Path: `supabase/migrations/001_init.sql`
- Creates: `free_rate_limit_events`, `orders`, `name_cards`, `webhook_events` (+ indexes / RLS)
- Apply via Supabase SQL Editor or CLI after creating the project
- Server uses **service role**; anon/authenticated have no business-table write policies

---

## 2. Environment variables (from `.env.example`)

Group when configuring Vercel / local `.env.local`. Placeholders only in git.

| Group | Keys |
|-------|------|
| App / CORS | `APP_BASE_URL`, `NEXT_PUBLIC_SITE_URL`, `CORS_ALLOWED_ORIGINS` |
| Persistence | `PERSISTENCE_DRIVER`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| Rate limit | `RATE_LIMIT_PEPPER` |
| Waffo | `WAFFO_DRIVER`, `WAFFO_MERCHANT_ID`, `WAFFO_PRIVATE_KEY`, `WAFFO_PRODUCT_ID`, `WAFFO_STORE_ID`, `WAFFO_ENV`, `WAFFO_WEBHOOK_PUBLIC_KEY` |
| LLM | `LLM_DRIVER`, `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL` |
| Email | `EMAIL_DRIVER`, `RESEND_API_KEY`, `EMAIL_FROM` |

**CORS:** comma-separated whitelist only — **never `*`**. Main: `https://callmeming.com`. Staging suggestion (buy + ops confirm before locking): `https://staging.callmeming.com`. Vercel preview origins only if explicitly allowlisted.

---

## 3. Vercel Hobby (import GitHub)

1. Import `zhiqinkuang/CAllMeName` → project name **`callmeming`**
2. Plan: **Hobby only** (no Team / Pro required for this prep)
3. Framework: Next.js (defaults OK)
4. Set Production env vars from the table above (start with mock drivers if secrets are not ready)
5. Deploy from `main`; confirm `/api/health` returns `{ ok: true }`

Secrets live in **Vercel Project → Settings → Environment Variables**. Never commit them.

---

## 4. Supabase project

1. Create a project (region of choice)
2. Run `supabase/migrations/001_init.sql` in SQL Editor (or CLI migrate)
3. Copy URL + **service role** key into Vercel / `.env.local`
4. Set `PERSISTENCE_DRIVER=supabase` when ready; keep `memory` for local/tests without cloud

---

## 5. Secrets placement (never commit)

| Where | What |
|-------|------|
| Vercel env (Production / Preview) | App runtime secrets: Supabase service role, Waffo private key, Resend, Anthropic, `RATE_LIMIT_PEPPER`, CORS, base URLs |
| GitHub Actions secrets | Only if a future workflow needs them; current CI (`docs/CI.md`) needs **no** payment/email secrets |
| Local | `.env.local` (gitignored) |

Do **not** put secrets in the repo, PR descriptions, or commit messages.

---

## 6. Waffo Dashboard — Test checklist (placeholders)

Fill when Test Mode credentials exist:

| Item | Placeholder / pattern |
|------|------------------------|
| `productId` | Dashboard Test product → `WAFFO_PRODUCT_ID` |
| Webhook URL | `{APP_BASE_URL}/api/webhooks/waffo` (e.g. staging first: `https://staging.callmeming.com/api/webhooks/waffo`) |
| `successUrl` pattern (app-built) | `{APP_BASE_URL}/results/{token}` — token only in URL/email, never in checkout API response |
| Merchant / private key / webhook public key | Dashboard → env vars above |
| `WAFFO_ENV` | `test` until Live cutover |

Test Mode only for this prep. Live keys = SKIP until ops ready.

---

## 7. SKIP until ops ready

- Real domain DNS / purchase (`callmeming.com` / staging subdomain)
- Live (non-Test) Waffo keys and Live webhook endpoint
- Real Resend domain SPF / DKIM for `mail.callmeming.com`
- Announcing staging URL as locked before domain + ops confirm

Local/mock drivers (`PERSISTENCE_DRIVER=memory`, `WAFFO_DRIVER=mock`, `EMAIL_DRIVER=mock`, `LLM_DRIVER=mock`) remain valid for CI and local TDD.

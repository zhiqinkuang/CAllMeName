# Style notes — CallMeMing 展厅标本

## Baseline

Implemented against **`/workspace/callmeming-ui/exhibit/`** (正式开发视觉基准，程序开发主管已确认).

Root MVP (`CallMeMing-*.pen`, `previews/`, root 设计/动效说明) kept on disk for archive only — **not** used for implementation.

## Visual language

| Token / pattern | Value |
|-----------------|--------|
| Page | `#F8F6F2` |
| Stage | `#B7D2C8` full-bleed (no panel stroke / no rounded container) |
| Silk paper | `#FFFEFB` + 1px edge `#D6CFC2` (no blur shadow card stack) |
| CTA | Ink stamp + inset 3px `#2F5545`; Customize = text link |
| Brand | Ink「名」+ CallMeMing (no celadon square) |
| Radius | 0–2 |
| Free layout | ~188px primary + ~52px catalog (not three equal floating cards) |
| Result | One primary paper + Other candidates + Open paper |
| Form | Exhibit seg control + `#EFECE6` wash; stamp Continue CTA |
| Name style | Full labels + visible “Name style” on desktop & mobile |

## Confirmed absences in CSS

No `#F4EFE6` page fill, no `#3F6F5B` solid rounded primary buttons, no silk floating-card shadow stack as the homepage generator language.

## Gaps vs exhibit PNG (honest)

1. Homepage embeds the customize form after Free vs Custom (product IA); `form.html` is a standalone artboard — same field/CTA/validation language.
2. Writing-stroke SVG not available → fade + rise / light blur fallback per exhibit motion §2.
3. Play has no audio file (`audioUrl` null); visual Playing… + phoneticHint only.
4. Mobile Name style uses full wording; may wrap at 390 — not abbreviated to Feminine/Masculine/Either.
5. Live homepage shows one generator state at a time; use `?generator=` (states.html is QA reference only).

## Open paper

Default primary = 林安然. `?paper=jingxing` matches `result-open` / `mobile-result-open`. Clicking Open paper swaps primary; all three names carry full Play / Copy name / Why / intro / Copy intro when primary.

## API wiring (F-T3–F-T8) — vs exhibit / demo archive

| Area | Exhibit / prior demo | Live client (this tree) |
|------|----------------------|-------------------------|
| Free Generate body | n/a (static) | Always `{ genderPreference }` — default **neutral** (Either is fine); feminine / masculine when selected. Never empty `{}` from UI. |
| Free 429 copy | — | “a few names each day” only; no hourly/daily counts on screen |
| Feeling chips | Warm / Nature / Strong / Gentle etc. in some artboards | Contract six only: Friendly / Calm / Bright / Elegant / Modern / Scholarly |
| Checkout redirect | demo `/results/demo` | `window.location.href = checkoutUrl` only; never `window.open` |
| Results data | DEMO_PAID_NAMES Elena fixture | `GET /api/results/:token`; poll 202 every 2s; ~60s email hint; failed stops; 404 no cards |
| FullCard fields | introZh + introEn split in demo | Contract: `selfIntroduction` (EN) for Copy intro; Copy name = `hanzi` only; Play visual-only (`audioUrl` null) |
| Open paper | `?paper=anran\|jingxing\|qingyue` | `?paper=0\|1\|2` (legacy aliases still parse for QA) |

**Not in this pass:** no `app/api/**/route.ts` Route Handlers written (dirs remain empty placeholders). Backend server modules under `lib/server` are out of F-T3–F-T8 scope.

## Manual verify checklist

1. Home: Either is fine selected → Generate → network POST body `{"genderPreference":"neutral"}`.
2. Switch Typically feminine / Typically masculine → body `feminine` / `masculine`.
3. Force 429 (when API exists) → copy includes “a few names each day”.
4. Customize: empty English name → client error, no fetch; Calm + Continue → POST checkout then `location.href` to checkoutUrl.
5. `/results/{token}`: 202 spinner → ready three papers; Open paper; Copy name / Copy intro; Play shows phoneticHint only.

## Motion polish (exhibit 交互动效说明)

Aligned locally to `exhibit/CallMeMing-展厅标本-交互动效说明.md`:

- §1 reveal-hero end state `translateY(0)`; limit/error `fade-in-240`
- §3 Play icon idle=`play`, playing=`volume-2`
- §4 / §6 chip & feeling short color/border transitions; form err-msg `err-slide` 180ms
- §5 Open paper: old `paper-out` 240ms + new `swap-in` 360ms @80ms delay; interruptible
- §7 result-head fade 280ms; primary `paper-in` 480ms; Other candidates delay 120ms
- §8 prefers-reduced-motion: CSS near-zero + skip reveal stagger / Open paper slip
- §2 no SVG outline → keep fade+rise/blur (no fake stroke)

## Workbench

本轮 F-T3–F-T8：工作台为 Grok Bot / 本机（Claude CLI 不可用）。
本轮动效 polish：工作台为 Grok Bot / 本机（Claude CLI 不可用）。

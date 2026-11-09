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

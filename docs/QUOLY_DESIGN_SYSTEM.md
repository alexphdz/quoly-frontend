# Quoly Design System — Graphite + Ice Blue

Updated 2026-10-05. Source of truth for the **frontend visual system** (typography +
colour + surface + feedback). This document describes the system as implemented in
`Frontend/src`. It supersedes the old SaaS-blue "Tinta" identity described in
`docs/design-system` / `features/design-system/context/specs/DESIGN-SYSTEM.md`.

This was a **visual migration**, not a UX redesign: routes, structure, flows, logic,
API contracts, and responsive/accessibility behaviour are unchanged.

---

## 1. Direction

Graphite + Ice Blue. Geist + Geist Mono. Editorial, calm, precise, procurement-native,
quietly capable. Quoly is designed **around information, not around containers** — turning
inconsistent supplier information into structured, buyer-side information.

Priorities: hierarchy, alignment, typography, spacing, structured commercial data,
provenance/source relationships, restrained rules. Over: excessive cards, heavy shadows,
pills, decorative icon containers, dot-led statuses.

---

## 2. Canonical source files

Everything resolves from CSS custom properties. There is **no `tailwind.config` and no
`@theme` block**; Tailwind v4 (`@import "tailwindcss"` in `src/index.css`) provides utility
classes only. Two token layers are kept in **lockstep** over one palette:

| Layer | File(s) | Token names | Consumed by |
|---|---|---|---|
| DS (design-system) | `src/styles/tokens-light.scss`, `tokens-dark.scss` | `--accent`, `--bg-content`, `--tx-1`, `--line`, `--ice`… | `.qy-*` / `.ds-*` classes in `src/styles/components/*.scss` |
| Legacy / Tailwind | `src/index.css` (`:root` + `[data-theme='dark']`) | `--brand`, `--surface-card`, `--text-primary`, `--bg-app`… | `.card` / `.btn` / `.badge` / `.qtable` / ledger / visual-* classes |

**Both layers must change together.** When you add or change a value, update the matching
name in the other layer so `.card` matches `.qy-card` on the same screen (especially in dark
mode). Fonts load in `index.html` (Geist + Geist Mono, weights 400/500/600).

---

## 3. Palette

### Brand / structural
| Role | Light | Dark |
|---|---|---|
| Graphite (brand structure, primary action in light) | `#262B2D` | `#262B2D` |
| Graphite strong (action hover, light) | `#15181A` | — |
| Ice Blue (focus, provenance, active, large accents) | `#7FB8C9` | `#8FC7D7` |
| Ice strong | — | `#A7D3DE` |
| Ice ink (interactive **text** — AA on white) | `#356B7C` | `#A7D3DE` |

Ice Blue is **never** the default background for cards or statuses, and **never** small body
text on white (contrast). Use Ice for focus rings, source/provenance relationships,
active/processing cues, and larger accents.

### Light neutrals / surfaces
| Token (DS / legacy) | Value |
|---|---|
| Canvas — `--bg-canvas` / `--bg-app` | `#F5F6F5` |
| Surface — `--bg-content` / `--surface-card` | `#FFFFFF` |
| Raised — `--bg-raised` | `#FFFFFF` |
| Soft surface — `--bg-surface` / `--surface-card-subtle` | `#ECEFEE` |
| Border — `--line` / `--border-subtle` | `#DDE1E0` |
| Border strong — `--line-strong` / `--border-strong` | `#C6CCCA` |
| Primary ink — `--tx-1` / `--text-primary` | `#171A1B` |
| Body — `--tx-body` / `--text-secondary` | `#3D4344` |
| Secondary — `--tx-2` | `#6A6F71` |
| Muted — `--tx-3` / `--text-muted` | `#969D9F` |

### Dark neutrals / surfaces (first-class, not an inversion)
| Role | Value |
|---|---|
| Canvas | `#101415` |
| Surface | `#171C1D` |
| Raised surface | `#1E2425` |
| Soft surface | `#252C2D` |
| Border | `#303738` |
| Border strong | `#414A4B` |
| Primary text | `#EEF1F0` |
| Body | `#C7CECF` |
| Secondary | `#A8B0B1` |
| Muted | `#747D7F` |

---

## 4. Semantic token architecture

```
foundational (--graphite, --ice, --ice-ink)
        ↓
semantic roles (--action, --action-hover, --on-action, --focus, feedback)
        ↓
compatibility aliases (--accent, --brand, --accent-text, --selected…)
        ↓
components
```

Key split from the old system: `--accent` used to mean "one blue" (both the action colour
and the accent/link/focus colour). It is now **the primary-action colour**:

- Light: `--action` = `--graphite` (#262B2D), `--on-action` = white.
- Dark: `--action` = `--ice` (#8FC7D7), `--on-action` = `#101415` (graphite would vanish on a
  dark canvas, so the action is Ice in dark).

Ice carries the accent/focus/provenance role via `--ice`, `--ice-ink`, `--accent-line`,
`--accent-underline`, `--focus`, `--selected`. Interactive **text** uses `--accent-text`
(= `--ice-ink`), an accessible darkened Ice that passes WCAG AA on white.

Minimum semantic roles defined: canvas, surface, raised, soft, border, border-strong, ink,
ink-secondary, ink-muted, graphite, ice, ice-strong/soft, action, action-hover, on-action,
focus, and success/warning/error/info each with `*-fg` / `*-bg`.

### Backwards-compatible aliases (intentionally retained)
Legacy names were **not** renamed (too widely consumed). They alias the new values:
`--brand` → graphite/ice action, `--brand-soft` → pale ice, `--brand-logo` → graphite (light)
/ ice (dark), `--accent` → action, `--accent-text` → ice-ink, `--selected` → pale ice tint.

---

## 5. Semantic feedback — desaturated, editorial

| | Light fg / bg | Dark fg / bg |
|---|---|---|
| Success | `#4F8A6D` / `#EDF4EF` | `#78B596` / `#18251F` |
| Warning | `#B68A45` / `#F7F1E5` | `#D2A85F` / `#282218` |
| Error | `#B9635B` / `#F8ECEA` | `#D7837B` / `#2A1D1C` |
| Info | `#5F95A5` / `#EBF3F5` | `#86BDCD` / `#182428` |

**One signal per feedback**, not border + pale fill + icon + text all at once. Prefer a
subtle fill, a side rule, or coloured text — pick one. Open supplier questions are
**operational** (Ice), not warnings.

---

## 6. Typography

Keep Geist (UI) + Geist Mono (data). Headings: weight **500**, `letter-spacing: -0.02em`.
Avoid excessive 600/bold. Body/nav/buttons/labels/supplier names use Geist.

**Geist Mono only for genuine data:** prices, quantities, MOQ, lead times, RFQ IDs, supplier
codes, source references, compact data dates, comparison figures, KPI values. Maintain
tabular numerals. **Not** for supplier names, navigation, buttons, paragraphs, descriptive
labels, or whole rows where only one value is numeric. The app must not feel like a terminal.

---

## 7. Commercial values

Prices, MOQ, quantities, lead times stay prominent through **scale, weight, alignment, mono,
position** — not colour. No Ice rectangles, tinted highlight backgrounds, permanent coloured
underlines, or pills on values. Large KPI numbers render in neutral ink (`--tx-1`); the small
per-metric accent bar/icon carries the colour cue. "Best" reads as a restrained Ice annotation
(e.g. `BEST PRICE ↗`, see `.cmp-best`), never a coloured background on the number.

---

## 8. No dot-led status

No decorative circular status dots as the default status language (`● SELECTED`, `● DRAFT`).
`.badge-dot` is a retained no-op; status reads through text + tone. Dots with a genuine
**chart/legend/progress** role are kept (ReviewQueue legend swatches, journey stepper, KPI
spread bars).

## 9. Reduced line usage

Rules only where they create real hierarchy. Prefer spacing, grouping, typography, surface
contrast, alignment. The `--line` border was softened (`#DDE1E0`) so the UI reads structured,
not wireframe-like.

---

## 10. Buttons, inputs, pills, cards, modals

- **Buttons** (`src/styles/components/button.scss`, `.btn*` in `index.css`): Primary =
  graphite (light) / ice (dark) via `--accent` + `--accent-fg`. Secondary = transparent +
  border-strong. Tertiary = text. No gradients, no huge pills, no large shadows.
- **Inputs** (`.input` in `index.css`, `components/field.scss`): calm neutral fill, border,
  stronger border + Ice focus ring (`--ring` / `--focus`). Radius 8px.
- **Pills / badges** (`components/pill.scss`, `.badge*`): badges are 6px rounded labels
  (`--radius-badge`), not full pills. Reduce pill usage; prefer text / small annotation.
- **Cards / surfaces**: separation by spacing → border → surface contrast → shadow (only for
  genuine elevation). Cards represent real grouped information, not every section.
- **Modals** (`components/modal.scss`): radius 12px, neutral shadow, graphite primary action.

### Radius
`--radius-badge` 6px (labels) · `--radius-control` 8px (inputs, buttons) · `--radius-card` 8px
· `--radius-card-lg` 12px (modals). Avoid 16–32px radii and `rounded-full` unless required.

### Shadows
Neutral only (no coloured shadows), reserved for modal / popover / dropdown / toast. Ordinary
cards rely on border + surface + spacing.

---

## 10b. Quoly Intelligence panel family

Content Quoly's AI produced is a **recognizable component family** with an Ice identity (the
one place the product leans on Ice as a surface, not just an accent). Never gradients, glow,
sparkles, purple, or large icon containers — identity is a restrained tint + edge + the Quoly
mark.

- `.ai-panel` (`ai-panel.scss`) — extraction readings / summaries: Ice-tinted surface
  (`color-mix(--ice 7% …)`), 2px Ice left edge (`--accent-line`), generous padding. Section
  rules inside are Ice-tinted.
- `.qy-ai` (`foundation.scss`) — the "por Quoly Intelligence" marker chip: Ice tint + Ice
  Quoly glyph (`.qy-ai-glyph` paints the masked mark with `--accent-line`).
- `.cmp-rec-ai` (`cmp.scss`) — "Análisis de Quoly" on the comparison recommendation: Ice
  kicker + Ice mark, content as clear secondary (`--tx-body`, 13px).

These keys are `--ice` / `--accent-line` / `--accent-text`, so they survive the
graphite-action split. **Do not** rebuild Intelligence surfaces on `--accent` (it is graphite
in light and would make them read as plain neutral boxes).

The full `.ai-panel` (Quote Review interpretation, `ExtractionPassSummary`) is the reference
build of the family: very pale Ice surface + soft border + a short top-left Ice accent segment
(`::before`, not a full edge); header where the Quoly mark + "Quoly Intelligence" lead
(borderless, Geist 500) and message labels like "Cotización" sit secondary on the right;
interpretation summary at 15px/1.6 primary ink (max ~68ch); section labels 12px/500/0.05em
uppercase; spec fields in a responsive `repeat(auto-fit, minmax(240px,1fr))` grid (2-col when
width allows, 1-col when narrow) with vertical rhythm, not dividers. Numeric tokens inside a
value are wrapped (`withNums` → `.ai-panel-num`) so figures render mono while descriptive words
stay Geist. The buyer-action / open-question block is a calm actionable state (`.ai-panel-asks-block`
+ `.ai-panel-action-label`, soft warm side rule, no warning triangle, no yellow box), distinct
from genuine processing warnings which keep `.ai-panel-label-warn`. Rules are limited to one
after the summary and one before the buyer action; everything else is spacing-led.

### Mono on genuine numeric values
Geist Mono is applied **selectively** to value-only elements, never whole labels/rows. Current
hooks: `.cmp-rec-price`, `.ds-matrix-value.tnum` (comparison figures), `.qr-value-num`
(numeric extracted fields — keyed off `field.type` number/currency), `.qr-stat-num` /
`.qr-norm-num` (Quote-details snapshot + comparable price), `.rd-progress-big` (`2 / 3`),
`.rd-progress-rows dd`, `.rd-preview-price` / `.rd-preview-total`, `.rd-detail-num` (request
quantity), the dashboard KPI values + `.home-split-legend b` / `.home-queue-meta` counts.
Pattern: `font-family: var(--font-mono)` + `font-variant-numeric: tabular-nums` + stronger
scale. Descriptive text, units that are words, supplier names, and mixed label+value strings
stay Geist.

### Quote Review — buyer-scan hierarchy
The read-only Quote-details panel (`QuoteReview.tsx`, `.qr-review-body`) is ordered by how a
buyer scans a quote, not by field list: a **commercial snapshot** first (`.qr-snapshot` —
price / lead time / MOQ / payment, responsive `auto-fit minmax(150px,1fr)` → 4/2/1 columns,
mono values, price strongest via `:first-child`), then a quieter two-column **secondary
details** block (`.qr-secondary` — currency, unit, pieces per unit, delivery point) separated
by a single rule, then **notes**. Missing values read as muted "Not stated", not errors. The
editing form is unchanged. Comparable price collapses to a compact row (`.qr-norm-plain`) when
no conversion happened, instead of showing the same number twice.

### Home dashboard
`home-*` panels differ by role rather than being identical bordered boxes: the open-requests
count is the anchor (`.home-card-open .home-card-num`, 40px mono); the status bar is thin and
refined (Ice = with quotes, neutral = waiting, amber = attention); the review queue uses
whitespace + a subtle Ice hover instead of row rules; the awarded panel uses its full width
editorially (count left, latest award right). No added cards, borders, or saturated colour.

## 11. Product areas

- **Comparison** (`comparison.scss`, `cmp.scss`): supplier names Geist-led, values Geist Mono,
  lighter rules, `.cmp-best` = Ice annotation (no coloured fill on the winning number),
  leading/recommended rows = subtle pale-ice surface shift.
- **Quote Review** (`quote-review.scss`, `ai-panel.scss`): hierarchy label → value → source
  excerpt → provenance. `.qr-mark` (extracted-source highlight) speaks Ice (provenance), not
  warning. Source text panel is mono (raw document data).
- **Supplier questions** (`ask-row.scss`): operational Ice marker + label, not warning amber.
- **Decision / Award** (`request-detail.scss`, `journey.scss`, `stage-bar.scss`): selection via
  typography / rule / subtle surface shift; company name leads; no "selected" dots.
- **Suppliers / Requests / Quotations** (`suppliers.scss`, `requests.scss`, `quotations.scss`,
  `commercial-form.scss`): supplier company name primary, contact secondary; mono only on data.

### Charts
`src/components/charts/stagePalette.ts` holds the data-viz category palette. The old brand-blue
ramp migrated into the Ice family; genuine category hues (attention amber, quote green, declined
red, neutral grey) were aligned to the editorial palette but kept distinct. The ledger spread
bars and price bars (`index.css`) route through tokens.

---

## 12. Accessibility

- `--accent-text` / `--ice-ink` is the only Ice used as text; it passes AA on white. Pure Ice
  `#7FB8C9` is for focus, rules, large accents, and provenance — not small text.
- Readable text uses Ink. Focus rings use Ice (`--ring`). Preserve keyboard, disabled, selected
  states and dark-mode contrast.

---

## 13. Intentionally retained legacy values

- Third-party brand colours are **not** recoloured: Gmail icon (`GmailIcon.tsx`), Outlook logo
  colour in `SettingsPage.tsx`, `.gmail-pill`.
- Genuine data-viz category hues (success green, attention amber, declined red, neutral grey)
  in `stagePalette.ts` and the ledger/price bars.
- All legacy token **names** (`--brand`, `--surface-card`, `--text-*`, `--accent`…) are aliased,
  not renamed, to avoid a risky big-bang rename.

---

## 14. Migration status

| Group | Status |
|---|---|
| Token layers (DS + legacy, light + dark) | ✅ migrated |
| Typography (weights / mono usage) | ✅ tuned |
| Buttons / inputs / pills / badges / modals / nav | ✅ via tokens + primitives |
| Data-viz (charts, ledger/price bars, auth gradient) | ✅ migrated |
| Comparison / Quote Review / Supplier questions / KPI | ✅ restyled |
| Suppliers / Requests / Quotations hierarchy | ✅ already company-led, verified |
| Live visual QA (light + dark + responsive in browser) | ⏳ pending a manual pass |

To extend the UI: add values to **both** token layers, consume semantic tokens (not raw HEX)
in components, keep Mono for data only, avoid dot-led statuses and coloured value fills.

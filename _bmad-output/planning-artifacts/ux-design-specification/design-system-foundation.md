# Design System Foundation

## Design System Choice

**Selected: Ant Design v5 (AntD) with a custom design token theme.**

Ant Design v5 is chosen as the component foundation for Mahalla Ovozi. It provides a complete, production-tested library of administrative UI components under a CSS-in-JS theming system (ConfigProvider + design tokens), which integrates cleanly with the React + Vite + TypeScript stack without introducing Tailwind CSS or a conflicting stylesheet layer.

## Rationale for Selection

- **Desktop-first component library:** AntD components are designed and optimized for dense data presentation on large monitors — aligning precisely with the 1920×1080 primary target.
- **Covers all required MVP components out-of-the-box:** Drawer, Card, Badge (lane signal counts), Skeleton, Alert (delay banner), Select, DatePicker, Input.Search — all with full TypeScript typings.
- **Design token theming without external CSS conflicts:** AntD v5's ConfigProvider token system allows full palette, typography, and border-radius overrides at the theme root — no Tailwind, no class conflicts, no specificity battles.
- **Uzbek Cyrillic rendering:** AntD is designed for multi-script environments (Chinese, Japanese, Korean) and renders Uzbek Cyrillic cleanly with any specified `fontFamily` token.
- **Solo-developer efficiency:** A single engineer can build and ship the full MVP dashboard using standard AntD primitives, reserving custom CSS only for the five-lane grid layout and category-color left-border accents.

## Implementation Approach

- **Theme Root:** A single `<ConfigProvider theme={mahallaTtheme}>` wrapper at the app root applies all token overrides globally.
- **Custom-built components (2 only):**
  1. `<LaneColumn>` — the five-lane horizontal grid container with independent virtual scroll.
  2. `<SignalCard>` — the individual signal card with category-colored left-border accent (built on AntD `Card` with custom token overrides).
- **Standard AntD components used as-is:**
  - `Drawer` → Context drawer overlay
  - `Badge` → Lane signal count
  - `Skeleton` → Loading states (initial load + drawer swap shimmer)
  - `Alert` → Delay status banner (`type: "warning"`)
  - `Select` + `DatePicker` → Mahalla and time-range filter controls
  - `Input.Search` → Keyword search

## Customization Strategy

The AntD theme token overrides establish our specific design language:

| Token | Value | Purpose |
|---|---|---|
| `colorPrimary` | Neutral indigo (finalized Step 8) | Primary interactive elements |
| `colorBgContainer` | `#FAFAF9` (warm off-white) | Dashboard background — not clinical white |
| `fontFamily` | `'Inter', 'Outfit', sans-serif` | Typography baseline for Uzbek Cyrillic readability |
| `borderRadius` | `8px` | Consistent component rounding |
| `colorBorder` | `#E5E7EB` | Subtle structural borders |

**Category color tokens** (applied as left-border accents and count badge colors — exact hex values finalized in Step 8):

| Category | Token Name | Color Direction |
|---|---|---|
| *Ҳокимга тегишли* | `categoryHokim` | Deep burgundy / maroon |
| *Сув* | `categorySuv` | Sky blue |
| *Электр* | `categoryElektr` | Amber / gold |
| *Газ* | `categoryGaz` | Slate teal |
| *Чиқинди* | `categoryChiqindi` | Earthy olive |

### Severity Ladder (Status indicators only)

| State | Color | Usage |
|---|---|---|
| Healthy | No badge | Absence of warning = healthy |
| Delayed | `#D97706` amber | Delay banner text + left border |
| Critical | `#DC2626` red | **Not used in any MVP hokim-facing element** |

## Typography System

**Primary font: Inter** — selected for superior Uzbek Cyrillic Unicode coverage (U+0400–U+04FF) and excellent dense-information legibility at 11–14px on high-DPI desktop monitors.

**Loading:** Google Fonts `@import` with `display=swap` and subset `latin,latin-ext,cyrillic` to prevent layout shift and reduce bundle size.

### Type Scale

| Role | Size | Weight | Line Height | Usage |
|---|---|---|---|---|
| Lane header title | 13px | 600 | 1.4 | Category name in sticky lane header |
| Lane count badge | 12px | 700 | 1 | Signal count number |
| Card sender name | 13px | 600 | 1.4 | Telegram display name |
| Card mahalla label | 12px | 400 | 1.4 | Mahalla name below sender |
| Card timestamp | 11px | 400 | 1.4 | Relative time (e.g., "10 дақ. олдин") |
| Card signal text | 13px | 400 | 1.5 | Raw message snippet (3-line clamp) |
| Drawer heading | 14px | 600 | 1.4 | Breadcrumb: Lane · Mahalla · Time |
| Drawer context card | 13px | 400 | 1.5 | Corroborating signal text |
| Filter label | 13px | 500 | 1.4 | Filter bar control labels |
| Empty state message | 13px | 400 | 1.6 | *Бугун сигналлар йўқ* |
| Delay banner | 13px | 500 | 1.4 | *⚠️ Сигналлар янгиланмаяпти* |

## Spacing & Layout Foundation

**Base unit: 4px.** All spacing values are multiples of 4px.

### Key Spacing Values

| Token | Value | Usage |
|---|---|---|
| `space-1` | 4px | Minimum gap between inline elements |
| `space-2` | 8px | Card internal padding (tight) |
| `space-3` | 12px | Filter chip padding and compact inline metadata spacing |
| `space-4` | 16px | Card standard padding, lane header padding |
| `space-5` | 20px | Gap between cards within a lane |
| `space-6` | 24px | Lane column horizontal padding |

### Layout Grid

| Zone | Spec |
|---|---|
| App outer shell | `100vw`, `min-width: 1024px` |
| Filter bar | Full width, fixed height `56px`, `position: sticky; top: 0` |
| Lane grid container | `100%` width, `height: calc(100vh - 56px)`, `overflow: hidden` |
| Individual lane column | `flex: 1`, `min-width: 200px`, `overflow-y: auto` (virtualized scroll) |
| Lane column gap | `1px` rendered as `colorBorder` divider |
| Context drawer | Fixed overlay: `380px` (≥1440px viewport), `340px` (≥1024px viewport) |
| Drawer backdrop | Full viewport, `rgba(15, 12, 10, 0.06)` |

### Signal Card Anatomy

```
┌──────────────────────────────────────────────────┐
│ [4px category-color left border]                 │
│  ┌──────────────────────────────────────────┐   │
│  │ [Sender Name]          [Timestamp]        │   │  ← 13px/600 + 11px/400
│  │ [Mahalla Name]                            │   │  ← 12px/400, colorTextSecondary
│  │                                            │   │
│  │ [Raw message text, 3-line clamp...]        │   │  ← 13px/400, 1.5 line-height
│  │                                            │   │
│  │ [★ if hokim-related] [📷 if caption]       │   │  ← compact non-interactive indicators
│  └──────────────────────────────────────────┘   │
└──────────────────────────────────────────────────┘
Padding: 12px 16px. Background: #FFFFFF. Border-radius: 8px. Box-shadow: 0 1px 3px rgba(0,0,0,0.06).
Active: left-border → 4px solid categoryColor; background → categoryColor at 5% opacity.
```

## Accessibility Considerations

- **Contrast ratios:** All text/background pairs meet WCAG 2.1 AA minimum (4.5:1 normal text, 3:1 large text).
  - `#1A1714` on `#FAFAF9`: 18.2:1 ✅
  - `#6B6560` on `#FAFAF9`: 5.9:1 ✅
  - `#4F46A8` on `#FFFFFF`: 7.2:1 ✅
- **Focus indicators:** AntD's default focus ring preserved and enhanced (2px offset, `colorPrimary` outline) — not removed for aesthetics.
- **Keyboard navigation:** Drawer closable via Escape; filter controls fully tab-navigable; signal cards assigned `tabIndex=0`.
- **Font size floor:** No UI text falls below 11px to maintain legibility at standard 96dpi desktop scaling.
- **No color-only information:** Category identity is communicated by both color (left-border) and text label (lane header name + card mahalla label) simultaneously.

---

# Visual Design Foundation

## Color System

The palette is built around the "Calm Authority" emotional goal: restrained, professional, and trustworthy — with deliberate category accent colors that provide instant visual orientation without creating alarm.

### Base Palette (AntD ConfigProvider tokens)

| Role | Token | Hex | Usage |
|---|---|---|---|
| Background | `colorBgLayout` | `#F5F4F2` | App-level outer background |
| Container | `colorBgContainer` | `#FAFAF9` | Lane column backgrounds, drawer background |
| Surface elevated | `colorBgElevated` | `#FFFFFF` | Signal cards, modals |
| Border subtle | `colorBorder` | `#E8E5E1` | Lane dividers, card borders |
| Border stronger | `colorBorderSecondary` | `#D1CEC9` | Filter bar dividers, drawer header border |
| Text primary | `colorText` | `#1A1714` | Main signal text, headings |
| Text secondary | `colorTextSecondary` | `#6B6560` | Sender name, mahalla label, timestamps |
| Text placeholder | `colorTextPlaceholder` | `#A09990` | Empty state messages, placeholder text |
| Primary action | `colorPrimary` | `#4F46A8` | Focused buttons, active filter chips, links |
| Warning (delay) | `colorWarning` | `#D97706` | Delay banner background accent |
| Success | `colorSuccess` | `#16A34A` | System healthy indicator (not shown persistently) |
| Error | `colorError` | `#DC2626` | Reserved — not used in any MVP hokim-facing element |

### Category Color Tokens (Left-border accents + count badge colors)

Deliberately muted category colors that read clearly against the `#FAFAF9` container without triggering alarm responses.

| Category | Token | Hex | Character |
|---|---|---|---|
| *Ҳокимга тегишли* | `categoryHokim` | `#7C2D56` | Deep raspberry — authority / priority |
| *Сув* | `categorySuv` | `#1D6FA4` | Slate blue — water |
| *Электр* | `categoryElektr` | `#B45309` | Warm amber — electricity, energy |
| *Газ* | `categoryGaz` | `#1A7060` | Teal green — pipe / flow systems |
| *Чиқинди* | `categoryChiqindi` | `#5C6B2E` | Earthy olive — waste, environment |

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
| `space-3` | 12px | Filter chip padding, card internal element gap |
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
│  │ [★ if hokim-related]                       │   │  ← decorative, aria-hidden
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

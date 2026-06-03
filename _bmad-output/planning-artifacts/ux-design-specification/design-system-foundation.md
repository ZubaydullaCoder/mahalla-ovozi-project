# Design System Foundation

## Design System Choice

**Selected: Ant Design v6 (AntD) with a custom design token theme.**

Ant Design v6 is chosen as the component foundation for Mahalla Ovozi. It provides a complete, production-tested library of administrative UI components under a CSS-in-JS theming system (ConfigProvider + design tokens), which integrates cleanly with the React + Vite + TypeScript stack without introducing Tailwind CSS or a conflicting stylesheet layer.

## Rationale for Selection

- **Desktop-first component library:** AntD components are designed and optimized for dense data presentation on large monitors — aligning precisely with the 1920×1080 primary target.
- **Covers all required MVP components out-of-the-box:** Drawer, Card, Badge (lane signal counts), Skeleton, Alert (delay banner), Select, DatePicker, Input.Search — all with full TypeScript typings.
- **Design token theming without external CSS conflicts:** AntD v6's ConfigProvider token system allows full palette, typography, and border-radius overrides at the theme root — no Tailwind, no class conflicts, no specificity battles.
- **Uzbek Cyrillic rendering:** AntD is designed for multi-script environments (Chinese, Japanese, Korean) and renders Uzbek Cyrillic cleanly with any specified `fontFamily` token.
- **Solo-developer efficiency:** A single engineer can build and ship the full MVP dashboard using standard AntD primitives, reserving custom CSS only for the five-lane grid layout and category-color left-border accents.

## Implementation Approach

- **Theme Root:** A single `<ConfigProvider theme={mahallaTtheme}>` wrapper at the app root applies all token overrides globally.
- **Custom-built components (2 only):**
  1. `<LaneColumn>` — the five-lane horizontal grid container with independent virtual scroll.
  2. `<SignalCard>` — the individual signal card with category-colored left-border accent (built on AntD `Card` with custom token overrides).
- **Standard AntD components used as-is:**
  - `Drawer` → Context drawer overlay
  - `Tag` → Short label chip (e.g. `short_label` from AI output, if shown)
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

---

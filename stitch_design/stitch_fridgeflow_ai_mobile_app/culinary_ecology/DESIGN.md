---
name: Culinary Ecology
colors:
  surface: '#f2fcf2'
  surface-dim: '#d3ddd3'
  surface-bright: '#f2fcf2'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#ecf6ed'
  surface-container: '#e6f1e7'
  surface-container-high: '#e1ebe1'
  surface-container-highest: '#dbe5dc'
  on-surface: '#151e18'
  on-surface-variant: '#404943'
  inverse-surface: '#29332c'
  inverse-on-surface: '#e9f3ea'
  outline: '#707973'
  outline-variant: '#c0c9c2'
  surface-tint: '#316951'
  primary: '#04442f'
  on-primary: '#ffffff'
  primary-container: '#245c45'
  on-primary-container: '#99d2b5'
  inverse-primary: '#99d3b6'
  secondary: '#4b6546'
  on-secondary: '#ffffff'
  secondary-container: '#cdebc4'
  on-secondary-container: '#516b4c'
  tertiary: '#4d3800'
  on-tertiary: '#ffffff'
  tertiary-container: '#694e00'
  on-tertiary-container: '#f0bf4e'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#b5efd1'
  primary-fixed-dim: '#99d3b6'
  on-primary-fixed: '#002114'
  on-primary-fixed-variant: '#16503a'
  secondary-fixed: '#cdebc4'
  secondary-fixed-dim: '#b1cfa9'
  on-secondary-fixed: '#092008'
  on-secondary-fixed-variant: '#344d30'
  tertiary-fixed: '#ffdf9e'
  tertiary-fixed-dim: '#f0c04f'
  on-tertiary-fixed: '#261a00'
  on-tertiary-fixed-variant: '#5b4300'
  background: '#f2fcf2'
  on-background: '#151e18'
  surface-variant: '#dbe5dc'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.015em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.03em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-tablet: 1.5rem
  margin: 1rem
  margin-tablet: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

This design system expresses a serene, intelligent, and organic rhythm designed for modern home management. The aesthetic balances the rigor of high-utility Android productivity software with the warmth of a sunlit kitchen and botanical balance. It moves away from clinical, cold utility towards a calming culinary assistant that eliminates domestic stress and food waste.

The visual direction combines **Minimalism** with **Tactile Warmth**:
- **Tone:** Grounded, encouraging, luminous, precise, and fresh.
- **Audience:** Discerning home cooks, eco-conscious planners, and busy households seeking seamless inventory flow and effortless meal curation.
- **Interaction Ethos:** High tactile predictability, generous touch margins adhering to Android 48dp conventions, and ambient clarity that allows high-density inventory data to feel spacious and breathable.

## Colors

The palette draws directly from botanical and kitchen environments, balancing deep earthy chlorophyll with sunlit warmth and functional warning markers.

- **Primary (`#245C45` - Deep Forest Green):** Anchors primary brand actions, focused states, system headers, and key interactive touchpoints. It represents stability and freshness.
- **Secondary (`#A8C5A0` - Sage Green):** Deployed for subtle container fills, tonal badges, active chips, and gentle secondary accents.
- **Tertiary (`#E9B949` - Soft Citrus):** Serves as an energetic discovery indicator, primarily for AI match percentages, recipe recommendations, and "Use Soon" warnings.
- **Neutral (`#202923` - Dark Charcoal):** Provides high-contrast, fatigue-free typographic hierarchy with an undertone of natural slate.
- **Surface & Canvas:**
  - **Background (`#FAF8F2` - Warm Ivory):** The root canvas for all screen flows, reducing eye glare and offering an inviting, tactile backdrop.
  - **Surface (`#FFFFFF` - Clean White):** Elevated cards, bottom navigation containers, modal sheets, and scan viewports.
- **Supporting Semantics:**
  - **Text Secondary (`#778078` - Muted Gray-Green):** Subtitles, meta-tags, and unselected states.
  - **Warning/Coral (`#D96C5F` - Muted Coral):** Critical expiry notifications, delete motions, and immediate attention states ('Expiring Today').

## Typography

The typographic hierarchy uses **Inter** to ensure maximum legibility at small scale across dense Android device matrixes. The structure balances confident editorial weights for screen anchors with robust, high-x-height body text for rapid scanning in dynamic kitchen lighting.

- **Scale Rationale:** Headlines are tightly tracked (`-0.015em` to `-0.02em`) to retain visual structure on mobile widths without awkward line wrapping.
- **Labels & Micro-copy:** Pill badges, timestamps, ingredient amounts, and expiry statuses rely on uppercase or semi-bold micro-tokens (`label-sm`, `label-md`) with loose tracking (`0.02em` to `0.03em`) to preserve legibility when paired with bright accent background colors.

## Layout & Spacing

The layout is built on a responsive mobile grid with dynamic adaptations across form factors:

- **Mobile (<600dp):** 4-column fluid grid with `16px` (`margin`) outer screen gutters and `16px` (`gutter`) column separation. All critical interactive targets adhere to the Android Material 48dp rule.
- **Tablet / Foldable (600dp - 1024dp):** 8-column layout with `32px` (`margin-tablet`) outer margins and `24px` (`gutter-tablet`) gutters. Dual-pane inspection view is supported: inventory list stays on the left 4 columns, while details, AI recipes, and nutritional analysis occupy the right 4 columns.
- **System Padding:** Dynamic insets must explicitly offset the Android status bar (`WindowInsetsCompat.getInsets(Type.statusBars())`) and navigation bar (`Type.navigationBars()`), preventing sticky UI overlap with system navigation pills or gestural handles.

## Elevation & Depth

Visual depth avoids harsh synthetic drop shadows in favor of **warm, ambient diffusion** that feels organic and non-intrusive.

- **Level 0 (Canvas Base):** Flat `#FAF8F2`. Ground-level container for global scrolling surfaces.
- **Level 1 (Card Elevation):** Raised containers (`#FFFFFF`) with a warm, tinted dual-blur shadow:
  - `0px 2px 4px rgba(32, 41, 35, 0.04), 0px 8px 16px rgba(32, 41, 35, 0.06)`
- **Level 2 (Floating Controls & Navigation):** Persistent bottom bar and Floating Action Buttons (FAB):
  - `0px 4px 12px rgba(36, 92, 69, 0.12), 0px 12px 28px rgba(32, 41, 35, 0.08)`
- **Level 3 (Modal Bottom Sheets & AI Overlays):** Interactive bottom draw cards:
  - `0px -4px 24px rgba(32, 41, 35, 0.12)`

## Shapes

The shape system employs generous, organic curves that feel approachable and comfortable to touch.

- **Base Radius (0.5rem / 8px):** Used on inner elements like form controls, individual input borders, small status tags, and secondary action items.
- **Large Radius (1rem / 16px):** Standard curvature for list cards, grocery items, and nested scanner targets.
- **Extra Large Radius (1.5rem / 24px):** Used for primary content containers, interactive recipe hero cards, floating action modals, and dynamic bottom sheets.
- **Full Radius (Pill / 9999px):** Applied to badges ('Expiring Today', 'Freshly Added', 'Use Soon'), filter chips, primary action buttons, and active bottom navigation indicators.

## Components

### Buttons
- **Primary:** Full pill radius, `#245C45` solid background, `#FFFFFF` text (`label-lg`). Minimum height 48dp, 24dp horizontal padding. Active state darkens to `#1B4534`.
- **Secondary / Tonal:** Pill radius, `#A8C5A0` at 20% opacity with `#245C45` text. Used for non-destructive, repeatable steps (e.g., "Add Another").
- **Floating Action Button (FAB):** 56x56dp circular container, `#245C45` background with white glyphs, anchored 16dp above the bottom navigation bar. Elevated with Level 2 shadow.

### Status Badges & Expiry Chips
Compact pill shapes (`label-sm`, 4dp vertical, 10dp horizontal padding):
- **Freshly Added:** `#A8C5A0` background (25% opacity), `#245C45` text.
- **Use Soon:** `#E9B949` background (25% opacity), `#694E03` text.
- **Expiring Today:** `#D96C5F` background (20% opacity), `#9E2A1D` text.

### Recipe Cards
- Pure `#FFFFFF` surface with `rounded-xl` (24px) corners and Level 1 elevation.
- Visual badge positioned at top-right indicating AI match affinity (e.g., "94% Match") using `#E9B949` background with charcoal text.
- Image aspect ratio of 16:10, clipped at top edges with smooth radius continuity.

### Inventory List Items
- Clean surface rows separated by 8px vertical gaps on `#FAF8F2` canvas.
- 48dp leading circular preview or botanical icon placeholder.
- Trailing quick actions featuring contextual shelf-life countdown and single-tap swipe-to-consume or swipe-to-trash actions.

### Camera Scanner Frame
- Full viewport presentation with an organic, rounded scanning target viewfinder (`rounded-xl`, 24px) centered with a 2dp `#FFFFFF` stroke at 80% opacity.
- Translucent backdrop scrim (`rgba(32, 41, 35, 0.4)`).
- Floating AI detection label pills anchored inside the viewport corners notifying recognized items in real time.

### Persistent Bottom Navigation
- Anchored at bottom, `#FFFFFF` surface with Level 2 ambient top-edge diffusion.
- Height: 64dp + dynamic system navigation bar inset.
- Four destinations: Home, My Fridge, Recipes, Shopping.
- Active item uses a sage green pill indicator (`#A8C5A0` at 30% opacity) enclosing the icon, with `#245C45` typography below. Inactive items use `#778078`.
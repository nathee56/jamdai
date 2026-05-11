# Design

Visual system for JamDai, extracted from the existing codebase. This file is the source of truth for colors, typography, spacing, and component patterns.

## Color strategy

**Committed** — Orange (#FF6B1A) carries the brand identity across primary actions, navigation active states, and the AI banner gradient. Supporting roles (violet, teal, sky, amber) are used deliberately for semantic categories (schedule, notes, progress, warnings), never decoratively.

### Light mode

| Role | Token | Value |
|---|---|---|
| Surface base | `--surface-base` | `#F0F2F8` |
| Surface card | `--surface-card` | `#FFFFFF` |
| Surface raised | `--surface-raised` | `#E8EAF0` |
| Text primary | `--text-primary` | `#1A1D2E` |
| Text secondary | `--text-secondary` | `#6B7094` |
| Text muted | `--text-muted` | `#9EA3BE` |
| Accent | `--accent` | `#FF6B1A` |
| Accent soft | `--accent-soft` | `#FFF0E6` |
| Border | `--border` | `rgba(0, 0, 0, 0.06)` |
| Border strong | `--border-strong` | `rgba(0, 0, 0, 0.1)` |

### Dark mode

| Role | Token | Value |
|---|---|---|
| Surface base | `--surface-base` | `#0C111D` |
| Surface card | `--surface-card` | `#161D2F` |
| Surface raised | `--surface-raised` | `#1E2943` |
| Text primary | `--text-primary` | `#F1F5F9` |
| Accent | `--accent` | `#FF8A33` |
| Accent soft | `--accent-soft` | `rgba(255,138,51,0.15)` |

### Semantic palette

| Role | Light | Dark |
|---|---|---|
| Violet | `#8B5CF6` | `#A78BFA` |
| Teal | `#14B8A6` | `#2DD4BF` |
| Rose / Danger | `#F43F5E` | `#FB7185` |
| Sky | `#0EA5E9` | `#38BDF8` |
| Amber / Warning | `#F59E0B` | `#FBBF24` |
| Success | `#10B981` | `#4ADE80` |

## Typography

- **Font stack**: System fonts via Tailwind defaults. Thai text renders with the system Thai font (Sarabun on Android, SF Thai on iOS, Noto Sans Thai on desktop).
- **Body**: 13–14px, weight 400
- **Headings**: 15–16px, weight 600
- **Stats / hero numbers**: 24–26px, weight 700
- **Micro labels**: 11px, weight 400–500, color `--text-muted`
- **Pill / badge**: 9–10px, weight 500

## Spacing

- **Card padding**: 16–20px
- **Grid gap**: 18px (content), 10px (stat cards)
- **Section margin**: 16–18px bottom
- **Mobile horizontal padding**: 16px
- **Touch targets**: minimum 44×44px

## Layout

- **Sidebar**: 220px collapsed to 80px, fixed left (desktop only)
- **Topbar**: 60px height
- **Mobile nav**: 64px bottom bar with 4 tabs + center FAB
- **Grid**: 1 column (mobile), 2 columns (tablet), 3 columns (desktop)
- **Max content width**: none enforced (fills available space)

## Elevation

- Cards use `background: var(--surface-card)` with `border: 0.5px solid var(--border)` and `border-radius: 20px`
- No drop shadows on cards by default. Shadows reserved for floating elements (modals, FAB, tooltips)
- FAB: `box-shadow: 0 4px 16px rgba(255,107,26,0.35)`

## Motion

- Page transitions: CSS `@keyframes pageIn` — 0.3s cubic-bezier(0.2, 0, 0.2, 1)
- Stagger children: `animation-delay: calc(var(--i) * 60ms)`
- Hover: `transform: translateY(-1px)` on interactive cards
- Reduced motion: all animations collapse to 0.01ms via `prefers-reduced-motion`

## Components

### Cards
Round corners (20px radius), no nested cards. Content cards use `padding: 16–20px`. Stat cards are smaller with centered layout.

### Buttons
- Primary: `background: var(--accent)`, white text, `border-radius: 12px`, `height: 44px`
- Ghost: transparent background, `border-radius: 12px`, hover reveals surface
- Icon button: 40×44px circle, subtle background tint

### Navigation
- Sidebar nav items: 44px height, `border-radius: 12px`, orange left-border when active
- Mobile bottom nav: icon-only, active state shows orange color + dot indicator below
- Mobile drawer: slides from left with backdrop blur

### Pills / Badges
`border-radius: 999px`, small padding, used for subject tags and status indicators

### Forms
- Input: `border-radius: 12px`, `height: 44px`, `border: 1px solid var(--border)`
- Focus: `border-color: var(--accent)`, `box-shadow: 0 0 0 3px var(--accent-soft)`

### Empty states
Icon + title + description + optional action button, centered layout, encouraging Thai copy

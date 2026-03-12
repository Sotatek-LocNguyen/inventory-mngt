# Implementation Plan: Web UI Visual Polish & Enhancement

> Created: 2026-03-12 15:16:02
> Status: Draft

## Objective

Upgrade the web app's visual quality from functional-but-plain to polished and modern. Add data visualization, micro-interactions, loading states, and refined component styling while keeping the existing Tailwind CSS 4 + shadcn/ui stack.

## Scope

**In scope:**
- Dashboard: charts for stock overview, animated stat cards with trend indicators
- Tables: column sorting, row hover effects, loading skeletons
- Forms: improved select/date inputs, inline validation feedback
- Navigation: breadcrumbs, active link indicators, page transition animations
- Global: loading skeletons, empty states, toast refinements, subtle animations

**Out of scope:**
- Dark mode (already supported via next-themes, just not toggled — add toggle only)
- Mobile responsive redesign (current responsive layout is adequate)
- New pages or features
- API changes

## Architecture & Approach

- **No new UI framework** — stay on shadcn/ui + Tailwind CSS 4
- **Add Recharts** for dashboard charts (lightweight, React-native, SSR-friendly)
- **Add Framer Motion** for page transitions and micro-animations
- **Leverage existing shadcn/ui components** — add Skeleton, Tooltip, Breadcrumb from shadcn/ui CLI
- **Progressive enhancement** — each phase is independently shippable

## Phases

- [x] **Phase 1: Dashboard Visual Upgrade** — Goal: Add charts, animated stat cards, trend indicators
- [ ] **Phase 2: Table & List Enhancements** — Goal: Sorting, skeletons, row interactions, empty states
- [ ] **Phase 3: Form & Input Polish** — Goal: Better date pickers, select styling, validation UX
- [ ] **Phase 4: Navigation & Global Polish** — Goal: Breadcrumbs, page transitions, dark mode toggle, micro-animations

## Key Changes

- `apps/web/package.json` — Add recharts, framer-motion
- `apps/web/src/app/dashboard/page.tsx` — Charts + animated stat cards
- `apps/web/src/app/dashboard/layout.tsx` — Breadcrumbs, dark mode toggle
- `apps/web/src/app/dashboard/*/page.tsx` — Table sorting, skeletons, empty states
- `apps/web/src/components/ui/` — New shadcn components (skeleton, tooltip, breadcrumb)
- `apps/web/src/components/` — New shared components (StatsCard, DataChart, PageTransition)

## Verification Strategy

- `bun --cwd apps/web typecheck` — 0 errors after each phase
- `bun --cwd apps/web build` — successful build after each phase
- Visual QA in browser after each phase

## Dependencies

- **recharts** (~280KB gzipped) — React charting library for dashboard visualizations
- **framer-motion** (~32KB gzipped) — Animation library for transitions and micro-interactions
- shadcn/ui components added via CLI (skeleton, tooltip, breadcrumb) — no new deps

## Risks & Mitigations

- **Bundle size increase** → recharts and framer-motion are tree-shakeable; use dynamic imports for charts
- **SSR compatibility** → recharts needs `"use client"` wrapper; framer-motion has SSR support built in
- **Breaking existing layout** → each phase is incremental; verify build + visual QA per phase

## Open Questions

None — all improvements use established patterns within the current stack.

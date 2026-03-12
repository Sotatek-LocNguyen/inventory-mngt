# Phase 4: Navigation & Global Polish

## Objective

Add breadcrumbs, page transitions, dark mode toggle, and final visual polish to complete the UI upgrade.

## Preconditions

- Phase 3 complete (framer-motion patterns established)

## Tasks

### 1. Add shadcn/ui Breadcrumb component

```bash
cd apps/web
npx shadcn@latest add breadcrumb
```

### 2. Add breadcrumbs to dashboard layout

**File:** `apps/web/src/app/dashboard/layout.tsx`

Add a Breadcrumb bar below the top header:
- Auto-generate from current route path
- Home → Dashboard, Home → Products, Home → Reports → Stock, etc.
- Use `usePathname()` to derive breadcrumb segments
- Translate segment names using `t()` from i18n
- Last segment is plain text (current page), others are links

### 3. Add dark mode toggle

**File:** `apps/web/src/app/dashboard/layout.tsx`

Add a dark/light mode toggle button in the top header bar:
- Use `useTheme()` from next-themes
- Toggle icon: `Sun` / `Moon` from lucide-react
- Placed next to the language switcher
- Smooth icon transition on toggle

### 4. Improve sidebar navigation

**File:** `apps/web/src/app/dashboard/layout.tsx`

Enhance the sidebar:
- Active link: colored left border (4px primary) + tinted background + bold text
- Inactive links: subtle hover effect (bg-muted transition)
- Section grouping: "Management" (Products, Categories, Suppliers), "Operations" (Transactions), "Analytics" (Stock, History)
- Section headers in small uppercase muted text
- Icons for each nav item (from lucide-react): Package, Tags, Truck, ArrowLeftRight, BarChart3, History

### 5. Add page transition animations

**File:** `apps/web/src/app/dashboard/layout.tsx` or create wrapper component

Add subtle page transition when navigating between dashboard pages:
- Fade + slight upward slide (opacity 0→1, y 10→0)
- Duration: 200ms
- Use framer-motion `AnimatePresence` + `motion.div`
- Wrap the `{children}` in the dashboard layout

### 6. Polish top header bar

**File:** `apps/web/src/app/dashboard/layout.tsx`

Refine the header:
- Add user avatar/initials circle on the right side
- Show current page title in the header (derived from route, translated)
- Logout button styled as icon button with tooltip ("Logout")
- Subtle bottom shadow on header for depth

### 7. Add favicon and page titles

**File:** `apps/web/src/app/layout.tsx`

- Set meaningful `<title>` per page using Next.js metadata
- Ensure favicon is set (KiotViet-style blue icon)

### 8. Final CSS refinements

**File:** `apps/web/src/app/globals.css`

- Add smooth scrollbar styling (thin, branded color)
- Add `scroll-behavior: smooth`
- Ensure focus ring styling is consistent and visible (accessibility)
- Add subtle card shadow scale: `shadow-sm` → `shadow-md` on hover for interactive cards

## Verification

- Commands:
  - `bun --cwd apps/web typecheck` — 0 errors
  - `bun --cwd apps/web build` — successful
- Expected results:
  - Breadcrumbs appear below header on all dashboard pages
  - Dark mode toggle switches theme smoothly
  - Sidebar shows grouped sections with icons and active state
  - Page transitions animate on navigation
  - Header shows page title and user avatar
  - Scrollbar and focus styles are polished

## Exit Criteria

- [ ] Breadcrumb component added and integrated
- [ ] Dark mode toggle in header
- [ ] Sidebar: grouped sections, icons, active link indicator
- [ ] Page transitions animate between routes
- [ ] Header: page title, user avatar, polished logout
- [ ] CSS: scrollbar, focus rings, hover shadows refined
- [ ] Typecheck: 0 errors
- [ ] Build: successful

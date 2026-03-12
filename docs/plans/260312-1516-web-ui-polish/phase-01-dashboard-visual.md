# Phase 1: Dashboard Visual Upgrade

## Objective

Transform the dashboard from plain stat cards + text tables into a visually rich overview with charts, animated counters, trend indicators, and improved low-stock alerts.

## Preconditions

- Web app builds and runs successfully
- All existing functionality works (stats, low-stock alerts, recent transactions)

## Tasks

### 1. Install dependencies

```bash
cd /Users/locnguyen/Documents/Project_SotaTek/inventory-app
bun --cwd apps/web add recharts framer-motion
```

### 2. Add shadcn/ui Skeleton component

```bash
cd apps/web
npx shadcn@latest add skeleton
```

This creates `src/components/ui/skeleton.tsx`.

### 3. Create animated StatsCard component

**File:** `apps/web/src/components/dashboard/StatsCard.tsx`

Replace the current inline stat cards on the dashboard with a reusable component:
- Icon on the left (from lucide-react, colored circle background)
- Title (muted text, small)
- Value (large, bold) with animated counter (count up from 0 on mount)
- Optional trend indicator (↑ green / ↓ red with percentage)
- Subtle hover scale transform (framer-motion)
- Card uses shadcn Card component with slight shadow upgrade

### 4. Create stock distribution chart

**File:** `apps/web/src/components/dashboard/StockChart.tsx`

A `"use client"` component using Recharts:
- **Bar chart** showing top 10 products by stock quantity
- Responsive container
- Branded colors (primary blue + chart palette from globals.css)
- Tooltip on hover showing product name + quantity
- Wrapped in shadcn Card with title header

### 5. Create transaction trend chart

**File:** `apps/web/src/components/dashboard/TransactionChart.tsx`

A `"use client"` component:
- **Area chart** showing transaction volume over last 7 days
- Two series: STOCK_IN (green) and STOCK_OUT (red)
- Responsive, with gradient fills under the lines
- Wrapped in shadcn Card with title header

### 6. Refactor dashboard page

**File:** `apps/web/src/app/dashboard/page.tsx`

Restructure the dashboard layout:

```
Row 1: 4x StatsCard (total products, total stock, low stock count, today's transactions)
Row 2: StockChart (60% width) | TransactionChart (40% width)
Row 3: Low stock alerts (improved styling with icon + progress bar for stock level)
Row 4: Recent transactions table (unchanged but with hover effect)
```

- Fetch additional data for charts: `/api/reports/stock` for bar chart, `/api/transactions` (last 7 days) for area chart
- Add loading skeleton state while data loads
- Use `framer-motion` `motion.div` with `initial={{ opacity: 0, y: 20 }}` `animate={{ opacity: 1, y: 0 }}` for staggered card entrance

### 7. Improve low-stock alert section

In the dashboard page, enhance the low-stock section:
- Replace plain orange Alert with a card grid (2-3 columns)
- Each low-stock item as a mini card with: product name, current stock, min stock, and a visual progress bar (red when <25%, orange when <50%)
- Icon: `AlertTriangle` from lucide-react

## Verification

- Commands:
  - `bun --cwd apps/web typecheck` — 0 errors
  - `bun --cwd apps/web build` — successful
- Expected results:
  - Dashboard shows 4 animated stat cards with icons
  - Bar chart renders with top products by stock
  - Area chart renders with transaction trend
  - Low-stock items display as mini cards with progress bars
  - Staggered entrance animation on page load

## Exit Criteria

- [x] recharts and framer-motion installed
- [x] Skeleton component added
- [x] StatsCard component created with animated counter + hover effect
- [x] StockChart component renders bar chart from stock data
- [x] TransactionChart component renders area chart from transaction data
- [x] Dashboard page refactored with new layout
- [x] Low-stock section upgraded with progress bars
- [x] Loading skeleton shown while data loads
- [x] Typecheck: 0 errors
- [x] Build: successful

# Phase 2: Table & List Enhancements

## Objective

Upgrade all data tables across the app with column sorting, loading skeletons, improved row interactions, and polished empty states.

## Preconditions

- Phase 1 complete (skeleton component available, framer-motion installed)

## Tasks

### 1. Add shadcn/ui Tooltip component

```bash
cd apps/web
npx shadcn@latest add tooltip
```

### 2. Create SortableTable header utility

**File:** `apps/web/src/components/ui/sortable-header.tsx`

A reusable table header cell that:
- Shows column label + sort icon (ArrowUpDown from lucide-react)
- Clicks toggle ascending → descending → none
- Active sort column highlighted with directional arrow (ArrowUp / ArrowDown)
- Uses existing shadcn `TableHead` as base

### 3. Create TableSkeleton component

**File:** `apps/web/src/components/ui/table-skeleton.tsx`

Reusable skeleton loader for tables:
- Accepts `columns` (number) and `rows` (default 5)
- Renders shadcn Skeleton pulses in a table grid
- Matches the table layout so there's no layout shift

### 4. Create EmptyState component

**File:** `apps/web/src/components/EmptyState.tsx`

Reusable empty state for when lists have no data:
- Centered icon (configurable, default: `Inbox` from lucide-react)
- Title text (e.g., "No products yet")
- Description text
- Optional action button (e.g., "Add your first product")
- Subtle fade-in animation

### 5. Upgrade Products table

**File:** `apps/web/src/app/dashboard/products/page.tsx`

- Add client-side column sorting (name, category, stock, price)
- Add TableSkeleton while loading
- Add EmptyState when no products
- Row hover effect: `hover:bg-muted/50` transition
- Stock column: color-coded badge (green >min, orange =min, red <min) — keep existing badge but ensure consistent styling
- Add Tooltip on truncated product names

### 6. Upgrade Categories table

**File:** `apps/web/src/app/dashboard/categories/page.tsx`

- Column sorting (name, product count)
- TableSkeleton while loading
- EmptyState when empty
- Row hover effect

### 7. Upgrade Suppliers table

**File:** `apps/web/src/app/dashboard/suppliers/page.tsx`

- Column sorting (name, contact, phone)
- TableSkeleton while loading
- EmptyState when empty
- Row hover effect

### 8. Upgrade Transactions table

**File:** `apps/web/src/app/dashboard/transactions/page.tsx`

- Column sorting (date, product, type, quantity)
- TableSkeleton while loading
- EmptyState when empty
- Row hover effect
- Type badge with consistent coloring (STOCK_IN=green, STOCK_OUT=red, ADJUSTMENT=amber)

### 9. Upgrade Reports tables

**Files:**
- `apps/web/src/app/dashboard/reports/stock/page.tsx`
- `apps/web/src/app/dashboard/reports/history/page.tsx`

- Column sorting on all sortable columns
- TableSkeleton while loading
- EmptyState when filters produce no results ("No results match your filters")

## Verification

- Commands:
  - `bun --cwd apps/web typecheck` — 0 errors
  - `bun --cwd apps/web build` — successful
- Expected results:
  - All tables show skeleton loader during fetch
  - Clicking column headers toggles sort direction
  - Empty tables show styled empty state with action
  - Row hover highlights consistently

## Exit Criteria

- [ ] Tooltip component added
- [ ] SortableHeader utility created
- [ ] TableSkeleton component created
- [ ] EmptyState component created
- [ ] Products table: sorting + skeleton + empty state + hover
- [ ] Categories table: sorting + skeleton + empty state + hover
- [ ] Suppliers table: sorting + skeleton + empty state + hover
- [ ] Transactions table: sorting + skeleton + empty state + hover
- [ ] Stock report table: sorting + skeleton + empty state
- [ ] History report table: sorting + skeleton + empty state
- [ ] Typecheck: 0 errors
- [ ] Build: successful

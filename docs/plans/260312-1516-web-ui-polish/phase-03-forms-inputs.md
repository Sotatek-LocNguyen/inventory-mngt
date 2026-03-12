# Phase 3: Form & Input Polish

## Objective

Improve form UX across all CRUD dialogs and pages with better input components, inline validation feedback, and visual refinements.

## Preconditions

- Phase 2 complete (tooltip component available)

## Tasks

### 1. Enhance form validation feedback

**Files:** All pages using react-hook-form

Ensure consistent validation UX across all forms:
- Error messages appear below fields with red text + `AlertCircle` icon
- Fields with errors get red border (`border-destructive`)
- Fields that pass validation after error get green checkmark briefly
- Use `framer-motion` `AnimatePresence` for error message enter/exit

### 2. Improve Select component styling

**File:** `apps/web/src/components/ui/select.tsx`

Enhance the shadcn Select:
- Add search/filter functionality for selects with >5 options (category select on product form, product select on transaction form)
- Show selected item with a subtle chip style
- Improve dropdown animation (smooth slide-down)

### 3. Improve date inputs on reports

**Files:**
- `apps/web/src/app/dashboard/reports/history/page.tsx`
- `apps/web/src/app/dashboard/transactions/page.tsx`

Replace plain HTML `<input type="date">` with styled date inputs:
- Use shadcn Input component with calendar icon (`Calendar` from lucide-react)
- Add "Quick range" buttons: Today, Last 7 days, Last 30 days, This month
- Style the native date picker fallback consistently

### 4. Improve dialog forms

**File:** `apps/web/src/components/transactions/NewTransactionDialog.tsx`

Polish the transaction creation dialog:
- Add section dividers between form groups
- Conditional fields (supplier, notes) slide in/out with animation
- Submit button shows loading spinner during API call
- Success: brief green checkmark animation before dialog closes

### 5. Add form field character counts

Where relevant (notes, descriptions), add a subtle character count indicator (e.g., "45/200") below textareas.

### 6. Improve button loading states

**File:** `apps/web/src/components/ui/button.tsx`

Add a `loading` prop variant to the Button component:
- Shows a small spinner icon replacing the button icon
- Button text slightly muted
- Button disabled while loading
- Prevents double-submit

## Verification

- Commands:
  - `bun --cwd apps/web typecheck` — 0 errors
  - `bun --cwd apps/web build` — successful
- Expected results:
  - Form errors animate in/out smoothly
  - Select dropdowns support filtering for long lists
  - Date inputs show calendar icon and quick range buttons
  - Dialog forms have section dividers and loading states
  - Submit buttons show spinner during API calls

## Exit Criteria

- [ ] Validation feedback animated with enter/exit transitions
- [ ] Select component supports search filtering
- [ ] Date inputs styled with calendar icon + quick range buttons
- [ ] Transaction dialog polished with sections + animations
- [ ] Button component has `loading` prop
- [ ] Typecheck: 0 errors
- [ ] Build: successful

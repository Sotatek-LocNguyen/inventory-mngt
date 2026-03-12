# Phase 2: Catalog CRUD

## Objective

Full CRUD screens for Products, Categories, and Suppliers, with a reusable `BottomSheetSelect` component for all dropdown/select interactions on mobile.

---

## Preconditions

- Phase 1 complete: Expo app runs, auth works, dashboard visible
- API endpoints for products/categories/suppliers verified working

---

## Tasks

### 1. Reusable shared components

Create the following in `apps/mobile/components/`:

#### `BottomSheetSelect.tsx`
A modal-based dropdown replacement for `<select>`. Used everywhere a picker is needed (category, supplier, transaction type).

```
Props:
  value: string
  onValueChange: (v: string) => void
  placeholder: string
  options: { label: string; value: string }[]
```

Implementation:
- `Modal` (React Native built-in) with slide-up animation
- `FlatList` of tappable option rows
- Selected option shown with a checkmark
- Dismiss by tapping backdrop or a close button

#### `FormField.tsx`
Wrapper for label + `TextInput` + optional error message.
```
Props: label, value, onChangeText, placeholder?, error?, keyboardType?, secureTextEntry?
```

#### `ConfirmDialog.tsx`
Simple modal for delete confirmation.
```
Props: visible, title, message, onConfirm, onCancel
```

#### `EmptyState.tsx`
Centered icon + message for empty lists.
```
Props: message, onAction?, actionLabel?
```

#### `Badge.tsx`
Colored pill badge for stock status / transaction type.
```
Props: label, color: 'green' | 'orange' | 'red' | 'blue' | 'gray'
```

---

### 2. Categories screens

**File:** `apps/mobile/app/(dashboard)/products/categories/index.tsx`

- `FlatList` of categories with `RefreshControl`
- Each row: category name + Edit / Delete action buttons
- FAB (floating action button) at bottom-right to add new category
- Tapping Edit or FAB → navigates to `categories/[id].tsx` or `categories/new.tsx`

**File:** `apps/mobile/app/(dashboard)/products/categories/new.tsx`
- `FormField` for name
- Save button → `POST /api/categories` → navigate back

**File:** `apps/mobile/app/(dashboard)/products/categories/[id].tsx`
- Pre-populated `FormField` for name
- Save → `PUT /api/categories/:id` → navigate back
- Delete button → `ConfirmDialog` → `DELETE /api/categories/:id` → navigate back

---

### 3. Suppliers screens

**File:** `apps/mobile/app/(dashboard)/products/suppliers/index.tsx`
- `FlatList` with name, phone, email columns (stacked text)
- FAB to add, row actions for edit/delete

**File:** `apps/mobile/app/(dashboard)/products/suppliers/new.tsx`
- `FormField` for name (required), phone, email

**File:** `apps/mobile/app/(dashboard)/products/suppliers/[id].tsx`
- Pre-populated form + save + delete with `ConfirmDialog`

---

### 4. Products list screen

**File:** `apps/mobile/app/(dashboard)/products/_layout.tsx`
- Stack navigator: `index` → `new` / `[id]` / `categories/` / `suppliers/`
- Header right button: "Categories" link to `categories/` and "Suppliers" link to `suppliers/`

**File:** `apps/mobile/app/(dashboard)/products/index.tsx`

- `FlatList` of products with `RefreshControl`
- Each card row shows:
  - SKU (mono text, gray)
  - Product name (bold)
  - Category name
  - Stock qty — colored green/orange/red
  - Low stock badge if applicable
- FAB to add new product
- Row long-press or swipe → Edit / Delete actions

---

### 5. Products add/edit screen

**File:** `apps/mobile/app/(dashboard)/products/new.tsx`
**File:** `apps/mobile/app/(dashboard)/products/[id].tsx`

Fields (same as web):
- SKU — `FormField` (required)
- Name — `FormField` (required)
- Unit — `FormField` (required)
- Category — `BottomSheetSelect` (required, populated from `GET /api/categories`)
- Cost Price — `FormField` numeric keyboard
- Sale Price — `FormField` numeric keyboard
- Low Stock Alert — `FormField` numeric keyboard (optional)

On save:
- `POST /api/products` (new) or `PUT /api/products/:id` (edit)
- Navigate back on success, show inline error on failure

On `[id].tsx`: also show Delete button → `ConfirmDialog` → `DELETE /api/products/:id` → navigate back.

---

### 6. Products tab — sub-navigation access

In the Products tab header, add two `HeaderButton` items:
- **Categories** → `router.push('/(dashboard)/products/categories/')`
- **Suppliers** → `router.push('/(dashboard)/products/suppliers/')`

This keeps Categories/Suppliers accessible without a dedicated bottom tab.

---

## Verification

Commands:
- `bun --cwd apps/mobile typecheck` — 0 errors

Manual checks (Expo Go):
- Navigate to Products tab → list loads
- Tap FAB → add product form appears with all fields
- `BottomSheetSelect` opens, shows categories, selecting one populates field
- Save new product → appears in list with correct stock qty (0)
- Tap product → edit form pre-populated
- Edit name → save → list updated
- Delete product → confirmation dialog → product removed from list (soft-delete)
- Categories CRUD: add, edit, delete via category list screen
- Suppliers CRUD: add, edit, delete via supplier list screen
- Low stock badge appears on products at or below threshold

---

## Exit Criteria

- [x] `BottomSheetSelect` component works correctly for all dropdown fields
- [x] Products list shows all active products with stock colors
- [x] Add product: all required fields validated, saves via API
- [x] Edit product: form pre-populated, saves changes
- [x] Delete product: confirm dialog shown, soft-deletes via API
- [x] Categories: full CRUD works
- [x] Suppliers: full CRUD works
- [x] Navigation between Products / Categories / Suppliers is clear
- [x] TypeScript: 0 errors

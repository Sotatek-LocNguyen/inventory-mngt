# Phase 3: Transactions & Reports

## Objective

- Transactions list with infinite scroll and create-new screen
- Stock report screen with low-stock filter
- Transaction history report with date/type/product filters and CSV export
- All screens use the shared components from Phase 2

---

## Preconditions

- Phase 2 complete: Products, Categories, Suppliers CRUD all working
- `BottomSheetSelect`, `FormField`, `Badge`, `EmptyState` components available

---

## Tasks

### 1. Transactions stack layout

**File:** `apps/mobile/app/(dashboard)/transactions/_layout.tsx`

Stack navigator with two screens:
- `index` — transaction list
- `new` — create transaction form

---

### 2. Transactions list screen

**File:** `apps/mobile/app/(dashboard)/transactions/index.tsx`

- `FlatList` with **infinite scroll** (`onEndReached` + `onEndReachedThreshold={0.5}`)
- Each row shows:
  - Date (formatted with `toLocaleString()`)
  - Type badge (green "Nhập kho" / red "Xuất kho" / orange "Điều chỉnh")
  - Product name
  - Quantity with +/- sign (green/red)
  - Supplier name (if present)
  - Note (truncated to 1 line)
- `RefreshControl` for pull-to-refresh (resets to page 1)
- FAB → navigate to `transactions/new`

Filter bar at top (collapsible):
- `BottomSheetSelect` for transaction type (All / Stock In / Stock Out / Adjustment)
- `BottomSheetSelect` for product (All / product list)
- "Apply" button to reload

Pagination state:
```typescript
const LIMIT = 30;
const [data, setData] = useState<Transaction[]>([]);
const [total, setTotal] = useState(0);
const [offset, setOffset] = useState(0);
const [loading, setLoading] = useState(false);

async function loadMore() {
  if (loading || data.length >= total) return;
  setLoading(true);
  const res = await api.get(`/api/transactions?limit=${LIMIT}&offset=${offset}`);
  setData(prev => [...prev, ...res.data.data]);
  setTotal(res.data.total);
  setOffset(prev => prev + LIMIT);
  setLoading(false);
}
```

---

### 3. Create transaction screen

**File:** `apps/mobile/app/(dashboard)/transactions/new.tsx`

Fields:
- Type — `BottomSheetSelect` (Stock In / Stock Out / Adjustment)
- Product — `BottomSheetSelect` (shows `sku — name (stock: qty)`)
- Quantity — `FormField` numeric keyboard, min 1
- Supplier — `BottomSheetSelect` (only shown when type is STOCK_IN)
- Note — multiline `TextInput` (required for Adjustment)

Below product selector: display "Current stock: **{qty}**" text.

On save:
- `POST /api/transactions` with `{ type, productId, quantity, supplierId?, note? }`
- On success → navigate back, parent list refreshes
- On error with "insufficient" → show inline red error below quantity field
- On other errors → show generic error message

---

### 4. Reports stack layout

**File:** `apps/mobile/app/(dashboard)/reports/_layout.tsx`

Stack navigator with:
- `stock` — Stock levels report
- `history` — Transaction history report

The Reports bottom tab opens a screen with two navigation cards (or a `TopTabBar`):
- "Stock Report" → `reports/stock`
- "History Report" → `reports/history`

Alternative: use `@react-navigation/material-top-tabs` for a swipeable top tab bar.

---

### 5. Stock report screen

**File:** `apps/mobile/app/(dashboard)/reports/stock.tsx`

- Summary bar at top: 3 inline cards (Total / Low Stock / Out of Stock — same as web)
- Filter row:
  - Checkbox toggle: "Show low stock only"
  - `BottomSheetSelect` for category filter
- `FlatList` of stock items:
  - SKU (mono, gray)
  - Product name (bold)
  - Category
  - Stock qty (colored green/orange/red)
  - Threshold
  - Status badge (Còn hàng / Sắp hết / Hết hàng)
- `RefreshControl` for pull-to-refresh

---

### 6. Transaction history report screen

**File:** `apps/mobile/app/(dashboard)/reports/history.tsx`

- Filter panel (collapsible card at top):
  - From date — tap to open `DateTimePicker` modal
  - To date — tap to open `DateTimePicker` modal
  - Type — `BottomSheetSelect`
  - Product — `BottomSheetSelect`
  - Apply button
- `FlatList` with infinite scroll (same pattern as transactions list)
- Each row: date, type badge, product (sku + name), quantity (+/-), supplier, note
- Header-right button: "Export CSV" → `Linking.openURL(apiUrl + '/api/reports/history/export?...')` to open in device browser

Install date picker:
```bash
cd apps/mobile && npx expo install @react-native-community/datetimepicker
```

---

### 7. Date picker component

**File:** `apps/mobile/components/DatePickerField.tsx`

```
Props: label, value (Date | undefined), onChange (date: Date) => void
```

- Shows current date as text (or placeholder)
- On tap → opens `DateTimePicker` in modal mode
- On confirm → calls `onChange` with selected date
- Platform-handled: iOS shows inline spinner, Android shows system dialog

---

## Verification

Commands:
- `bun --cwd apps/mobile typecheck` — 0 errors

Manual checks (Expo Go):
- Transactions tab → list loads with data from API
- Scroll down → more items load automatically (infinite scroll)
- Pull down → refreshes from page 1
- FAB → create transaction form
- Select type "Stock In" → supplier field appears
- Select type "Adjustment" → note field becomes required
- Enter quantity exceeding stock → "Insufficient stock" error inline
- Save valid transaction → appears at top of list
- Reports tab → stock report shows summary cards + item list
- Check "low stock only" → list filters
- History report → set date range → apply → list filters
- "Export CSV" → opens browser with CSV download

---

## Exit Criteria

- [x] Transactions list renders with infinite scroll (no pagination buttons)
- [x] Pull-to-refresh works on all list screens
- [x] Create transaction: all field types, validation, insufficient stock error
- [x] Supplier field only shows when type is STOCK_IN
- [x] Note required for ADJUSTMENT type
- [x] Stock report: summary cards, category filter, low-stock-only toggle
- [x] History report: date picker filters, type/product filters, apply
- [x] CSV export opens correctly in device browser
- [x] DatePicker works on both iOS and Android
- [x] TypeScript: 0 errors

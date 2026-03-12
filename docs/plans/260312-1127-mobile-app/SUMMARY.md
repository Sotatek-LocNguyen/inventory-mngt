# Implementation Plan: React Native Mobile App

> Created: 2026-03-12 11:27:00
> Status: Draft

---

## Objective

Build a React Native mobile app (`apps/mobile`) for the inventory management system using **Expo Router + NativeWind**, providing full feature parity with the existing web app on both iOS and Android.

The mobile app shares the existing Express API (`apps/api`) and `packages/types`. A new `packages/i18n` package will be extracted in Phase 4 to share VI/EN/KR translations between web and mobile.

---

## Scope

**In scope:**
- `apps/mobile` — Expo SDK 53, Expo Router v4, NativeWind v4
- Login / logout / auth guard
- Dashboard overview (stat cards, low-stock alert, recent transactions)
- Products CRUD (list, add, edit, soft-delete)
- Categories CRUD
- Suppliers CRUD
- Transactions — list with infinite scroll, create new
- Stock report screen
- Transaction history report with date/type/product filters
- CSV export via `expo-linking`
- Multi-language (VI / EN / KR) via `packages/i18n`
- One API change: `POST /auth/login` returns `{ ok: true, token }` alongside cookie

**Out of scope:**
- Barcode/QR scanner
- Offline mode
- Push notifications
- EAS Build CI setup (user handles separately)

---

## Architecture & Approach

### Stack
- **Expo SDK 53** (React Native 0.78, React 19)
- **expo-router v4** — file-based navigation (mirrors Next.js App Router)
- **NativeWind v4** — Tailwind-like styling (requires Tailwind CSS v3 for metro transformer)
- **axios** — HTTP client with Bearer token interceptor
- **expo-secure-store** — JWT storage (Keychain/Keystore)
- **@inventory/types** — shared via bun workspace
- **@inventory/i18n** — new shared package (Phase 4)

### Navigation structure
```
app/
├── _layout.tsx              ← Root: auth guard + LanguageProvider
├── (auth)/
│   └── login.tsx
└── (dashboard)/
    ├── _layout.tsx          ← Bottom tabs: Home | Products | Transactions | Reports
    ├── index.tsx            ← Dashboard overview
    ├── products/
    │   ├── _layout.tsx      ← Stack navigator
    │   ├── index.tsx        ← Products list
    │   ├── [id].tsx         ← Edit product
    │   ├── new.tsx          ← Add product
    │   ├── categories/
    │   │   ├── index.tsx
    │   │   └── [id].tsx
    │   └── suppliers/
    │       ├── index.tsx
    │       └── [id].tsx
    ├── transactions/
    │   ├── _layout.tsx      ← Stack navigator
    │   ├── index.tsx        ← Transactions list
    │   └── new.tsx          ← Create transaction
    └── reports/
        ├── _layout.tsx      ← Stack navigator
        ├── stock.tsx
        └── history.tsx
```

### Auth flow
- JWT stored in `expo-secure-store` (key: `auth_token`)
- Root `_layout.tsx` checks token on mount — redirects to `/(auth)/login` if absent
- `POST /auth/login` → read `token` from response body → store in SecureStore
- `POST /auth/logout` → delete token from SecureStore → navigate to login
- Axios interceptor: attaches `Authorization: Bearer <token>` to every request; on 401 → clears token + navigates to login

### NativeWind note
NativeWind v4 requires **Tailwind CSS v3** (not v4) for its Metro bundler transformer. The web uses Tailwind v4 — these are independent configs per app; no conflict.

---

## Phases

- [ ] **Phase 1: Scaffold, Auth & Dashboard** — Goal: Running Expo app with login, auth guard, and dashboard overview screen
- [ ] **Phase 2: Catalog CRUD** — Goal: Full Products, Categories, and Suppliers management screens
- [ ] **Phase 3: Transactions & Reports** — Goal: Transaction list/create, stock report, history report with export
- [ ] **Phase 4: Shared i18n Package** — Goal: Extract translations to `packages/i18n`, wire VI/EN/KR switcher in mobile

---

## Key Changes

| File/Area | Change |
|---|---|
| `apps/api/src/routes/auth.ts` | Add `token` to login JSON response |
| `apps/mobile/` | New Expo app (entire new directory) |
| `packages/i18n/` | New shared package (Phase 4) |
| `apps/web/src/lib/i18n.tsx` | Refactored to import from `@inventory/i18n` (Phase 4) |
| Root `package.json` | Add `dev:mobile`, `build:mobile:android`, `build:mobile:ios` scripts |

---

## Verification Strategy

Each phase includes its own verification. Global checks:
- `bun --cwd apps/mobile typecheck` — TypeScript clean
- Expo Go on physical device or simulator: login → navigate all tabs → create a transaction
- API reachable: `EXPO_PUBLIC_API_URL=http://<local-ip>:3001` in `apps/mobile/.env`

---

## Dependencies

| Package | Purpose |
|---|---|
| `expo` ~53 | Core Expo SDK |
| `expo-router` ~4 | File-based navigation |
| `nativewind` ^4 | Tailwind CSS for RN |
| `tailwindcss` ^3 | Required by NativeWind v4 transformer |
| `axios` | HTTP client (same as web) |
| `expo-secure-store` | JWT storage (Keychain/Keystore) |
| `expo-linking` | Open CSV export URL in browser |
| `@react-native-community/datetimepicker` | Date filter in history report |
| `react-native-safe-area-context` | Safe area insets |
| `react-native-screens` | Required by expo-router |
| `@inventory/types` | Shared type definitions (workspace:*) |
| `@inventory/i18n` | Shared translations (Phase 4, workspace:*) |

---

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| NativeWind v4 + Expo SDK 53 config quirks | Use `npx create-expo-app --template` with NativeWind template as baseline; pin exact versions |
| No native `<select>` on mobile | Build `BottomSheetSelect` component in Phase 1; used everywhere that dropdowns appear |
| API not reachable from physical device | Document `.env` local IP setup; use simulator first for initial development |
| JWT in SecureStore vs web cookie | Independent auth stores; mobile reads `token` field in login response body |
| Tailwind v3 (mobile) vs v4 (web) | Separate configs; NativeWind v4 is explicit about v3 requirement — no shared config |

---

## Open Questions

- Language preference: device-local (localStorage/SecureStore) for now — global sync deferred
- EAS Build account setup: user handles out-of-band
- `@react-native-community/datetimepicker` requires native build — use Expo Go's pre-bundled version or `expo-dev-client` for testing

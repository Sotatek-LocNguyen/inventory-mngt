# Brainstorm: React Native Mobile App

> Created: 2026-03-12 11:20:00
> Project: inventory-app monorepo

---

## Context

The existing inventory management system is web-only (Next.js + Express API). Warehouse staff and shop owners need mobile access to check stock, create transactions, and view reports while on the move.

The monorepo already has:
- `apps/api` — Express + Prisma + PostgreSQL, JWT auth via httpOnly cookie
- `apps/web` — Next.js App Router, NativeWind-style Tailwind, KiotViet blue UI
- `packages/types` — shared TypeScript interfaces (Product, Transaction, etc.)
- Multi-language support: VI / EN / KR via a context-based i18n system

---

## Goals

- Full feature parity with the web app on iOS and Android
- Same existing API — no new backend routes (except one small auth change)
- Consistent visual identity: blue `#1677ff` primary, compact data-dense lists
- Multi-language support (VI / EN / KR) shared with web
- No offline mode — always-online

## Non-goals

- Barcode / QR scanner (Phase 2 enhancement)
- Offline mode / sync
- Push notifications
- Multi-user / role management beyond single admin

---

## Chosen Approach

**Expo Router + NativeWind** (Approach A)

### Rationale
- `expo-router` file-based routing mirrors the Next.js App Router structure already in use — same mental model
- NativeWind v4 brings Tailwind-like class names to React Native — familiar styling pattern from the web
- Expo managed workflow removes native toolchain friction for initial development
- EAS Build handles iOS/Android production builds without local Xcode/Android Studio
- `packages/types` shared directly via bun workspaces — zero duplication of type definitions

---

## Alternatives Considered

| Approach | Reason not chosen |
|---|---|
| Expo Router + React Native Paper | Material Design diverges visually from KiotViet blue aesthetic; more theming overhead |
| Expo Router + Tamagui | Steep configuration, overkill for this project scope |
| Bare React Native CLI | Requires Xcode + Android Studio from day one; no clear benefit over Expo for this use case |

---

## Proposed Architecture

### Monorepo structure

```
inventory-app/
├── apps/
│   ├── api/          (unchanged)
│   ├── web/          (unchanged)
│   └── mobile/       (NEW)
│       ├── app/
│       │   ├── (auth)/
│       │   │   └── login.tsx
│       │   ├── (dashboard)/
│       │   │   ├── _layout.tsx      ← Bottom tab bar
│       │   │   ├── index.tsx        ← Dashboard overview
│       │   │   ├── products/
│       │   │   │   ├── index.tsx
│       │   │   │   └── [id].tsx
│       │   │   ├── categories/
│       │   │   ├── suppliers/
│       │   │   ├── transactions/
│       │   │   └── reports/
│       │   │       ├── stock.tsx
│       │   │       └── history.tsx
│       │   └── _layout.tsx          ← Root auth guard
│       ├── components/
│       ├── lib/
│       │   ├── api.ts               ← Axios + Bearer token
│       │   └── i18n.tsx             ← Re-exports from packages/i18n
│       └── package.json
└── packages/
    ├── types/        (existing)
    └── i18n/         (NEW — extracted from web/src/lib/i18n.tsx)
```

### Navigation
- Root layout: auth guard — reads JWT from `expo-secure-store`, redirects to `/login` if absent
- Dashboard layout: bottom tab bar with 4 tabs — Home, Products, Transactions, Reports
- Categories and Suppliers: stack-navigated from within the Products tab
- Transactions list uses infinite scroll (`FlatList` + `onEndReached`) instead of pagination buttons

### Auth change required
`POST /auth/login` returns `{ ok: true, token }` in addition to setting the httpOnly cookie.
Web uses the cookie as before. Mobile reads `token` from the response body and stores it in `expo-secure-store`.

```typescript
// apps/api/src/routes/auth.ts — one-line change
res.json({ ok: true, token }); // was: res.json({ ok: true })
```

---

## Key Libraries

| Purpose | Library |
|---|---|
| Navigation | `expo-router` |
| Styling | `nativewind` v4 |
| HTTP | `axios` |
| Token storage | `expo-secure-store` |
| Date picker | `@react-native-community/datetimepicker` |
| Select/modal | Custom bottom sheet FlatList |
| Pull-to-refresh | Built-in `RefreshControl` |

---

## Shared Packages Strategy

| Asset | Strategy |
|---|---|
| `packages/types` | Imported as `@inventory/types` in mobile — zero change |
| `packages/i18n` | **New package** — extract translations from `apps/web/src/lib/i18n.tsx`; both web and mobile import from here |
| API client pattern | Thin copy in `apps/mobile/lib/api.ts` — same Axios pattern, uses `Authorization: Bearer` header |

---

## Error Handling

| Scenario | Handling |
|---|---|
| 401 Unauthorized | API interceptor clears SecureStore token → navigate to `/login` |
| Network timeout | 10s axios timeout, toast error, pull-to-refresh to retry |
| Insufficient stock | Inline error below quantity field (same as web) |
| Empty category/supplier list | Empty state with shortcut to add one |
| CSV export | `expo-linking.openURL()` to open export URL in device browser |

---

## Rollout Phases

| Phase | Scope |
|---|---|
| 1 | Expo scaffold in `apps/mobile`, auth flow (login/logout), dashboard overview |
| 2 | Products CRUD, Categories CRUD, Suppliers CRUD |
| 3 | Transactions (create + list with infinite scroll), Stock report, History report |
| 4 | Extract `packages/i18n`, wire VI/EN/KR language switcher in mobile |

Root `package.json` scripts to add:
```json
"dev:mobile": "bun --cwd apps/mobile start",
"build:mobile:android": "bun --cwd apps/mobile eas build --platform android",
"build:mobile:ios": "bun --cwd apps/mobile eas build --platform ios"
```

---

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| NativeWind v4 config issues with Expo | Pin known-working Expo SDK + NativeWind versions; use Expo's official NativeWind template as base |
| Select/dropdown UX on mobile | Build a reusable `BottomSheetSelect` component early — used across all CRUD forms |
| API reachable from device | Configure `EXPO_PUBLIC_API_URL` env var; document local IP setup for team |
| JWT stored insecurely | Use `expo-secure-store` (Keychain on iOS, Keystore on Android) — not AsyncStorage |

---

## Open Questions

- Should the mobile app support barcode scanning for quick product lookup? (deferred to Phase 2)
- Will EAS Build free tier be sufficient, or is a paid plan needed for CI?
- Should the language preference be synced between web and mobile (e.g., via API user settings), or remain device-local?

---

## Next Step Recommendation

Run `write-plan` with 4 phases as defined above. Phase 1 (scaffold + auth) can be executed immediately using the existing API with the single-line login response change.

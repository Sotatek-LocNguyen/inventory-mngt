# Phase 1: Scaffold, Auth & Dashboard

## Objective

- Expo app running in `apps/mobile` with NativeWind configured
- Login screen → stores JWT → navigates to dashboard
- Auth guard redirects unauthenticated users to login
- Dashboard overview screen with stat cards, low-stock alert, recent transactions
- Root `package.json` updated with mobile scripts
- API: `POST /auth/login` returns `{ ok: true, token }` in response body

---

## Preconditions

- Existing `apps/api` running on port 3001
- Bun installed, `packages/types` workspace package available
- Node.js (for npx) available alongside bun
- Device/simulator on same network as dev machine (for API access)

---

## Tasks

### 1. API — Add token to login response

**File:** `apps/api/src/routes/auth.ts`

Change line 26:
```typescript
// Before:
res.json({ ok: true });

// After:
res.json({ ok: true, token });
```

**Verify:** `curl -X POST http://localhost:3001/auth/login -H 'Content-Type: application/json' -d '{"email":"abc@gmail.com","password":"123456"}'` should return `{ "ok": true, "token": "eyJ..." }`.

---

### 2. Scaffold Expo app

From the repo root:

```bash
cd /path/to/inventory-app
npx create-expo-app@latest apps/mobile --template with-router
```

Then install NativeWind and dependencies:

```bash
cd apps/mobile
npx expo install nativewind tailwindcss@^3 react-native-safe-area-context react-native-screens
npx expo install expo-secure-store expo-linking
npm install axios
```

> **Note:** Use `npm install` (not `bun`) for expo packages to avoid peer-dep resolution issues. Expo's own packages use `npx expo install` which pins compatible versions.

---

### 3. Configure NativeWind

**File:** `apps/mobile/tailwind.config.js` (create)
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#1677ff',
      },
    },
  },
  plugins: [],
};
```

**File:** `apps/mobile/global.css` (create)
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**File:** `apps/mobile/metro.config.js` (create/modify)
```javascript
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, { input: './global.css' });
```

**File:** `apps/mobile/babel.config.js` (modify to add NativeWind preset)
```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
  };
};
```

**File:** `apps/mobile/nativewind-env.d.ts` (create)
```typescript
/// <reference types="nativewind/types" />
```

---

### 4. Add `@inventory/types` dependency

**File:** `apps/mobile/package.json` — add to dependencies:
```json
"@inventory/types": "workspace:*"
```

Then run `bun install` from the repo root.

---

### 5. Configure environment variable

**File:** `apps/mobile/.env` (create)
```
EXPO_PUBLIC_API_URL=http://192.168.x.x:3001
```

> Replace `192.168.x.x` with your machine's local IP. Use `ipconfig getifaddr en0` (macOS) or `ip route get 1` (Linux).

---

### 6. Create API client

**File:** `apps/mobile/lib/api.ts` (create)
```typescript
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';

const TOKEN_KEY = 'auth_token';

export const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 10000,
});

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401) {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      router.replace('/(auth)/login');
    }
    return Promise.reject(err);
  }
);

export { TOKEN_KEY };
```

---

### 7. Create i18n context (mobile-local for now)

**File:** `apps/mobile/lib/i18n.tsx` (create)

Copy the translation dictionaries (vi/en/kr) from `apps/web/src/lib/i18n.tsx`, removing the `'use client'` directive. Wrap with React Native AsyncStorage instead of localStorage.

Key changes from web version:
- Remove `'use client'` at top
- Replace `localStorage` with `expo-secure-store` or `AsyncStorage` for persistence

```typescript
import { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ... (translations object identical to web) ...

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('vi');

  useEffect(() => {
    AsyncStorage.getItem('lang').then((saved) => {
      if (saved && saved in translations) setLangState(saved as Lang);
    });
  }, []);

  function setLang(l: Lang) {
    setLangState(l);
    AsyncStorage.setItem('lang', l);
  }

  function t(key: TranslationKey): string {
    return (translations[lang] as Record<string, string>)[key]
      ?? (translations.vi as Record<string, string>)[key]
      ?? key;
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}
```

Install `@react-native-async-storage/async-storage`:
```bash
cd apps/mobile && npx expo install @react-native-async-storage/async-storage
```

---

### 8. Root layout — auth guard

**File:** `apps/mobile/app/_layout.tsx` (create)
```typescript
import { useEffect, useState } from 'react';
import { Slot, router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { TOKEN_KEY } from '../lib/api';
import { LanguageProvider } from '../lib/i18n';
import '../global.css';

export default function RootLayout() {
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    SecureStore.getItemAsync(TOKEN_KEY).then((token) => {
      if (!token) router.replace('/(auth)/login');
      setChecked(true);
    });
  }, []);

  if (!checked) return null; // splash screen visible

  return (
    <LanguageProvider>
      <Slot />
    </LanguageProvider>
  );
}
```

---

### 9. Login screen

**File:** `apps/mobile/app/(auth)/login.tsx` (create)

- Email + password inputs using `TextInput`
- Submit calls `POST /auth/login` → stores `data.token` in SecureStore → `router.replace('/(dashboard)/')`
- Error message shown inline on 401
- Language switcher (VI / EN / KR) at top
- Blue `#1677ff` brand panel above form on larger screens

---

### 10. Dashboard layout — bottom tabs

**File:** `apps/mobile/app/(dashboard)/_layout.tsx` (create)

```typescript
import { Tabs } from 'expo-router';
// Tab icons via expo/vector-icons (Ionicons)
// Tabs: Home, Products, Transactions, Reports
```

Four tabs:
| Tab | Icon | Route |
|---|---|---|
| Home | `home-outline` | `/(dashboard)/` |
| Products | `cube-outline` | `/(dashboard)/products/` |
| Transactions | `document-text-outline` | `/(dashboard)/transactions/` |
| Reports | `bar-chart-outline` | `/(dashboard)/reports/stock` |

Active tab color: `#1677ff`. Inactive: `#9ca3af`.

---

### 11. Dashboard overview screen

**File:** `apps/mobile/app/(dashboard)/index.tsx` (create)

Fetches same endpoints as web dashboard page:
- `GET /api/reports/stock` → total product count
- `GET /api/reports/stock?lowStockOnly=true` → low stock items
- `GET /api/suppliers` → supplier count
- `GET /api/reports/history?from=<today>&limit=1` → today's transaction count
- `GET /api/transactions?limit=10` → recent transactions

Layout:
- `ScrollView` with `RefreshControl`
- 2×2 grid of stat cards (using `View` grid, not CSS grid)
- Orange warning box for low-stock items (if any)
- `FlatList` of recent transactions with type badges

---

### 12. Add root scripts

**File:** `package.json` (root) — add to `scripts`:
```json
"dev:mobile": "bun --cwd apps/mobile start",
"build:mobile:android": "bun --cwd apps/mobile eas build --platform android",
"build:mobile:ios": "bun --cwd apps/mobile eas build --platform ios"
```

---

## Verification

Commands:
- `bun --cwd apps/mobile typecheck` — TypeScript must report 0 errors
- `bun dev:mobile` — Expo server starts, QR code shown
- Scan QR with Expo Go → app loads
- Login with `abc@gmail.com` / `123456` → navigates to dashboard
- Dashboard shows stat cards with live data from API
- `curl` test: `POST /auth/login` returns `{ ok: true, token: "..." }`

Expected results:
- Login screen renders correctly on device
- Auth guard: killing app + reopening without login → stays on dashboard (token persisted)
- Auth guard: clearing SecureStore → redirects to login
- All 4 bottom tabs navigable

---

## Exit Criteria

- [ ] `POST /auth/login` returns `token` in response body
- [ ] Expo app boots and shows login screen via Expo Go
- [ ] Login with valid credentials stores token and navigates to dashboard
- [ ] Login with invalid credentials shows inline error
- [ ] Auth guard redirects unauthenticated users to login on app launch
- [ ] Dashboard displays 4 stat cards with real data
- [ ] Low-stock alert appears when items are below threshold
- [ ] Recent transactions list renders
- [ ] All 4 bottom tabs render (Products/Transactions/Reports show empty placeholder)
- [ ] TypeScript: 0 errors

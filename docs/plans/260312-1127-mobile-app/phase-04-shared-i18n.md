# Phase 4: Shared i18n Package

## Objective

- Extract translation dictionaries from `apps/web/src/lib/i18n.tsx` into a new `packages/i18n` package
- Both web and mobile import translations from `@inventory/i18n`
- Add language switcher to mobile app (profile/settings area)
- All mobile screens use `t()` for user-facing strings

---

## Preconditions

- Phase 3 complete: all mobile screens functional
- Mobile currently uses a local copy of translations in `apps/mobile/lib/i18n.tsx`

---

## Tasks

### 1. Create `packages/i18n` package

**File:** `packages/i18n/package.json`
```json
{
  "name": "@inventory/i18n",
  "version": "0.0.1",
  "main": "./src/index.ts",
  "types": "./src/index.ts"
}
```

**File:** `packages/i18n/src/index.ts`

Extract from `apps/web/src/lib/i18n.tsx`:
- `Lang` type
- `TranslationKey` type
- `translations` dictionary (vi, en, kr objects)
- `getTranslation(lang: Lang, key: TranslationKey): string` utility function

**Do NOT** include React context or hooks — those are framework-specific. Only export:
```typescript
export type Lang = 'vi' | 'en' | 'kr';
export type TranslationKey = keyof typeof translations.vi;
export const translations: Record<Lang, Record<TranslationKey, string>>;
export function getTranslation(lang: Lang, key: TranslationKey): string;
```

---

### 2. Add workspace dependency

Root `bun install` will resolve after adding to both apps:

**File:** `apps/web/package.json` — add:
```json
"@inventory/i18n": "workspace:*"
```

**File:** `apps/mobile/package.json` — add:
```json
"@inventory/i18n": "workspace:*"
```

Run `bun install` from repo root.

---

### 3. Refactor web i18n

**File:** `apps/web/src/lib/i18n.tsx`

Replace the inline `translations` object with an import:
```typescript
'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { translations, getTranslation, type Lang, type TranslationKey } from '@inventory/i18n';

// LanguageProvider, useLanguage remain unchanged
// t() function now uses: getTranslation(lang, key)
```

Delete the local `translations` object (200+ lines). Keep only the React context/hook wrappers.

---

### 4. Refactor mobile i18n

**File:** `apps/mobile/lib/i18n.tsx`

Same pattern as web refactor:
```typescript
import { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { translations, getTranslation, type Lang, type TranslationKey } from '@inventory/i18n';

// LanguageProvider using AsyncStorage
// useLanguage hook
// t() calls getTranslation(lang, key)
```

---

### 5. Language switcher in mobile

**File:** `apps/mobile/app/(dashboard)/_layout.tsx`

Add a language switcher to the dashboard layout. Two placement options:

**Option A — Header right button:**
In the tab bar's `screenOptions`, add a header-right button showing the current language flag. Tapping opens a `BottomSheetSelect` with:
- 🇻🇳 VI
- 🇺🇸 EN
- 🇰🇷 KR

**Option B — Profile/settings screen:**
Add a 5th tab "Settings" or a gear icon in the header that opens a settings screen with language selection.

**Recommended: Option A** — keeps the UI compact and consistent with the web header switcher.

---

### 6. Verify all screens use `t()`

Audit every mobile screen to ensure all user-facing strings use `t('key')`:
- Login screen labels and errors
- Dashboard card labels, alert text
- Products/Categories/Suppliers list headers, form labels, action buttons
- Transactions list headers, form labels, error messages
- Reports filter labels, column headers, status badges
- Tab bar labels
- Dialogs and confirmations

---

### 7. Verify web still works

After the refactor, run:
```bash
bun --cwd apps/web typecheck
bun --cwd apps/web build
```

Open web app in browser → switch languages → verify all strings update correctly.

---

## Verification

Commands:
- `bun --cwd packages/i18n typecheck` (if tsconfig exists) or verify imports resolve
- `bun --cwd apps/web typecheck` — 0 errors
- `bun --cwd apps/mobile typecheck` — 0 errors
- `bun --cwd apps/web build` — successful build

Manual checks:
- Web: switch VI → EN → KR → all labels update (no missing keys)
- Mobile (Expo Go): tap language switcher → all labels update throughout app
- Mobile: kill app → reopen → language persisted (AsyncStorage)
- Mobile: every screen checked for untranslated hardcoded strings

---

## Exit Criteria

- [x] `packages/i18n` package created with all translation dictionaries
- [x] `apps/web/src/lib/i18n.tsx` imports from `@inventory/i18n` — no local translations
- [x] `apps/mobile/lib/i18n.tsx` imports from `@inventory/i18n` — no local translations
- [x] Web typecheck: 0 errors
- [x] Web build: successful
- [x] Mobile typecheck: 0 errors
- [x] Language switcher visible and functional in mobile header
- [x] Language persisted across mobile app restarts
- [x] All mobile screens use `t()` — no hardcoded user-facing strings
- [x] Switching language in mobile updates: tabs, headers, form labels, buttons, badges, alerts, empty states

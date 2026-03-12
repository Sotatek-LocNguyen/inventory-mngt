'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { getTranslation, type Lang, type TranslationKey } from '@inventory/i18n';

export type { Lang, TranslationKey };

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'vi',
  setLang: () => {},
  t: (key) => key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('vi');

  useEffect(() => {
    const saved = localStorage.getItem('lang') as Lang | null;
    if (saved && (saved === 'vi' || saved === 'en' || saved === 'kr')) setLangState(saved);
  }, []);

  function setLang(l: Lang) {
    setLangState(l);
    localStorage.setItem('lang', l);
  }

  function t(key: TranslationKey): string {
    return getTranslation(lang, key);
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

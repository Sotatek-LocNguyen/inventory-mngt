import { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
    AsyncStorage.getItem('lang').then((saved) => {
      if (saved && (saved === 'vi' || saved === 'en' || saved === 'kr')) setLangState(saved as Lang);
    });
  }, []);

  function setLang(l: Lang) {
    setLangState(l);
    AsyncStorage.setItem('lang', l);
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

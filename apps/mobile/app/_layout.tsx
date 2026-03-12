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

  if (!checked) return null;

  return (
    <LanguageProvider>
      <Slot />
    </LanguageProvider>
  );
}

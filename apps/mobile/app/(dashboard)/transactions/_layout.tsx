import { Stack } from 'expo-router';
import { useLanguage } from '../../../lib/i18n';

export default function TransactionsLayout() {
  const { t } = useLanguage();

  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: t('txTitle') }} />
      <Stack.Screen name="new" options={{ title: t('newTxTitle') }} />
    </Stack>
  );
}

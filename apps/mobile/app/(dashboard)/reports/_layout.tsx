import { Stack } from 'expo-router';
import { useLanguage } from '../../../lib/i18n';

export default function ReportsLayout() {
  const { t } = useLanguage();

  return (
    <Stack>
      <Stack.Screen name="stock" options={{ title: t('stockTitle') }} />
      <Stack.Screen name="history" options={{ title: t('historyTitle') }} />
    </Stack>
  );
}

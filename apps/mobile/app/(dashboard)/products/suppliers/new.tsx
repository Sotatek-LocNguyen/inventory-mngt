import { useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { api } from '../../../../lib/api';
import { useLanguage } from '../../../../lib/i18n';
import { FormField } from '../../../../components/FormField';

export default function NewSupplierScreen() {
  const { t } = useLanguage();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function handleSave() {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = t('required');
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setSaving(true);
    try {
      await api.post('/api/suppliers', {
        name: form.name.trim(),
        phone: form.phone.trim() || undefined,
        email: form.email.trim() || undefined,
      });
      router.back();
    } catch {
      Alert.alert(t('saveFailed'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView className="flex-1 bg-gray-50" keyboardShouldPersistTaps="handled">
      <View className="p-4">
        <FormField
          label={t('labelSupplierName')}
          value={form.name}
          onChangeText={(v) => setForm((f) => ({ ...f, name: v }))}
          error={errors.name}
        />
        <FormField
          label={`${t('labelPhone')} (${t('optional')})`}
          value={form.phone}
          onChangeText={(v) => setForm((f) => ({ ...f, phone: v }))}
          keyboardType="phone-pad"
        />
        <FormField
          label={`${t('colEmail')} (${t('optional')})`}
          value={form.email}
          onChangeText={(v) => setForm((f) => ({ ...f, email: v }))}
          keyboardType="email-address"
        />

        <TouchableOpacity
          className={`rounded-lg py-3.5 items-center mt-2 ${saving ? 'bg-blue-300' : 'bg-primary'}`}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-semibold text-base">{t('save')}</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

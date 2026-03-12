import { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { api } from '../../../../lib/api';
import { useLanguage } from '../../../../lib/i18n';
import { FormField } from '../../../../components/FormField';
import { ConfirmDialog } from '../../../../components/ConfirmDialog';
import type { Supplier } from '@inventory/types';

export default function EditSupplierScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useLanguage();
  const [saving, setSaving] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    api.get<Supplier[]>('/api/suppliers').then((res) => {
      const s = res.data.find((x) => x.id === Number(id));
      if (s) setForm({ name: s.name, phone: s.phone ?? '', email: s.email ?? '' });
    });
  }, [id]);

  async function handleSave() {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = t('required');
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setSaving(true);
    try {
      await api.put(`/api/suppliers/${id}`, {
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

  async function handleDelete() {
    try {
      await api.delete(`/api/suppliers/${id}`);
      setShowDelete(false);
      router.back();
    } catch {
      Alert.alert(t('deleteFailed'));
      setShowDelete(false);
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

        <TouchableOpacity
          className="rounded-lg py-3.5 items-center mt-3 border border-red-300"
          onPress={() => setShowDelete(true)}
        >
          <Text className="text-red-500 font-semibold text-base">{t('deleteSupplier')}</Text>
        </TouchableOpacity>
      </View>

      <ConfirmDialog
        visible={showDelete}
        title={t('deleteSupplier')}
        message={`${t('deleteSupplier')} "${form.name}"?`}
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />
    </ScrollView>
  );
}

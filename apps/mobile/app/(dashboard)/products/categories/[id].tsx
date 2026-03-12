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
import type { Category } from '@inventory/types';

export default function EditCategoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    api.get<Category[]>('/api/categories').then((res) => {
      const cat = res.data.find((c) => c.id === Number(id));
      if (cat) setName(cat.name);
    });
  }, [id]);

  async function handleSave() {
    if (!name.trim()) {
      setError(t('required'));
      return;
    }
    setSaving(true);
    try {
      await api.put(`/api/categories/${id}`, { name: name.trim() });
      router.back();
    } catch {
      Alert.alert(t('saveFailed'));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    try {
      await api.delete(`/api/categories/${id}`);
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
          label={t('labelCategoryName')}
          value={name}
          onChangeText={(v) => {
            setName(v);
            setError('');
          }}
          error={error}
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
          <Text className="text-red-500 font-semibold text-base">{t('deleteCategory')}</Text>
        </TouchableOpacity>
      </View>

      <ConfirmDialog
        visible={showDelete}
        title={t('deleteCategory')}
        message={`${t('deleteCategoryConfirm')} "${name}"?`}
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />
    </ScrollView>
  );
}

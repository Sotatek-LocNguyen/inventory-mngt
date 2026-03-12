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

export default function NewCategoryScreen() {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!name.trim()) {
      setError(t('required'));
      return;
    }
    setSaving(true);
    try {
      await api.post('/api/categories', { name: name.trim() });
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
      </View>
    </ScrollView>
  );
}

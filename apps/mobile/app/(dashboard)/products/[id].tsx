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
import { api } from '../../../lib/api';
import { useLanguage } from '../../../lib/i18n';
import { FormField } from '../../../components/FormField';
import { BottomSheetSelect } from '../../../components/BottomSheetSelect';
import { ConfirmDialog } from '../../../components/ConfirmDialog';
import type { Product, Category } from '@inventory/types';

export default function EditProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useLanguage();
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [form, setForm] = useState({
    sku: '',
    name: '',
    unit: '',
    categoryId: '',
    costPrice: '',
    salePrice: '',
    lowStockAt: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    Promise.all([
      api.get<Product>(`/api/products/${id}`),
      api.get<Category[]>('/api/categories'),
    ]).then(([prodRes, catRes]) => {
      const p = prodRes.data;
      setForm({
        sku: p.sku,
        name: p.name,
        unit: p.unit,
        categoryId: String(p.categoryId),
        costPrice: String(p.costPrice),
        salePrice: String(p.salePrice),
        lowStockAt: p.lowStockAt != null ? String(p.lowStockAt) : '',
      });
      setCategories(catRes.data);
    });
  }, [id]);

  function validate() {
    const e: Record<string, string> = {};
    if (!form.sku.trim()) e.sku = t('required');
    if (!form.name.trim()) e.name = t('required');
    if (!form.unit.trim()) e.unit = t('required');
    if (!form.categoryId) e.categoryId = t('required');
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    try {
      await api.put(`/api/products/${id}`, {
        sku: form.sku.trim(),
        name: form.name.trim(),
        unit: form.unit.trim(),
        categoryId: Number(form.categoryId),
        costPrice: Number(form.costPrice) || 0,
        salePrice: Number(form.salePrice) || 0,
        lowStockAt: form.lowStockAt ? Number(form.lowStockAt) : undefined,
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
      await api.delete(`/api/products/${id}`);
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
          label={t('labelSku')}
          value={form.sku}
          onChangeText={(v) => setForm((f) => ({ ...f, sku: v }))}
          error={errors.sku}
        />
        <FormField
          label={t('labelName')}
          value={form.name}
          onChangeText={(v) => setForm((f) => ({ ...f, name: v }))}
          error={errors.name}
        />
        <FormField
          label={t('labelUnit')}
          value={form.unit}
          onChangeText={(v) => setForm((f) => ({ ...f, unit: v }))}
          error={errors.unit}
        />

        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-1.5">
            {t('colCategory')}
          </Text>
          <BottomSheetSelect
            value={form.categoryId}
            onValueChange={(v) => setForm((f) => ({ ...f, categoryId: v }))}
            placeholder={t('colCategory')}
            options={categories.map((c) => ({
              label: c.name,
              value: String(c.id),
            }))}
          />
          {errors.categoryId ? (
            <Text className="text-red-500 text-xs mt-1">{errors.categoryId}</Text>
          ) : null}
        </View>

        <FormField
          label={t('labelCostPrice')}
          value={form.costPrice}
          onChangeText={(v) => setForm((f) => ({ ...f, costPrice: v }))}
          keyboardType="numeric"
        />
        <FormField
          label={t('labelSalePrice')}
          value={form.salePrice}
          onChangeText={(v) => setForm((f) => ({ ...f, salePrice: v }))}
          keyboardType="numeric"
        />
        <FormField
          label={`${t('labelLowStockAlert')} (${t('optional')})`}
          value={form.lowStockAt}
          onChangeText={(v) => setForm((f) => ({ ...f, lowStockAt: v }))}
          keyboardType="numeric"
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
          <Text className="text-red-500 font-semibold text-base">{t('deleteProduct')}</Text>
        </TouchableOpacity>
      </View>

      <ConfirmDialog
        visible={showDelete}
        title={t('deleteProduct')}
        message={t('deleteProductConfirm')}
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />
    </ScrollView>
  );
}

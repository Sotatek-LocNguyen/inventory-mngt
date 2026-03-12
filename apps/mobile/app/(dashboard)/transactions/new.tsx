import { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { api } from '../../../lib/api';
import { useLanguage } from '../../../lib/i18n';
import { FormField } from '../../../components/FormField';
import { BottomSheetSelect } from '../../../components/BottomSheetSelect';
import type { Product, Supplier } from '@inventory/types';

export default function NewTransactionScreen() {
  const { t } = useLanguage();
  const [saving, setSaving] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  const [type, setType] = useState('STOCK_IN');
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    Promise.all([
      api.get<Product[]>('/api/products'),
      api.get<Supplier[]>('/api/suppliers'),
    ]).then(([prodRes, suppRes]) => {
      setProducts(prodRes.data);
      setSuppliers(suppRes.data);
    });
  }, []);

  const selectedProduct = products.find((p) => String(p.id) === productId);

  function validate() {
    const e: Record<string, string> = {};
    if (!productId) e.productId = t('required');
    if (!quantity || Number(quantity) < 1) e.quantity = t('required');
    if (type === 'ADJUSTMENT' && !note.trim()) e.note = t('adjustmentNoteRequired');
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    try {
      await api.post('/api/transactions', {
        type,
        productId: Number(productId),
        quantity: Number(quantity),
        supplierId: supplierId ? Number(supplierId) : undefined,
        note: note.trim() || undefined,
      });
      router.back();
    } catch (err: any) {
      const msg = err.response?.data?.error;
      if (typeof msg === 'string' && msg.toLowerCase().includes('insufficient')) {
        setErrors((prev) => ({ ...prev, quantity: msg }));
      } else {
        Alert.alert(t('createTxFailed'));
      }
    } finally {
      setSaving(false);
    }
  }

  const typeOptions = [
    { label: t('txStockIn'), value: 'STOCK_IN' },
    { label: t('txStockOut'), value: 'STOCK_OUT' },
    { label: t('txAdjustment'), value: 'ADJUSTMENT' },
  ];

  const productOptions = products.map((p) => ({
    label: `${p.sku} — ${p.name} (${t('stockLabel')}: ${p.stockQty})`,
    value: String(p.id),
  }));

  const supplierOptions = [
    { label: t('supplierOptional'), value: '' },
    ...suppliers.map((s) => ({ label: s.name, value: String(s.id) })),
  ];

  return (
    <ScrollView className="flex-1 bg-gray-50" keyboardShouldPersistTaps="handled">
      <View className="p-4">
        {/* Type */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-1.5">
            {t('labelTxType')}
          </Text>
          <BottomSheetSelect
            value={type}
            onValueChange={(v) => {
              setType(v);
              if (v !== 'STOCK_IN') setSupplierId('');
            }}
            placeholder={t('labelTxType')}
            options={typeOptions}
          />
        </View>

        {/* Product */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-1.5">
            {t('labelProduct')}
          </Text>
          <BottomSheetSelect
            value={productId}
            onValueChange={setProductId}
            placeholder={t('labelProduct')}
            options={productOptions}
          />
          {errors.productId ? (
            <Text className="text-red-500 text-xs mt-1">{errors.productId}</Text>
          ) : null}
          {selectedProduct ? (
            <Text className="text-xs text-gray-500 mt-1">
              {t('currentStock')}: <Text className="font-bold">{selectedProduct.stockQty}</Text>
            </Text>
          ) : null}
        </View>

        {/* Quantity */}
        <FormField
          label={t('labelQty')}
          value={quantity}
          onChangeText={(v) => {
            setQuantity(v);
            setErrors((prev) => {
              const { quantity: _, ...rest } = prev;
              return rest;
            });
          }}
          keyboardType="numeric"
          error={errors.quantity}
        />

        {/* Supplier (only for STOCK_IN) */}
        {type === 'STOCK_IN' && (
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-1.5">
              {t('labelSupplier')}
            </Text>
            <BottomSheetSelect
              value={supplierId}
              onValueChange={setSupplierId}
              placeholder={t('supplierOptional')}
              options={supplierOptions}
            />
          </View>
        )}

        {/* Note */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-1.5">
            {t('labelNote')} {type === 'ADJUSTMENT' ? `(${t('required')})` : `(${t('optional')})`}
          </Text>
          <TextInput
            className={`border rounded-lg px-3 py-3 text-base text-gray-900 min-h-[80px] ${
              errors.note ? 'border-red-400' : 'border-gray-300'
            }`}
            value={note}
            onChangeText={(v) => {
              setNote(v);
              setErrors((prev) => {
                const { note: _, ...rest } = prev;
                return rest;
              });
            }}
            placeholder={type === 'ADJUSTMENT' ? t('noteRequired') : t('noteOptional')}
            multiline
            textAlignVertical="top"
          />
          {errors.note ? (
            <Text className="text-red-500 text-xs mt-1">{errors.note}</Text>
          ) : null}
        </View>

        <TouchableOpacity
          className={`rounded-lg py-3.5 items-center ${saving ? 'bg-blue-300' : 'bg-primary'}`}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-semibold text-base">{t('createTxBtn')}</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

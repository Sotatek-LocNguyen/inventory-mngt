import { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../../../lib/api';
import { useLanguage } from '../../../lib/i18n';
import { Badge } from '../../../components/Badge';
import { BottomSheetSelect } from '../../../components/BottomSheetSelect';
import { EmptyState } from '../../../components/EmptyState';
import type { Category } from '@inventory/types';

interface StockItem {
  id: number;
  sku: string;
  name: string;
  unit: string;
  stockQty: number;
  lowStockAt: number | null;
  isLowStock: boolean;
  category: Category | null;
}

export default function StockReportScreen() {
  const { t } = useLanguage();
  const [items, setItems] = useState<StockItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [lowOnly, setLowOnly] = useState(false);
  const [categoryId, setCategoryId] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (lowOnly) params.set('lowStockOnly', 'true');
      if (categoryId) params.set('categoryId', categoryId);
      const [stockRes, catRes] = await Promise.all([
        api.get<StockItem[]>(`/api/reports/stock?${params.toString()}`),
        api.get<Category[]>('/api/categories'),
      ]);
      setItems(stockRes.data);
      setCategories(catRes.data);
    } catch {
      // handled by interceptor
    }
  }, [lowOnly, categoryId]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  const totalCount = items.length;
  const lowCount = items.filter((i) => i.isLowStock && i.stockQty > 0).length;
  const outCount = items.filter((i) => i.stockQty === 0).length;

  function statusBadge(item: StockItem) {
    if (item.stockQty === 0) return <Badge label={t('stockOutStatus')} color="red" />;
    if (item.isLowStock) return <Badge label={t('stockLowStatus')} color="orange" />;
    return <Badge label={t('stockInStatus')} color="green" />;
  }

  const categoryOptions = [
    { label: t('filterAllCategories'), value: '' },
    ...categories.map((c) => ({ label: c.name, value: String(c.id) })),
  ];

  return (
    <View className="flex-1 bg-gray-50">
      {/* Summary cards */}
      <View className="flex-row px-4 pt-3 gap-3">
        <View className="flex-1 bg-white rounded-xl border border-gray-200 p-3 items-center">
          <Text className="text-xs text-gray-500">{t('stockTotal')}</Text>
          <Text className="text-xl font-bold text-gray-900 mt-1">{totalCount}</Text>
        </View>
        <View className="flex-1 bg-white rounded-xl border border-gray-200 p-3 items-center">
          <Text className="text-xs text-gray-500">{t('stockLowCount')}</Text>
          <Text className="text-xl font-bold text-orange-600 mt-1">{lowCount}</Text>
        </View>
        <View className="flex-1 bg-white rounded-xl border border-gray-200 p-3 items-center">
          <Text className="text-xs text-gray-500">{t('stockOutCount')}</Text>
          <Text className="text-xl font-bold text-red-600 mt-1">{outCount}</Text>
        </View>
      </View>

      {/* Filters */}
      <View className="px-4 pt-3 gap-3">
        <View className="flex-row items-center justify-between">
          <Text className="text-sm text-gray-700">{t('showLowOnly')}</Text>
          <Switch
            value={lowOnly}
            onValueChange={setLowOnly}
            trackColor={{ true: '#1677ff' }}
          />
        </View>
        <BottomSheetSelect
          value={categoryId}
          onValueChange={setCategoryId}
          placeholder={t('filterAllCategories')}
          options={categoryOptions}
        />
      </View>

      {/* Navigation to history */}
      <TouchableOpacity
        className="mx-4 mt-3 bg-white rounded-xl border border-gray-200 px-4 py-3 flex-row items-center justify-between"
        onPress={() => router.push('/(dashboard)/reports/history')}
      >
        <Text className="text-sm font-medium text-primary">{t('historyTitle')}</Text>
        <Text className="text-gray-400">→</Text>
      </TouchableOpacity>

      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        className="mt-2"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={items.length === 0 ? { flex: 1 } : { paddingBottom: 16 }}
        ListEmptyComponent={<EmptyState message={t('noStockItems')} />}
        renderItem={({ item }) => (
          <View className="bg-white mx-4 mt-3 rounded-xl border border-gray-200 p-4">
            <View className="flex-row items-start justify-between">
              <View className="flex-1 mr-3">
                <Text className="text-xs text-gray-400 font-mono">{item.sku}</Text>
                <Text className="text-base font-semibold text-gray-900 mt-0.5">
                  {item.name}
                </Text>
                <Text className="text-xs text-gray-500 mt-0.5">
                  {item.category?.name}
                </Text>
              </View>
              <View className="items-end">
                <Text
                  className={`text-lg font-bold ${
                    item.stockQty === 0
                      ? 'text-red-600'
                      : item.isLowStock
                      ? 'text-orange-600'
                      : 'text-green-600'
                  }`}
                >
                  {item.stockQty}
                </Text>
                {item.lowStockAt != null && (
                  <Text className="text-xs text-gray-400">
                    {t('colThreshold')}: {item.lowStockAt}
                  </Text>
                )}
                <View className="mt-1">{statusBadge(item)}</View>
              </View>
            </View>
          </View>
        )}
      />
    </View>
  );
}

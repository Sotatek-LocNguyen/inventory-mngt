import { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../../lib/api';
import { useLanguage } from '../../../lib/i18n';
import { Badge } from '../../../components/Badge';
import { EmptyState } from '../../../components/EmptyState';
import { BottomSheetSelect } from '../../../components/BottomSheetSelect';
import type { Transaction, Product, PaginatedResponse } from '@inventory/types';

const LIMIT = 30;

export default function TransactionsListScreen() {
  const { t } = useLanguage();
  const [data, setData] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const offsetRef = useRef(0);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Filters
  const [filterType, setFilterType] = useState('');
  const [filterProduct, setFilterProduct] = useState('');
  const [products, setProducts] = useState<Product[]>([]);

  function buildQuery(offset: number) {
    const params = new URLSearchParams();
    params.set('limit', String(LIMIT));
    params.set('offset', String(offset));
    if (filterType) params.set('type', filterType);
    if (filterProduct) params.set('productId', filterProduct);
    return params.toString();
  }

  const fetchInitial = useCallback(async () => {
    setLoading(true);
    try {
      const [txRes, prodRes] = await Promise.all([
        api.get<PaginatedResponse<Transaction>>(`/api/transactions?${buildQuery(0)}`),
        api.get<Product[]>('/api/products'),
      ]);
      setData(txRes.data.data);
      setTotal(txRes.data.total);
      offsetRef.current = LIMIT;
      setProducts(prodRes.data);
    } catch {
      // handled by interceptor
    } finally {
      setLoading(false);
    }
  }, [filterType, filterProduct]);

  useFocusEffect(
    useCallback(() => {
      fetchInitial();
    }, [fetchInitial])
  );

  async function loadMore() {
    if (loading || data.length >= total) return;
    setLoading(true);
    try {
      const res = await api.get<PaginatedResponse<Transaction>>(
        `/api/transactions?${buildQuery(offsetRef.current)}`
      );
      setData((prev) => [...prev, ...res.data.data]);
      setTotal(res.data.total);
      offsetRef.current += LIMIT;
    } catch {
      // handled
    } finally {
      setLoading(false);
    }
  }

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await api.get<PaginatedResponse<Transaction>>(
        `/api/transactions?${buildQuery(0)}`
      );
      setData(res.data.data);
      setTotal(res.data.total);
      offsetRef.current = LIMIT;
    } catch {
      // handled
    } finally {
      setRefreshing(false);
    }
  }, [filterType, filterProduct]);

  function txTypeColor(type: string): 'green' | 'red' | 'orange' {
    if (type === 'STOCK_IN') return 'green';
    if (type === 'STOCK_OUT') return 'red';
    return 'orange';
  }

  function txTypeLabel(type: string) {
    if (type === 'STOCK_IN') return t('txStockIn');
    if (type === 'STOCK_OUT') return t('txStockOut');
    return t('txAdjustment');
  }

  const typeOptions = [
    { label: t('filterAllTypes'), value: '' },
    { label: t('txStockIn'), value: 'STOCK_IN' },
    { label: t('txStockOut'), value: 'STOCK_OUT' },
    { label: t('txAdjustment'), value: 'ADJUSTMENT' },
  ];

  const productOptions = [
    { label: t('filterAllProducts'), value: '' },
    ...products.map((p) => ({ label: `${p.sku} — ${p.name}`, value: String(p.id) })),
  ];

  return (
    <View className="flex-1 bg-gray-50">
      {/* Filter toggle */}
      <TouchableOpacity
        className="flex-row items-center justify-between px-4 py-2.5 bg-white border-b border-gray-100"
        onPress={() => setShowFilters(!showFilters)}
      >
        <Text className="text-sm font-medium text-gray-700">{t('filterBtn')}</Text>
        <Ionicons
          name={showFilters ? 'chevron-up' : 'chevron-down'}
          size={18}
          color="#6b7280"
        />
      </TouchableOpacity>

      {showFilters && (
        <View className="bg-white px-4 py-3 border-b border-gray-100 gap-3">
          <BottomSheetSelect
            value={filterType}
            onValueChange={setFilterType}
            placeholder={t('filterAllTypes')}
            options={typeOptions}
          />
          <BottomSheetSelect
            value={filterProduct}
            onValueChange={setFilterProduct}
            placeholder={t('filterAllProducts')}
            options={productOptions}
          />
          <TouchableOpacity
            className="bg-primary rounded-lg py-2.5 items-center"
            onPress={fetchInitial}
          >
            <Text className="text-white text-sm font-medium">{t('apply')}</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={data}
        keyExtractor={(item) => String(item.id)}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        contentContainerStyle={data.length === 0 && !loading ? { flex: 1 } : undefined}
        ListEmptyComponent={
          loading ? null : <EmptyState message={t('noTx')} />
        }
        ListFooterComponent={
          loading && data.length > 0 ? (
            <View className="py-4">
              <ActivityIndicator color="#1677ff" />
            </View>
          ) : null
        }
        renderItem={({ item: tx }) => (
          <View className="bg-white mx-4 mt-3 rounded-xl border border-gray-200 p-4">
            <View className="flex-row items-start justify-between mb-1">
              <Badge label={txTypeLabel(tx.type)} color={txTypeColor(tx.type)} />
              <Text className="text-xs text-gray-400">
                {new Date(tx.createdAt).toLocaleString()}
              </Text>
            </View>
            <Text className="text-base font-medium text-gray-900 mt-1">
              {tx.product?.name ?? String(tx.productId)}
            </Text>
            <View className="flex-row items-center justify-between mt-1.5">
              <Text
                className={`text-lg font-bold ${
                  tx.type === 'STOCK_IN' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {tx.type === 'STOCK_IN' ? '+' : '-'}
                {tx.quantity}
              </Text>
              {tx.supplier ? (
                <Text className="text-xs text-gray-500">{tx.supplier.name}</Text>
              ) : null}
            </View>
            {tx.note ? (
              <Text className="text-xs text-gray-400 mt-1" numberOfLines={1}>
                {tx.note}
              </Text>
            ) : null}
          </View>
        )}
      />

      {/* FAB */}
      <TouchableOpacity
        className="absolute bottom-6 right-6 w-14 h-14 rounded-full bg-primary items-center justify-center shadow-lg"
        onPress={() => router.push('/(dashboard)/transactions/new')}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

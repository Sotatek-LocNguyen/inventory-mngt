import { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../../lib/api';
import { useLanguage } from '../../../lib/i18n';
import { Badge } from '../../../components/Badge';
import { EmptyState } from '../../../components/EmptyState';
import { BottomSheetSelect } from '../../../components/BottomSheetSelect';
import { DatePickerField } from '../../../components/DatePickerField';
import type { Transaction, Product, PaginatedResponse } from '@inventory/types';

const LIMIT = 30;

export default function HistoryReportScreen() {
  const { t } = useLanguage();
  const [data, setData] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const offsetRef = useRef(0);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(true);

  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);
  const [filterType, setFilterType] = useState('');
  const [filterProduct, setFilterProduct] = useState('');
  const [products, setProducts] = useState<Product[]>([]);

  function buildQuery(offset: number) {
    const params = new URLSearchParams();
    params.set('limit', String(LIMIT));
    params.set('offset', String(offset));
    if (fromDate) params.set('from', fromDate.toISOString());
    if (toDate) params.set('to', toDate.toISOString());
    if (filterType) params.set('type', filterType);
    if (filterProduct) params.set('productId', filterProduct);
    return params.toString();
  }

  function buildExportQuery() {
    const params = new URLSearchParams();
    if (fromDate) params.set('from', fromDate.toISOString());
    if (toDate) params.set('to', toDate.toISOString());
    if (filterType) params.set('type', filterType);
    if (filterProduct) params.set('productId', filterProduct);
    return params.toString();
  }

  const fetchInitial = useCallback(async () => {
    setLoading(true);
    try {
      const [histRes, prodRes] = await Promise.all([
        api.get<PaginatedResponse<Transaction>>(`/api/reports/history?${buildQuery(0)}`),
        api.get<Product[]>('/api/products'),
      ]);
      setData(histRes.data.data);
      setTotal(histRes.data.total);
      offsetRef.current = LIMIT;
      setProducts(prodRes.data);
    } catch {
      // handled
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate, filterType, filterProduct]);

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
        `/api/reports/history?${buildQuery(offsetRef.current)}`
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
        `/api/reports/history?${buildQuery(0)}`
      );
      setData(res.data.data);
      setTotal(res.data.total);
      offsetRef.current = LIMIT;
    } catch {
      // handled
    } finally {
      setRefreshing(false);
    }
  }, [fromDate, toDate, filterType, filterProduct]);

  function handleExport() {
    const baseUrl = process.env.EXPO_PUBLIC_API_URL;
    const q = buildExportQuery();
    Linking.openURL(`${baseUrl}/api/reports/history/export?${q}`);
  }

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
      {/* Filter header */}
      <View className="flex-row items-center justify-between px-4 py-2.5 bg-white border-b border-gray-100">
        <TouchableOpacity
          className="flex-row items-center"
          onPress={() => setShowFilters(!showFilters)}
        >
          <Text className="text-sm font-medium text-gray-700 mr-1">{t('filterBtn')}</Text>
          <Ionicons
            name={showFilters ? 'chevron-up' : 'chevron-down'}
            size={16}
            color="#6b7280"
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleExport} className="flex-row items-center">
          <Ionicons name="download-outline" size={16} color="#1677ff" />
          <Text className="text-sm font-medium text-primary ml-1">{t('exportCsv')}</Text>
        </TouchableOpacity>
      </View>

      {showFilters && (
        <View className="bg-white px-4 py-3 border-b border-gray-100 gap-3">
          <View className="flex-row gap-3">
            <View className="flex-1">
              <DatePickerField
                label={t('filterFrom')}
                value={fromDate}
                onChange={setFromDate}
              />
            </View>
            <View className="flex-1">
              <DatePickerField
                label={t('filterTo')}
                value={toDate}
                onChange={setToDate}
              />
            </View>
          </View>
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
        contentContainerStyle={data.length === 0 && !loading ? { flex: 1 } : { paddingBottom: 16 }}
        ListEmptyComponent={loading ? null : <EmptyState message={t('noHistory')} />}
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

      {/* Total count footer */}
      <View className="bg-white border-t border-gray-200 px-4 py-2">
        <Text className="text-xs text-gray-500 text-center">
          {data.length} / {total} {t('historyTx')}
        </Text>
      </View>
    </View>
  );
}

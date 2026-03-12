import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../../lib/api';
import { useLanguage } from '../../lib/i18n';
import type { Transaction, Supplier, PaginatedResponse } from '@inventory/types';

interface StockItem {
  id: number;
  sku: string;
  name: string;
  stockQty: number;
  lowStockAt: number | null;
  isLowStock: boolean;
}

export default function DashboardScreen() {
  const { t } = useLanguage();
  const [refreshing, setRefreshing] = useState(false);
  const [totalProducts, setTotalProducts] = useState<number | null>(null);
  const [lowStockItems, setLowStockItems] = useState<StockItem[]>([]);
  const [totalSuppliers, setTotalSuppliers] = useState<number | null>(null);
  const [todayCount, setTodayCount] = useState<number | null>(null);
  const [recentTx, setRecentTx] = useState<Transaction[]>([]);

  const fetchData = useCallback(async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    try {
      const [stockRes, lowRes, suppRes, todayRes, txRes] = await Promise.all([
        api.get<StockItem[]>('/api/reports/stock'),
        api.get<StockItem[]>('/api/reports/stock?lowStockOnly=true'),
        api.get<Supplier[]>('/api/suppliers'),
        api.get<{ total: number }>(`/api/reports/history?from=${today.toISOString()}&limit=1`),
        api.get<PaginatedResponse<Transaction>>('/api/transactions?limit=10'),
      ]);
      setTotalProducts(stockRes.data.length);
      setLowStockItems(lowRes.data);
      setTotalSuppliers(suppRes.data.length);
      setTodayCount(todayRes.data.total);
      setRecentTx(txRes.data.data);
    } catch {
      // handled by 401 interceptor
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  function txTypeLabel(type: string) {
    if (type === 'STOCK_IN') return t('txStockIn');
    if (type === 'STOCK_OUT') return t('txStockOut');
    if (type === 'ADJUSTMENT') return t('txAdjustment');
    return type;
  }

  const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
    STOCK_IN: { bg: 'bg-green-50', text: 'text-green-700' },
    STOCK_OUT: { bg: 'bg-red-50', text: 'text-red-700' },
    ADJUSTMENT: { bg: 'bg-orange-50', text: 'text-orange-700' },
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="px-4 pt-4 pb-2">
          <Text className="text-lg font-bold text-gray-900">{t('dashTitle')}</Text>
          <Text className="text-sm text-gray-500">{t('dashSubtitle')}</Text>
        </View>

        {/* 2x2 Stat Cards */}
        <View className="flex-row flex-wrap px-4 gap-3 mt-2">
          <View className="bg-white rounded-xl border border-gray-200 p-4 flex-1 min-w-[45%]">
            <Text className="text-xs font-medium text-gray-500 uppercase mb-2">
              {t('dashProducts')}
            </Text>
            <Text className="text-2xl font-bold text-gray-900">
              {totalProducts ?? '—'}
            </Text>
            <Text className="text-xs text-gray-400 mt-1">{t('dashProductsDesc')}</Text>
          </View>

          <View className="bg-white rounded-xl border border-gray-200 p-4 flex-1 min-w-[45%]">
            <Text className="text-xs font-medium text-gray-500 uppercase mb-2">
              {t('dashLowStock')}
            </Text>
            <Text className="text-2xl font-bold text-orange-600">
              {lowStockItems.length}
            </Text>
            <Text className="text-xs text-gray-400 mt-1">{t('dashLowStockDesc')}</Text>
          </View>

          <View className="bg-white rounded-xl border border-gray-200 p-4 flex-1 min-w-[45%]">
            <Text className="text-xs font-medium text-gray-500 uppercase mb-2">
              {t('dashSuppliers')}
            </Text>
            <Text className="text-2xl font-bold text-gray-900">
              {totalSuppliers ?? '—'}
            </Text>
            <Text className="text-xs text-gray-400 mt-1">{t('dashSuppliersDesc')}</Text>
          </View>

          <View className="bg-white rounded-xl border border-gray-200 p-4 flex-1 min-w-[45%]">
            <Text className="text-xs font-medium text-gray-500 uppercase mb-2">
              {t('dashToday')}
            </Text>
            <Text className="text-2xl font-bold text-gray-900">
              {todayCount ?? '—'}
            </Text>
            <Text className="text-xs text-gray-400 mt-1">{t('dashTodayDesc')}</Text>
          </View>
        </View>

        {/* Low Stock Alert */}
        {lowStockItems.length > 0 && (
          <View className="mx-4 mt-4 bg-orange-50 border border-orange-200 rounded-xl p-4">
            <Text className="text-sm font-semibold text-orange-800 mb-2">
              {t('dashLowStockAlert')}
            </Text>
            {lowStockItems.map((item) => (
              <View key={item.id} className="flex-row justify-between py-1">
                <Text className="text-sm text-gray-700">{item.name}</Text>
                <Text className="text-sm text-orange-700 font-medium">
                  {t('dashRemaining')} {item.stockQty} / {t('dashThreshold')}{' '}
                  {item.lowStockAt}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Recent Transactions */}
        <View className="mx-4 mt-4 mb-6 bg-white rounded-xl border border-gray-200">
          <View className="px-4 py-3 border-b border-gray-100">
            <Text className="text-sm font-semibold text-gray-900">
              {t('dashRecentTx')}
            </Text>
          </View>
          {recentTx.length === 0 ? (
            <View className="px-4 py-8">
              <Text className="text-center text-sm text-gray-400">
                {t('dashNoTx')}
              </Text>
            </View>
          ) : (
            <FlatList
              data={recentTx}
              scrollEnabled={false}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item: tx }) => {
                const colors = TYPE_COLORS[tx.type] ?? { bg: 'bg-gray-50', text: 'text-gray-700' };
                return (
                  <View className="flex-row items-center px-4 py-3 border-b border-gray-50">
                    <View className="flex-1">
                      <Text className="text-sm text-gray-800">
                        {tx.product?.name ?? String(tx.productId)}
                      </Text>
                      <Text className="text-xs text-gray-400 mt-0.5">
                        {new Date(tx.createdAt).toLocaleString()}
                      </Text>
                    </View>
                    <View className={`px-2 py-0.5 rounded ${colors.bg} mr-3`}>
                      <Text className={`text-xs font-medium ${colors.text}`}>
                        {txTypeLabel(tx.type)}
                      </Text>
                    </View>
                    <Text
                      className={`text-sm font-semibold ${
                        tx.type === 'STOCK_IN' ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {tx.type === 'STOCK_IN' ? '+' : '-'}
                      {tx.quantity}
                    </Text>
                  </View>
                );
              }}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

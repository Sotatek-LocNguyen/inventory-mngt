import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../../lib/api';
import { useLanguage } from '../../../lib/i18n';
import { Badge } from '../../../components/Badge';
import { EmptyState } from '../../../components/EmptyState';
import { ConfirmDialog } from '../../../components/ConfirmDialog';
import type { Product } from '@inventory/types';

export default function ProductsListScreen() {
  const { t } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      const { data } = await api.get<Product[]>('/api/products');
      setProducts(data);
    } catch {
      // handled by interceptor
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchProducts();
    }, [fetchProducts])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchProducts();
    setRefreshing(false);
  }, [fetchProducts]);

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await api.delete(`/api/products/${deleteTarget.id}`);
      setDeleteTarget(null);
      fetchProducts();
    } catch {
      Alert.alert(t('deleteFailed'));
      setDeleteTarget(null);
    }
  }

  function stockColor(product: Product) {
    if (product.stockQty === 0) return 'red' as const;
    if (product.lowStockAt && product.stockQty <= product.lowStockAt) return 'orange' as const;
    return 'green' as const;
  }

  function stockLabel(product: Product) {
    if (product.stockQty === 0) return t('stockOut');
    if (product.lowStockAt && product.stockQty <= product.lowStockAt) return t('stockLow');
    return null;
  }

  return (
    <View className="flex-1 bg-gray-50">
      <FlatList
        data={products}
        keyExtractor={(item) => String(item.id)}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={products.length === 0 ? { flex: 1 } : undefined}
        ListEmptyComponent={
          <EmptyState
            message={t('noProducts')}
            actionLabel={t('addProduct')}
            onAction={() => router.push('/(dashboard)/products/new')}
          />
        }
        renderItem={({ item }) => {
          const color = stockColor(item);
          const badge = stockLabel(item);
          return (
            <TouchableOpacity
              className="bg-white mx-4 mt-3 rounded-xl border border-gray-200 p-4"
              onPress={() => router.push(`/(dashboard)/products/${item.id}`)}
              onLongPress={() => setDeleteTarget(item)}
            >
              <View className="flex-row items-start justify-between">
                <View className="flex-1 mr-3">
                  <Text className="text-xs text-gray-400 font-mono">{item.sku}</Text>
                  <Text className="text-base font-semibold text-gray-900 mt-0.5">
                    {item.name}
                  </Text>
                  <Text className="text-xs text-gray-500 mt-1">
                    {item.category?.name}
                  </Text>
                </View>
                <View className="items-end">
                  <Text
                    className={`text-lg font-bold ${
                      color === 'green'
                        ? 'text-green-600'
                        : color === 'orange'
                        ? 'text-orange-600'
                        : 'text-red-600'
                    }`}
                  >
                    {item.stockQty}
                  </Text>
                  {badge && <Badge label={badge} color={color} />}
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />

      {/* FAB */}
      <TouchableOpacity
        className="absolute bottom-6 right-6 w-14 h-14 rounded-full bg-primary items-center justify-center shadow-lg"
        onPress={() => router.push('/(dashboard)/products/new')}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      <ConfirmDialog
        visible={!!deleteTarget}
        title={t('deleteProduct')}
        message={t('deleteProductConfirm')}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </View>
  );
}

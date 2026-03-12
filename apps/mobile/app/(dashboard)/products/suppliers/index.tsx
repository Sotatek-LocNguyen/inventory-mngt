import { useState, useCallback } from 'react';
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
import { api } from '../../../../lib/api';
import { useLanguage } from '../../../../lib/i18n';
import { EmptyState } from '../../../../components/EmptyState';
import { ConfirmDialog } from '../../../../components/ConfirmDialog';
import type { Supplier } from '@inventory/types';

export default function SuppliersListScreen() {
  const { t } = useLanguage();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Supplier | null>(null);

  const fetchSuppliers = useCallback(async () => {
    try {
      const { data } = await api.get<Supplier[]>('/api/suppliers');
      setSuppliers(data);
    } catch {
      // handled by interceptor
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchSuppliers();
    }, [fetchSuppliers])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchSuppliers();
    setRefreshing(false);
  }, [fetchSuppliers]);

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await api.delete(`/api/suppliers/${deleteTarget.id}`);
      setDeleteTarget(null);
      fetchSuppliers();
    } catch {
      Alert.alert(t('deleteFailed'));
      setDeleteTarget(null);
    }
  }

  return (
    <View className="flex-1 bg-gray-50">
      <FlatList
        data={suppliers}
        keyExtractor={(item) => String(item.id)}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={suppliers.length === 0 ? { flex: 1 } : undefined}
        ListEmptyComponent={
          <EmptyState
            message={t('noSuppliers')}
            actionLabel={t('addSupplier')}
            onAction={() => router.push('/(dashboard)/products/suppliers/new')}
          />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            className="bg-white mx-4 mt-3 rounded-xl border border-gray-200 px-4 py-3.5"
            onPress={() => router.push(`/(dashboard)/products/suppliers/${item.id}`)}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-1 mr-3">
                <Text className="text-base text-gray-900 font-medium">{item.name}</Text>
                {item.phone ? (
                  <Text className="text-xs text-gray-500 mt-0.5">{item.phone}</Text>
                ) : null}
                {item.email ? (
                  <Text className="text-xs text-gray-500 mt-0.5">{item.email}</Text>
                ) : null}
              </View>
              <View className="flex-row gap-4">
                <TouchableOpacity
                  onPress={() => router.push(`/(dashboard)/products/suppliers/${item.id}`)}
                >
                  <Ionicons name="pencil-outline" size={18} color="#1677ff" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setDeleteTarget(item)}>
                  <Ionicons name="trash-outline" size={18} color="#ef4444" />
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity
        className="absolute bottom-6 right-6 w-14 h-14 rounded-full bg-primary items-center justify-center shadow-lg"
        onPress={() => router.push('/(dashboard)/products/suppliers/new')}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      <ConfirmDialog
        visible={!!deleteTarget}
        title={t('deleteSupplier')}
        message={`${t('deleteSupplier')} "${deleteTarget?.name}"?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </View>
  );
}

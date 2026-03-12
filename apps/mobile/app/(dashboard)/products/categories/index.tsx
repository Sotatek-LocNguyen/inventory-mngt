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
import type { Category } from '@inventory/types';

export default function CategoriesListScreen() {
  const { t } = useLanguage();
  const [categories, setCategories] = useState<Category[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      const { data } = await api.get<Category[]>('/api/categories');
      setCategories(data);
    } catch {
      // handled by interceptor
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchCategories();
    }, [fetchCategories])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchCategories();
    setRefreshing(false);
  }, [fetchCategories]);

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await api.delete(`/api/categories/${deleteTarget.id}`);
      setDeleteTarget(null);
      fetchCategories();
    } catch {
      Alert.alert(t('deleteFailed'));
      setDeleteTarget(null);
    }
  }

  return (
    <View className="flex-1 bg-gray-50">
      <FlatList
        data={categories}
        keyExtractor={(item) => String(item.id)}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={categories.length === 0 ? { flex: 1 } : undefined}
        ListEmptyComponent={
          <EmptyState
            message={t('noCategories')}
            actionLabel={t('addCategory')}
            onAction={() => router.push('/(dashboard)/products/categories/new')}
          />
        }
        renderItem={({ item }) => (
          <View className="bg-white mx-4 mt-3 rounded-xl border border-gray-200 px-4 py-3.5 flex-row items-center justify-between">
            <Text className="text-base text-gray-900 font-medium flex-1">
              {item.name}
            </Text>
            <View className="flex-row gap-4">
              <TouchableOpacity
                onPress={() => router.push(`/(dashboard)/products/categories/${item.id}`)}
              >
                <Ionicons name="pencil-outline" size={18} color="#1677ff" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setDeleteTarget(item)}>
                <Ionicons name="trash-outline" size={18} color="#ef4444" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <TouchableOpacity
        className="absolute bottom-6 right-6 w-14 h-14 rounded-full bg-primary items-center justify-center shadow-lg"
        onPress={() => router.push('/(dashboard)/products/categories/new')}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      <ConfirmDialog
        visible={!!deleteTarget}
        title={t('deleteCategory')}
        message={`${t('deleteCategoryConfirm')} "${deleteTarget?.name}"?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </View>
  );
}

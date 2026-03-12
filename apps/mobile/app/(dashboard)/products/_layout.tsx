import { Stack, router } from 'expo-router';
import { TouchableOpacity, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../../lib/i18n';

export default function ProductsLayout() {
  const { t } = useLanguage();

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: t('productsTitle'),
          headerRight: () => (
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => router.push('/(dashboard)/products/categories/')}
              >
                <Text className="text-primary text-sm font-medium">
                  {t('navCategories')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.push('/(dashboard)/products/suppliers/')}
              >
                <Text className="text-primary text-sm font-medium">
                  {t('navSuppliers')}
                </Text>
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      <Stack.Screen name="new" options={{ title: t('addProduct') }} />
      <Stack.Screen name="[id]" options={{ title: t('editProduct') }} />
      <Stack.Screen
        name="categories/index"
        options={{ title: t('categoriesTitle') }}
      />
      <Stack.Screen
        name="categories/new"
        options={{ title: t('addCategory') }}
      />
      <Stack.Screen
        name="categories/[id]"
        options={{ title: t('editCategory') }}
      />
      <Stack.Screen
        name="suppliers/index"
        options={{ title: t('suppliersTitle') }}
      />
      <Stack.Screen
        name="suppliers/new"
        options={{ title: t('addSupplier') }}
      />
      <Stack.Screen
        name="suppliers/[id]"
        options={{ title: t('editSupplier') }}
      />
    </Stack>
  );
}

import { useState } from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage, Lang } from '../../lib/i18n';
import { BottomSheetSelect } from '../../components/BottomSheetSelect';
import { View } from 'react-native';

const LANG_OPTIONS = [
  { label: 'VI', value: 'vi' },
  { label: 'EN', value: 'en' },
  { label: 'KR', value: 'kr' },
];

export default function DashboardLayout() {
  const { t, lang, setLang } = useLanguage();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#1677ff',
        tabBarInactiveTintColor: '#9ca3af',
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('navOverview'),
          headerShown: true,
          headerTitle: t('appName'),
          headerRight: () => (
            <View className="mr-3 w-16">
              <BottomSheetSelect
                value={lang}
                onValueChange={(v) => setLang(v as Lang)}
                placeholder="Lang"
                options={LANG_OPTIONS}
              />
            </View>
          ),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          title: t('navProducts'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cube-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: t('navTransactions'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="document-text-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: t('navStock'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bar-chart-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

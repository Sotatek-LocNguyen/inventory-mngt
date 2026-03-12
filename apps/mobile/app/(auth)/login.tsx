import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import { api, TOKEN_KEY } from '../../lib/api';
import { useLanguage, Lang } from '../../lib/i18n';

const LANGS: { key: Lang; label: string }[] = [
  { key: 'vi', label: 'VI' },
  { key: 'en', label: 'EN' },
  { key: 'kr', label: 'KR' },
];

export default function LoginScreen() {
  const { t, lang, setLang } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin() {
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      await SecureStore.setItemAsync(TOKEN_KEY, data.token);
      router.replace('/(dashboard)/');
    } catch {
      setError(t('loginError'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerClassName="flex-1"
        keyboardShouldPersistTaps="handled"
      >
        {/* Language switcher */}
        <View className="flex-row justify-end gap-1 px-4 pt-14">
          {LANGS.map((l) => (
            <TouchableOpacity
              key={l.key}
              onPress={() => setLang(l.key)}
              className={`px-3 py-1.5 rounded-full ${
                lang === l.key ? 'bg-primary' : 'bg-gray-100'
              }`}
            >
              <Text
                className={`text-xs font-semibold ${
                  lang === l.key ? 'text-white' : 'text-gray-600'
                }`}
              >
                {l.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Brand panel */}
        <View className="bg-primary mx-4 mt-6 rounded-2xl p-6">
          <Text className="text-white text-xl font-bold mb-2">
            {t('loginBrandTitle')}
          </Text>
          <Text className="text-blue-100 text-sm leading-5">
            {t('loginBrandDesc')}
          </Text>
        </View>

        {/* Login form */}
        <View className="px-4 mt-8">
          <Text className="text-xl font-bold text-gray-900 mb-1">
            {t('loginTitle')}
          </Text>
          <Text className="text-sm text-gray-500 mb-6">
            {t('loginSubtitle')}
          </Text>

          <Text className="text-sm font-medium text-gray-700 mb-1.5">
            {t('loginEmail')}
          </Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-3 py-3 text-base text-gray-900 mb-4"
            placeholder="email@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={setEmail}
          />

          <Text className="text-sm font-medium text-gray-700 mb-1.5">
            {t('loginPassword')}
          </Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-3 py-3 text-base text-gray-900 mb-4"
            placeholder="••••••"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          {error ? (
            <Text className="text-red-500 text-sm mb-3">{error}</Text>
          ) : null}

          <TouchableOpacity
            className={`rounded-lg py-3.5 items-center ${
              loading ? 'bg-blue-300' : 'bg-primary'
            }`}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-semibold text-base">
                {t('loginButton')}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

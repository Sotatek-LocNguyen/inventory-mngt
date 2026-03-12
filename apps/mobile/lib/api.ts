import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';

const TOKEN_KEY = 'auth_token';

export const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 10000,
});

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401) {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      router.replace('/(auth)/login');
    }
    return Promise.reject(err);
  }
);

export { TOKEN_KEY };

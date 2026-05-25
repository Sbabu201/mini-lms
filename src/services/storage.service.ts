import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Secure Storage (for sensitive data like tokens) ─────────────────

export const SecureStorage = {
  async get(key: string): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },

  async set(key: string, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch {
      // Silently fail — would report to error tracking in production
    }
  },

  async remove(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch {
      // Silently fail — would report to error tracking in production
    }
  },
};

// ─── App Storage (for non-sensitive app data) ────────────────────────

export const AppStorage = {
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await AsyncStorage.getItem(key);
      return value ? (JSON.parse(value) as T) : null;
    } catch {
      return null;
    }
  },

  async set<T>(key: string, value: T): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Silently fail — would report to error tracking in production
    }
  },

  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch {
      // Silently fail — would report to error tracking in production
    }
  },

  async multiGet<T>(keys: string[]): Promise<Map<string, T | null>> {
    try {
      const result = new Map<string, T | null>();
      const values = await Promise.all(keys.map((key) => AsyncStorage.getItem(key)));
      keys.forEach((key, index) => {
        const value = values[index];
        result.set(key, value ? (JSON.parse(value) as T) : null);
      });
      return result;
    } catch {
      return new Map();
    }
  },
};

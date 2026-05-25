import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { AppStorage } from '../services/storage.service';
import { STORAGE_KEYS } from '../utils/constants';

// ─── Types ───────────────────────────────────────────────────────────

interface AppPreferences {
  theme: 'light' | 'dark' | 'system';
  notificationsEnabled: boolean;
}

interface AppContextValue {
  isConnected: boolean;
  connectionType: string | null;
  preferences: AppPreferences;
  updatePreferences: (updates: Partial<AppPreferences>) => void;
}

const defaultPreferences: AppPreferences = {
  theme: 'dark',
  notificationsEnabled: true,
};

// ─── Context ─────────────────────────────────────────────────────────

const AppContext = createContext<AppContextValue | null>(null);

// ─── Provider ────────────────────────────────────────────────────────

export function AppProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(true);
  const [connectionType, setConnectionType] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<AppPreferences>(defaultPreferences);

  // Monitor network status
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      setIsConnected(state.isConnected ?? true);
      setConnectionType(state.type);
    });
    return () => unsubscribe();
  }, []);

  // Hydrate preferences from storage
  useEffect(() => {
    const hydrate = async () => {
      const stored = await AppStorage.get<AppPreferences>(STORAGE_KEYS.PREFERENCES);
      if (stored) setPreferences(stored);
    };
    hydrate();
  }, []);

  const updatePreferences = useCallback(
    (updates: Partial<AppPreferences>) => {
      setPreferences((prev) => {
        const next = { ...prev, ...updates };
        AppStorage.set(STORAGE_KEYS.PREFERENCES, next);
        return next;
      });
    },
    []
  );

  const value: AppContextValue = {
    isConnected,
    connectionType,
    preferences,
    updatePreferences,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// ─── Hook ────────────────────────────────────────────────────────────

export function useApp(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

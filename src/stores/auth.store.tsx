import React, { createContext, useContext, useReducer, useEffect, useCallback, ReactNode } from 'react';
import { AuthState, AuthAction, User, LoginRequest, RegisterRequest } from '../types/auth.types';
import { authService } from '../services/auth.service';
import { SecureStorage } from '../services/storage.service';
import { STORAGE_KEYS } from '../utils/constants';
import { getErrorMessage } from '../services/api';

// ─── Initial State ───────────────────────────────────────────────────

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true, // Start as true to check stored tokens
  error: null,
};

// ─── Reducer ─────────────────────────────────────────────────────────

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, isLoading: true, error: null };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
        error: null,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        error: action.payload,
      };
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'LOGOUT':
      return {
        ...initialState,
        isLoading: false,
      };
    case 'REFRESH_TOKEN':
      return {
        ...state,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
      };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
}

// ─── Context ─────────────────────────────────────────────────────────

interface AuthContextValue {
  state: AuthState;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  updateAvatar: (uri: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Auto-login: Check for stored tokens on mount
  useEffect(() => {
    const tryAutoLogin = async () => {
      try {
        const accessToken = await SecureStorage.get(STORAGE_KEYS.ACCESS_TOKEN);
        const refreshToken = await SecureStorage.get(STORAGE_KEYS.REFRESH_TOKEN);

        if (!accessToken || !refreshToken) {
          dispatch({ type: 'AUTH_FAILURE', payload: '' });
          return;
        }

        // Validate token by fetching current user
        const user = await authService.getCurrentUser();
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { user, accessToken, refreshToken },
        });
      } catch {
        // Token invalid or expired — clear and show login
        await SecureStorage.remove(STORAGE_KEYS.ACCESS_TOKEN);
        await SecureStorage.remove(STORAGE_KEYS.REFRESH_TOKEN);
        dispatch({ type: 'AUTH_FAILURE', payload: '' });
      }
    };

    tryAutoLogin();
  }, []);

  const login = useCallback(async (data: LoginRequest) => {
    dispatch({ type: 'AUTH_START' });
    try {
      const result = await authService.login(data);
      await SecureStorage.set(STORAGE_KEYS.ACCESS_TOKEN, result.accessToken);
      await SecureStorage.set(STORAGE_KEYS.REFRESH_TOKEN, result.refreshToken);
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: result.user,
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
        },
      });
    } catch (error) {
      dispatch({ type: 'AUTH_FAILURE', payload: getErrorMessage(error) });
      throw error;
    }
  }, []);

  const register = useCallback(async (data: RegisterRequest) => {
    dispatch({ type: 'AUTH_START' });
    try {
      const result = await authService.register(data);
      await SecureStorage.set(STORAGE_KEYS.ACCESS_TOKEN, result.accessToken);
      await SecureStorage.set(STORAGE_KEYS.REFRESH_TOKEN, result.refreshToken);
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: result.user,
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
        },
      });
    } catch (error) {
      dispatch({ type: 'AUTH_FAILURE', payload: getErrorMessage(error) });
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Ignore logout API errors — clear locally anyway
    }
    await SecureStorage.remove(STORAGE_KEYS.ACCESS_TOKEN);
    await SecureStorage.remove(STORAGE_KEYS.REFRESH_TOKEN);
    dispatch({ type: 'LOGOUT' });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const updateAvatar = useCallback(async (uri: string) => {
    try {
      const updatedUser = await authService.updateAvatar(uri);
      dispatch({ type: 'SET_USER', payload: updatedUser });
    } catch (error) {
      throw error;
    }
  }, []);

  const value: AuthContextValue = {
    state,
    login,
    register,
    logout,
    clearError,
    updateAvatar,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─── Hook ────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

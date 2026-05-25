import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL, APP_CONFIG } from '../utils/constants';
import { SecureStorage } from './storage.service';
import { STORAGE_KEYS } from '../utils/constants';
import { delay } from '../utils/helpers';

// Custom type for config with retry count
interface RetryConfig extends InternalAxiosRequestConfig {
  _retryCount?: number;
}

/**
 * Creates and configures the Axios instance with:
 * - Auth token injection
 * - Automatic token refresh on 401
 * - Exponential backoff retry for 5xx errors
 * - Request timeout
 */
function createApiClient(): AxiosInstance {
  const client = axios.create({
    baseURL: API_BASE_URL,
    timeout: APP_CONFIG.API_TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // ── Request Interceptor: Attach auth token ──
  client.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      const token = await SecureStorage.get(STORAGE_KEYS.ACCESS_TOKEN);
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error: AxiosError) => Promise.reject(error)
  );

  // ── Response Interceptor: Handle errors, retry, token refresh ──
  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const config = error.config as RetryConfig | undefined;
      if (!config) return Promise.reject(error);

      // Handle 401: Attempt token refresh
      if (error.response?.status === 401 && !config._retryCount) {
        try {
          const refreshToken = await SecureStorage.get(STORAGE_KEYS.REFRESH_TOKEN);
          if (refreshToken) {
            const refreshResponse = await axios.post(`${API_BASE_URL}/users/refresh-token`, {
              refreshToken,
            });

            const { accessToken, refreshToken: newRefreshToken } = refreshResponse.data.data;
            await SecureStorage.set(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
            await SecureStorage.set(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);

            config.headers.Authorization = `Bearer ${accessToken}`;
            config._retryCount = 1;
            return client(config);
          }
        } catch {
          // Refresh failed — clear tokens; user needs to re-login
          await SecureStorage.remove(STORAGE_KEYS.ACCESS_TOKEN);
          await SecureStorage.remove(STORAGE_KEYS.REFRESH_TOKEN);
          return Promise.reject(error);
        }
      }

      // Handle 5xx: Retry with exponential backoff
      const retryCount = config._retryCount ?? 0;
      if (
        error.response &&
        error.response.status >= 500 &&
        retryCount < APP_CONFIG.MAX_RETRIES
      ) {
        config._retryCount = retryCount + 1;
        const backoff = APP_CONFIG.RETRY_DELAY * Math.pow(2, retryCount);
        await delay(backoff);
        return client(config);
      }

      // Handle timeout
      if (error.code === 'ECONNABORTED') {
        return Promise.reject(new Error('Request timed out. Please check your connection.'));
      }

      // Handle network errors
      if (!error.response) {
        return Promise.reject(new Error('Network error. Please check your internet connection.'));
      }

      return Promise.reject(error);
    }
  );

  return client;
}

export const apiClient = createApiClient();

/**
 * Extracts a user-friendly error message from an Axios error.
 */
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    if (data?.message) return data.message;
    if (error.response?.status === 401) return 'Session expired. Please login again.';
    if (error.response?.status === 404) return 'Resource not found.';
    if (error.response?.status === 422) return 'Invalid data provided.';
    if (error.response && error.response.status >= 500) return 'Server error. Please try again later.';
    return error.message;
  }
  if (error instanceof Error) return error.message;
  return 'An unexpected error occurred.';
}

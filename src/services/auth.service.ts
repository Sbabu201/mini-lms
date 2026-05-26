import { Platform } from 'react-native';
import { apiClient } from './api';
import { User, AuthTokens, LoginRequest, RegisterRequest } from '../types/auth.types';
import { ApiResponse } from '../types/api.types';

interface LoginResponseData {
  user: User;
  accessToken: string;
  refreshToken: string;
}

interface RegisterResponseData {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export const authService = {
  async register(data: RegisterRequest): Promise<LoginResponseData> {
    const response = await apiClient.post<ApiResponse<RegisterResponseData>>(
      '/users/register',
      data
    );
    return response.data.data;
  },

  async login(data: LoginRequest): Promise<LoginResponseData> {
    const response = await apiClient.post<ApiResponse<LoginResponseData>>(
      '/users/login',
      data
    );
    return response.data.data;
  },

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>('/users/current-user');
    return response.data.data;
  },

  async refreshToken(token: string): Promise<AuthTokens> {
    const response = await apiClient.post<ApiResponse<AuthTokens>>(
      '/users/refresh-token',
      { refreshToken: token }
    );
    return response.data.data;
  },

  async logout(): Promise<void> {
    await apiClient.post('/users/logout');
  },

  async updateAvatar(uri: string): Promise<User> {
    const formData = new FormData();
    const filename = uri.split('/').pop() ?? 'avatar.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const ext = match ? match[1].toLowerCase() : 'jpeg';
    const type = `image/${ext === 'jpg' ? 'jpeg' : ext}`;

    // On Android, content:// URIs need file:// conversion
    const fileUri = Platform.OS === 'android' && !uri.startsWith('file://')
      ? uri
      : uri;

    // React Native FormData accepts { uri, name, type } objects directly
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    formData.append('avatar', {
      uri: fileUri,
      name: filename,
      type,
    } as any);

    const response = await apiClient.patch<ApiResponse<User>>(
      '/users/avatar',
      formData,
      {
        headers: {
          // Let Axios auto-set Content-Type with correct multipart boundary
          'Content-Type': undefined as unknown as string,
        },
        timeout: 30000, // 30s timeout for file uploads
      }
    );
    return response.data.data;
  },
};

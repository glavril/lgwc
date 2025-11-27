import api from './client';

export interface User {
  id: string;
  username: string;
  email: string;
  display_name: string;
  first_name?: string;
  last_name?: string;
  bio?: string;
  avatar_url?: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  display_name: string;
  first_name?: string;
  last_name?: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export const authApi = {
  // 登录
  login: async (credentials: LoginData): Promise<TokenResponse> => {
    const formData = new FormData();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);
    
    const { data } = await api.post<TokenResponse>('/auth/login', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  // 注册
  register: async (userData: RegisterData): Promise<User> => {
    const { data } = await api.post<User>('/auth/register', userData);
    return data;
  },

  // 获取当前用户信息
  getCurrentUser: async (): Promise<User> => {
    const { data } = await api.get<User>('/users/me');
    return data;
  },

  // 更新当前用户
  updateCurrentUser: async (userData: Partial<User>): Promise<User> => {
    const { data } = await api.put<User>('/users/me', userData);
    return data;
  },
};

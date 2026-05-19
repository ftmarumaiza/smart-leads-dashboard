import apiClient from './client';
import { ApiResponse, AuthResponse } from '../types';

export const authApi = {
  register: async (data: {
    name: string;
    email: string;
    password: string;
    role?: string;
  }): Promise<ApiResponse<AuthResponse>> => {
    const res = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', data);
    return res.data;
  },

  login: async (data: {
    email: string;
    password: string;
  }): Promise<ApiResponse<AuthResponse>> => {
    const res = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', data);
    return res.data;
  },

  getMe: async (): Promise<ApiResponse<AuthResponse['user']>> => {
    const res = await apiClient.get<ApiResponse<AuthResponse['user']>>('/auth/me');
    return res.data;
  },
};

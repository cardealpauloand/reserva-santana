import { apiFetch } from '@/lib/api';
import type { User, LoginResponse, RegisterResponse } from '@/types/auth';

const AUTH_TOKEN_KEY = 'auth_token';

export const authService = {
  
  async register(email: string, password: string, name: string): Promise<LoginResponse> {
    const response = await apiFetch<LoginResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });

    
    this.setToken(response.token);

    return response;
  },

  
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await apiFetch<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    
    this.setToken(response.token);

    return response;
  },

  
  async logout(): Promise<void> {
    try {
      await apiFetch<{ message: string }>('/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      
      this.clearToken();
    }
  },

  
  async getUser(): Promise<User> {
    return await apiFetch<User>('/auth/user', {
      method: 'GET',
    });
  },

  
  getToken(): string | null {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  },

  
  setToken(token: string): void {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  },

  
  clearToken(): void {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  },
};

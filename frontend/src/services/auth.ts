import { apiFetch } from '@/lib/api';
import type { User, LoginResponse, RegisterResponse } from '@/types/auth';

const AUTH_TOKEN_KEY = 'auth_token';

export const authService = {
  /**
   * Register a new user
   */
  async register(email: string, password: string, name: string): Promise<LoginResponse> {
    const response = await apiFetch<LoginResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });

    // Save token to localStorage
    this.setToken(response.token);

    return response;
  },

  /**
   * Login with email and password
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await apiFetch<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    // Save token to localStorage
    this.setToken(response.token);

    return response;
  },

  /**
   * Logout the current user
   */
  async logout(): Promise<void> {
    try {
      await apiFetch<{ message: string }>('/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear token even if API call fails
      this.clearToken();
    }
  },

  /**
   * Get the current authenticated user
   */
  async getUser(): Promise<User> {
    return await apiFetch<User>('/auth/user', {
      method: 'GET',
    });
  },

  /**
   * Get the auth token from localStorage
   */
  getToken(): string | null {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  },

  /**
   * Save the auth token to localStorage
   */
  setToken(token: string): void {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  },

  /**
   * Clear the auth token from localStorage
   */
  clearToken(): void {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  },
};

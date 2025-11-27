import { apiFetch } from '@/lib/api';
import type { Profile } from '@/types/auth';

export interface UpdateProfileData {
  full_name: string;
  phone: string;
}

export const profileService = {
  
  async getProfile(): Promise<Profile> {
    return await apiFetch<Profile>('/profile', {
      method: 'GET',
    });
  },

  
  async updateProfile(data: UpdateProfileData): Promise<Profile> {
    return await apiFetch<Profile>('/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

import { apiFetch } from '@/lib/api';
import type { Address, CreateAddressData } from '@/types/address';

export const addressesService = {
  
  async getAddresses(): Promise<Address[]> {
    return await apiFetch<Address[]>('/addresses', {
      method: 'GET',
    });
  },

  
  async createAddress(data: CreateAddressData): Promise<Address> {
    return await apiFetch<Address>('/addresses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  
  async deleteAddress(id: string): Promise<{ message: string }> {
    return await apiFetch<{ message: string }>(`/addresses/${id}`, {
      method: 'DELETE',
    });
  },
};

import { apiFetch } from '@/lib/api';
import type { Address, CreateAddressData } from '@/types/address';

export const addressesService = {
  /**
   * Get all addresses for the current user
   */
  async getAddresses(): Promise<Address[]> {
    return await apiFetch<Address[]>('/addresses', {
      method: 'GET',
    });
  },

  /**
   * Create a new address
   */
  async createAddress(data: CreateAddressData): Promise<Address> {
    return await apiFetch<Address>('/addresses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete an address
   */
  async deleteAddress(id: number): Promise<{ message: string }> {
    return await apiFetch<{ message: string }>(`/addresses/${id}`, {
      method: 'DELETE',
    });
  },
};

import { apiFetch } from '@/lib/api';
import type { Order, CreateOrderData } from '@/types/order';

export const ordersService = {
  
  async getOrders(): Promise<Order[]> {
    return await apiFetch<Order[]>('/orders', {
      method: 'GET',
    });
  },

  
  async createOrder(data: CreateOrderData): Promise<Order> {
    return await apiFetch<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

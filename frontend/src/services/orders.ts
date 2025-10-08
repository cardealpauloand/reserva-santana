import { apiFetch } from '@/lib/api';
import type { Order, CreateOrderData } from '@/types/order';

export const ordersService = {
  /**
   * Get all orders for the current user
   */
  async getOrders(): Promise<Order[]> {
    return await apiFetch<Order[]>('/orders', {
      method: 'GET',
    });
  },

  /**
   * Create a new order
   */
  async createOrder(data: CreateOrderData): Promise<Order> {
    return await apiFetch<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

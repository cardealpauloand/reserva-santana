import type { Product } from "./product";

export interface CartProductItem extends Product {
  quantity: number;
}

export interface CartSyncItem {
  productId: number;
  quantity: number;
}

export interface CartData {
  id: number;
  currency: string;
  items: CartProductItem[];
  updatedAt: string | null;
}

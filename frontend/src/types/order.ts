export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  price_at_purchase: number;
  created_at?: string;
}

export interface ShippingAddress {
  name: string;
  email?: string;
  phone?: string;
  zip_code: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
}

export interface Order {
  id: number;
  user_id: number;
  total: number;
  status: string;
  shipping_address: ShippingAddress;
  created_at: string;
  updated_at: string;
  orderItems?: OrderItem[];
}

export interface CreateOrderData {
  shipping_address: ShippingAddress;
  items: Array<{
    product_id: number;
    product_name: string;
    quantity: number;
    price_at_purchase: number;
  }>;
}

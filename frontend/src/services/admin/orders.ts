import { apiFetch } from "@/lib/api";
import type { Order, OrderItem } from "@/types/order";

export const ADMIN_ORDER_STATUS_OPTIONS = [
  { value: "pending", label: "Pendente" },
  { value: "pending_payment", label: "Pagamento pendente" },
  { value: "paid", label: "Pago" },
  { value: "processing", label: "Em processamento" },
  { value: "picking", label: "Separando" },
  { value: "shipped", label: "Enviado" },
  { value: "delivered", label: "Entregue" },
  { value: "canceled", label: "Cancelado" },
  { value: "refunded", label: "Reembolsado" },
] as const;

export const ADMIN_ORDER_STATUS_META: Record<
  string,
  {
    label: string;
    badgeVariant: "default" | "secondary" | "destructive" | "outline";
  }
> = {
  pending: { label: "Pendente", badgeVariant: "secondary" },
  pending_payment: { label: "Pagamento pendente", badgeVariant: "secondary" },
  paid: { label: "Pago", badgeVariant: "default" },
  processing: { label: "Em processamento", badgeVariant: "default" },
  picking: { label: "Separando", badgeVariant: "outline" },
  shipped: { label: "Enviado", badgeVariant: "outline" },
  delivered: { label: "Entregue", badgeVariant: "default" },
  canceled: { label: "Cancelado", badgeVariant: "destructive" },
  cancelled: { label: "Cancelado", badgeVariant: "destructive" },
  refunded: { label: "Reembolsado", badgeVariant: "secondary" },
};

export type ShippingAddress = {
  name: string;
  street: string;
  number: string;
  complement?: string | null;
  neighborhood: string;
  city: string;
  state: string;
  zip_code: string;
};

export type AdminOrderItem = OrderItem;

export type AdminOrder = {
  id: number;
  userId: number;
  total: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  shippingAddress: ShippingAddress | null;
  items: AdminOrderItem[];
};

function mapOrder(order: Order): AdminOrder {
  return {
    id: order.id,
    userId: order.user_id,
    total: order.total,
    status: order.status,
    createdAt: order.created_at,
    updatedAt: order.updated_at,
    shippingAddress: order.shipping_address,
    items: order.orderItems || [],
  };
}

export async function listAdminOrders(): Promise<AdminOrder[]> {
  const orders = await apiFetch<Order[]>('/admin/orders', {
    method: 'GET',
  });

  return orders.map(mapOrder);
}

export async function updateAdminOrderStatus(
  orderId: number,
  status: string
): Promise<AdminOrder> {
  const order = await apiFetch<Order>(`/admin/orders/${orderId}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });

  return mapOrder(order);
}

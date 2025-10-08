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
  cancelled: { label: "Cancelado", badgeVariant: "destructive" }, // compat
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
  shipping?: {
    service_code: string;
    service_name: string;
    price: number;
    deadline_days: number;
  } | null;
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

// -- Helpers ---------------------------------------------------------------

function mapShippingAddress(
  record: any | null | undefined
): ShippingAddress | null {
  if (!record) return null;

  return {
    name: String(record.name ?? ""),
    street: String(record.street ?? ""),
    number: String(record.number ?? ""),
    complement: (record.complement as string | null | undefined) ?? null,
    neighborhood: String(record.neighborhood ?? ""),
    city: String(record.city ?? ""),
    state: String(record.state ?? ""),
    zip_code: String(record.zip_code ?? ""),
    shipping: record.shipping
      ? {
          service_code: String(record.shipping?.service_code ?? ""),
          service_name: String(record.shipping?.service_name ?? ""),
          price: Number(record.shipping?.price ?? 0),
          deadline_days: Number(record.shipping?.deadline_days ?? 0),
        }
      : null,
  };
}

function mapOrder(order: Order & any): AdminOrder {
  // Aceita tanto snake_case quanto camelCase vindos da API
  return {
    id: Number(order.id),
    userId: Number(order.user_id ?? order.userId),
    total: Number(order.total ?? 0),
    status: String(order.status ?? ""),
    createdAt: String(order.created_at ?? order.createdAt ?? ""),
    updatedAt: String(order.updated_at ?? order.updatedAt ?? ""),
    shippingAddress: mapShippingAddress(
      order.shipping_address ?? order.shippingAddress
    ),
    items: (order.order_items ?? order.orderItems ?? []) as AdminOrderItem[],
  };
}

// -- API -------------------------------------------------------------------

export async function listAdminOrders(): Promise<AdminOrder[]> {
  const orders = await apiFetch<Order[]>("/admin/orders", {
    method: "GET",
  });

  return (orders ?? []).map(mapOrder);
}

export async function updateAdminOrderStatus(
  orderId: number,
  status: string
): Promise<AdminOrder> {
  const order = await apiFetch<Order>(`/admin/orders/${orderId}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
    headers: { "Content-Type": "application/json" },
  });

  return mapOrder(order);
}

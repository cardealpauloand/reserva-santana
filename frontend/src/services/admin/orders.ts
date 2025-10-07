import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

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

export type AdminOrderItem = Tables<"order_items">;

export type AdminOrder = {
  id: string;
  userId: string;
  total: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  shippingAddress: ShippingAddress | null;
  items: AdminOrderItem[];
};

type OrderRow = Tables<"orders"> & {
  order_items?: AdminOrderItem[] | null;
};

function mapShippingAddress(
  address: OrderRow["shipping_address"]
): ShippingAddress | null {
  if (!address || typeof address !== "object") {
    return null;
  }

  const record = address as Record<string, unknown>;

  return {
    name: String(record.name ?? ""),
    street: String(record.street ?? ""),
    number: String(record.number ?? ""),
    complement: (record.complement as string | null | undefined) ?? null,
    neighborhood: String(record.neighborhood ?? ""),
    city: String(record.city ?? ""),
    state: String(record.state ?? ""),
    zip_code: String(record.zip_code ?? ""),
  } satisfies ShippingAddress;
}

function mapOrder(row: OrderRow): AdminOrder {
  return {
    id: row.id,
    userId: row.user_id,
    total: Number(row.total ?? 0),
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    shippingAddress: mapShippingAddress(row.shipping_address),
    items: row.order_items ?? [],
  } satisfies AdminOrder;
}

export async function listAdminOrders(): Promise<AdminOrder[]> {
  const { data, error } = await supabase
    .from("orders")
    .select(
      `id, user_id, total, status, created_at, updated_at, shipping_address, order_items (id, order_id, product_id, product_name, quantity, price_at_purchase, created_at)`
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapOrder);
}

export async function updateAdminOrderStatus(
  orderId: string,
  status: string
): Promise<AdminOrder> {
  const { data, error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId)
    .select(
      `id, user_id, total, status, created_at, updated_at, shipping_address, order_items (id, order_id, product_id, product_name, quantity, price_at_purchase, created_at)`
    )
    .single();

  if (error) {
    throw error;
  }

  return mapOrder(data as OrderRow);
}

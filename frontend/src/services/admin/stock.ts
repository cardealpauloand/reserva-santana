import { apiFetch } from "@/lib/api";

type ApiListResponse<T> = {
  data: T[];
};

type ApiResourceResponse<T> = {
  data: T;
};

type ApiStockProduct = {
  id: number;
  name: string;
  type: string | null;
  price: number | null;
  stock_quantity: number;
};

type ApiStockMovement = {
  id: number;
  product_id: number;
  quantity: number;
  movement_type: string;
  reason: string | null;
  current_quantity: number | null;
  created_at: string;
  product?: {
    id: number;
    name: string;
  } | null;
};

export type StockProduct = {
  id: number;
  name: string;
  type: string | null;
  price: number;
  stockQuantity: number;
};

export type StockMovement = {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  movementType: "entrada" | "saida" | "ajuste";
  reason: string | null;
  currentQuantity: number | null;
  createdAt: string;
};

export type CreateStockMovementPayload = {
  productId: number;
  quantity: number;
  movementType: "entrada" | "saida" | "ajuste";
  reason?: string | null;
};

function mapProduct(apiProduct: ApiStockProduct): StockProduct {
  return {
    id: apiProduct.id,
    name: apiProduct.name,
    type: apiProduct.type,
    price: Number(apiProduct.price ?? 0),
    stockQuantity: Number(apiProduct.stock_quantity ?? 0),
  } satisfies StockProduct;
}

function mapMovement(apiMovement: ApiStockMovement): StockMovement {
  return {
    id: apiMovement.id,
    productId: apiMovement.product_id,
    productName: apiMovement.product?.name ?? "Produto removido",
    quantity: apiMovement.quantity,
    movementType: apiMovement.movement_type as StockMovement["movementType"],
    reason: apiMovement.reason,
    currentQuantity: apiMovement.current_quantity,
    createdAt: apiMovement.created_at,
  } satisfies StockMovement;
}

export async function listStockProducts(): Promise<StockProduct[]> {
  const response = await apiFetch<ApiListResponse<ApiStockProduct>>("admin/stock/products");
  return response.data.map(mapProduct);
}

export async function listStockMovements(limit = 20): Promise<StockMovement[]> {
  const response = await apiFetch<ApiListResponse<ApiStockMovement>>(
    `admin/stock/movements?limit=${encodeURIComponent(limit)}`
  );

  return response.data.map(mapMovement);
}

export async function createStockMovement(payload: CreateStockMovementPayload): Promise<StockMovement> {
  const response = await apiFetch<ApiResourceResponse<ApiStockMovement>>("admin/stock/movements", {
    method: "POST",
    body: JSON.stringify({
      product_id: payload.productId,
      quantity: payload.quantity,
      movement_type: payload.movementType,
      reason: payload.reason ?? null,
    }),
  });

  return mapMovement(response.data);
}

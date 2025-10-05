import { apiFetch } from "@/lib/api";

type ApiListResponse<T> = {
  data: T[];
};

type ApiResourceResponse<T> = {
  data: T;
};

type ApiCategorySummary = {
  id: number;
  name: string;
  slug: string;
  type: string | null;
};

type ApiProduct = {
  id: number;
  slug: string;
  name: string;
  origin: string | null;
  type: string | null;
  price: number | null;
  original_price: number | null;
  rating: number | null;
  volume: string | null;
  alcohol: string | null;
  temperature: string | null;
  description: string | null;
  stock_quantity: number | null;
  current_stock?: number | null;
  active: boolean;
  image: string | null;
  categories?: ApiCategorySummary[] | null;
};

export type AdminProduct = {
  id: number;
  slug: string;
  name: string;
  origin: string | null;
  type: string | null;
  price: number;
  originalPrice: number | null;
  rating: number | null;
  volume: string | null;
  alcohol: string | null;
  temperature: string | null;
  description: string | null;
  stockQuantity: number;
  active: boolean;
  imageUrl: string | null;
  categories: ApiCategorySummary[];
};

export type AdminProductPayload = {
  name: string;
  slug?: string | null;
  origin?: string | null;
  type?: string | null;
  price: number;
  original_price?: number | null;
  rating?: number | null;
  volume?: string | null;
  alcohol?: string | null;
  temperature?: string | null;
  description?: string | null;
  active?: boolean;
  category_ids?: number[];
  image_url?: string | null;
};

function mapProduct(apiProduct: ApiProduct): AdminProduct {
  const stock = apiProduct.current_stock ?? apiProduct.stock_quantity ?? 0;

  return {
    id: apiProduct.id,
    slug: apiProduct.slug,
    name: apiProduct.name,
    origin: apiProduct.origin,
    type: apiProduct.type,
    price: Number(apiProduct.price ?? 0),
    originalPrice: apiProduct.original_price,
    rating: apiProduct.rating,
    volume: apiProduct.volume,
    alcohol: apiProduct.alcohol,
    temperature: apiProduct.temperature,
    description: apiProduct.description,
    stockQuantity: Number(stock),
    active: apiProduct.active,
    imageUrl: apiProduct.image,
    categories: apiProduct.categories ?? [],
  } satisfies AdminProduct;
}

export async function listAdminProducts(): Promise<AdminProduct[]> {
  const response = await apiFetch<ApiListResponse<ApiProduct>>("admin/products");
  return response.data.map(mapProduct);
}

export async function createAdminProduct(payload: AdminProductPayload): Promise<AdminProduct> {
  const response = await apiFetch<ApiResourceResponse<ApiProduct>>("admin/products", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return mapProduct(response.data);
}

export async function updateAdminProduct(
  productId: number,
  payload: AdminProductPayload
): Promise<AdminProduct> {
  const response = await apiFetch<ApiResourceResponse<ApiProduct>>(`admin/products/${productId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

  return mapProduct(response.data);
}

export async function deleteAdminProduct(productId: number): Promise<void> {
  await apiFetch<null>(`admin/products/${productId}`, {
    method: "DELETE",
  });
}

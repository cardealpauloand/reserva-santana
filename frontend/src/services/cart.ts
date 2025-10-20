import { apiFetch } from "@/lib/api";
import type { CartData, CartProductItem, CartSyncItem } from "@/types/cart";
import type {
  Product,
  ProductCategory,
  ProductImage,
} from "@/types/product";

type ApiCart = {
  id: number;
  currency: string;
  items: ApiCartItem[];
  updated_at?: string | null;
};

type ApiCartItem = {
  id: number;
  product_id: number;
  quantity: number;
  unit_price?: number | null;
  product?: ApiProduct | null;
};

type ApiProduct = {
  id: number;
  slug: string;
  name: string;
  origin?: string | null;
  type?: string | null;
  price: number | null;
  original_price?: number | null;
  rating?: number | null;
  volume?: string | null;
  alcohol?: string | null;
  temperature?: string | null;
  description?: string | null;
  stock_quantity?: number | null;
  image?: string | null;
  primary_image?: ApiProductImage | null;
  images?: ApiProductImage[] | null;
  categories?: ApiCategorySummary[] | null;
};

type ApiCategorySummary = {
  id: number;
  slug: string;
  name: string;
  type?: string | null;
};

type ApiProductImage = {
  id: number;
  url: string;
  alt?: string | null;
  is_primary?: boolean;
  position?: number | null;
};

const mapCategorySummary = (
  category: ApiCategorySummary | null | undefined
): ProductCategory | null => {
  if (!category) {
    return null;
  }

  return {
    id: category.id,
    slug: category.slug,
    name: category.name,
    type: category.type ?? null,
  };
};

const mapProductImage = (
  image: ApiProductImage | null | undefined
): ProductImage | undefined => {
  if (!image) {
    return undefined;
  }

  return {
    id: image.id,
    url: image.url,
    alt: image.alt ?? null,
    isPrimary: image.is_primary ?? undefined,
    position: image.position ?? null,
  };
};

const mapProduct = (apiProduct: ApiProduct): Product => {
  const primaryImage =
    mapProductImage(apiProduct.primary_image ?? undefined) ?? undefined;
  const images = (apiProduct.images ?? [])
    ?.map(mapProductImage)
    .filter((image): image is ProductImage => Boolean(image));

  return {
    id: apiProduct.id,
    slug: apiProduct.slug,
    name: apiProduct.name,
    origin: apiProduct.origin ?? null,
    type: apiProduct.type ?? null,
    price: apiProduct.price !== null && apiProduct.price !== undefined
      ? Number(apiProduct.price)
      : 0,
    originalPrice: apiProduct.original_price ?? null,
    rating: apiProduct.rating ?? null,
    volume: apiProduct.volume ?? null,
    alcohol: apiProduct.alcohol ?? null,
    temperature: apiProduct.temperature ?? null,
    description: apiProduct.description ?? null,
    stockQuantity: apiProduct.stock_quantity ?? 0,
    image: apiProduct.image ?? primaryImage?.url ?? null,
    primaryImage: primaryImage ?? null,
    images,
    categories: (apiProduct.categories ?? [])
      .map(mapCategorySummary)
      .filter(
        (category): category is ProductCategory => Boolean(category)
      ),
  };
};

const mapCartItem = (item: ApiCartItem): CartProductItem | null => {
  if (!item.product) {
    return null;
  }

  const product = mapProduct(item.product);
  const price =
    item.unit_price !== null && item.unit_price !== undefined
      ? Number(item.unit_price)
      : product.price;

  return {
    ...product,
    price,
    quantity: Math.max(0, item.quantity ?? 0),
  };
};

const mapCart = (cart: ApiCart): CartData => {
  const items = cart.items
    .map(mapCartItem)
    .filter((item): item is CartProductItem => Boolean(item));

  return {
    id: cart.id,
    currency: cart.currency,
    items,
    updatedAt: cart.updated_at ?? null,
  };
};

const normalizePayload = (items: CartSyncItem[]) =>
  items.map((item) => ({
    product_id: item.productId,
    quantity: item.quantity,
  }));

export const cartService = {
  async getCart(): Promise<CartData> {
    const response = await apiFetch<ApiCart>("cart");
    return mapCart(response);
  },

  async syncCart(items: CartSyncItem[]): Promise<CartData> {
    const response = await apiFetch<ApiCart>("cart", {
      method: "PUT",
      body: JSON.stringify({ items: normalizePayload(items) }),
    });

    return mapCart(response);
  },

  async clearCart(): Promise<CartData> {
    const response = await apiFetch<ApiCart>("cart", {
      method: "DELETE",
    });

    return mapCart(response);
  },
};

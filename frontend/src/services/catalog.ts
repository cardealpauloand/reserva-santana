import { apiFetch } from "@/lib/api";
import type {
  Product,
  ProductCategory,
  ProductImage,
  CategorySummary,
  CategoryDetails,
} from "@/types/product";

type ApiListResponse<T> = {
  data: T[];
};

type ApiResourceResponse<T> = {
  data: T;
};

type ApiGroup = {
  id: number;
  name: string;
} | null;

type ApiCategorySummary = {
  id: number;
  slug: string;
  name: string;
  type?: string | null;
  product_count?: number | null;
  group?: ApiGroup;
};

type ApiProductImage = {
  id: number;
  url: string;
  alt?: string | null;
  is_primary?: boolean;
  position?: number | null;
};

type ApiProduct = {
  id: number;
  slug: string;
  name: string;
  origin?: string | null;
  type?: string | null;
  price: number;
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

type ApiCategoryDetails = ApiCategorySummary & {
  products: ApiProduct[];
};

function mapCategorySummary(category: ApiCategorySummary | null | undefined): ProductCategory | null {
  if (!category) {
    return null;
  }

  return {
    id: category.id,
    slug: category.slug,
    name: category.name,
    type: category.type ?? null,
  } satisfies ProductCategory;
}

function mapCategorySummaryWithCount(category: ApiCategorySummary): CategorySummary {
  return {
    id: category.id,
    slug: category.slug,
    name: category.name,
    type: category.type ?? null,
    productCount: category.product_count ?? null,
  } satisfies CategorySummary;
}

function mapProductImage(image: ApiProductImage | null | undefined): ProductImage | undefined {
  if (!image) {
    return undefined;
  }

  return {
    id: image.id,
    url: image.url,
    alt: image.alt ?? null,
    isPrimary: image.is_primary ?? undefined,
    position: image.position ?? null,
  } satisfies ProductImage;
}

function mapProduct(apiProduct: ApiProduct): Product {
  const primaryImage = mapProductImage(apiProduct.primary_image ?? undefined) ?? undefined;
  const images = (apiProduct.images ?? [])
    ?.map(mapProductImage)
    .filter((image): image is ProductImage => Boolean(image));

  return {
    id: apiProduct.id,
    slug: apiProduct.slug,
    name: apiProduct.name,
    origin: apiProduct.origin ?? null,
    type: apiProduct.type ?? null,
    price: Number(apiProduct.price),
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
      .filter((category): category is ProductCategory => Boolean(category)),
  } satisfies Product;
}

function buildQuery(params?: Record<string, string | undefined>): string {
  const searchParams = new URLSearchParams();

  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value) {
      searchParams.set(key, value);
    }
  });

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export async function fetchProducts(params?: {
  category?: string;
  search?: string;
}): Promise<Product[]> {
  const response = await apiFetch<ApiListResponse<ApiProduct>>(
    `catalog/products${buildQuery({
      category: params?.category,
      search: params?.search,
    })}`
  );

  return response.data.map(mapProduct);
}

export async function fetchProduct(productId: number): Promise<Product> {
  const response = await apiFetch<ApiResourceResponse<ApiProduct>>(
    `catalog/products/${productId}`
  );

  return mapProduct(response.data);
}

export async function fetchCategories(): Promise<CategorySummary[]> {
  const response = await apiFetch<ApiListResponse<ApiCategorySummary>>(
    "catalog/categories"
  );

  return response.data.map(mapCategorySummaryWithCount);
}

export async function fetchCategory(slug: string): Promise<CategoryDetails> {
  const response = await apiFetch<ApiResourceResponse<ApiCategoryDetails>>(
    `catalog/categories/${slug}`
  );

  const summary = mapCategorySummaryWithCount(response.data);

  return {
    ...summary,
    products: response.data.products.map(mapProduct),
  } satisfies CategoryDetails;
}

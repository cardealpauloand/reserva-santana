import { useQuery } from "@tanstack/react-query";
import {
  fetchCategories,
  fetchCategory,
  fetchProduct,
  fetchProducts,
} from "@/services/catalog";
import type { CategoryDetails, CategorySummary, Product } from "@/types/product";

type ProductsParams = {
  category?: string;
  search?: string;
};

export function useProducts(params?: ProductsParams) {
  return useQuery<Product[], Error>({
    queryKey: ["catalog", "products", params ?? {}],
    queryFn: () => fetchProducts(params),
  });
}

export function useProduct(productId?: number) {
  return useQuery<Product, Error>({
    queryKey: ["catalog", "product", productId],
    queryFn: () => fetchProduct(productId as number),
    enabled: typeof productId === "number" && !Number.isNaN(productId),
  });
}

export function useCategories() {
  return useQuery<CategorySummary[], Error>({
    queryKey: ["catalog", "categories"],
    queryFn: fetchCategories,
  });
}

export function useCategory(slug?: string) {
  return useQuery<CategoryDetails, Error>({
    queryKey: ["catalog", "category", slug],
    queryFn: () => fetchCategory(slug as string),
    enabled: Boolean(slug),
  });
}

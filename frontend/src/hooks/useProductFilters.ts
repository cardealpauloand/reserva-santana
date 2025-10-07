import { useCallback, useEffect, useMemo, useState } from "react";
import type { Product } from "@/types/product";

export type ProductFiltersState = {
  availability: "all" | "inStock";
  priceRange: [number, number];
  sortBy: "relevance" | "priceAsc" | "priceDesc" | "nameAsc";
};

export type PriceBounds = {
  min: number;
  max: number;
};

const DEFAULT_PRICE_BOUNDS: PriceBounds = { min: 0, max: 0 };

function cloneFilterState(state: ProductFiltersState): ProductFiltersState {
  return {
    availability: state.availability,
    sortBy: state.sortBy,
    priceRange: [state.priceRange[0], state.priceRange[1]],
  };
}

export function getPriceBounds(products: Product[]): PriceBounds {
  if (!products.length) {
    return DEFAULT_PRICE_BOUNDS;
  }

  const prices = products.map((product) => product.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);

  return {
    min: Math.floor(min),
    max: Math.ceil(max),
  } satisfies PriceBounds;
}

export function createDefaultProductFilters(
  products: Product[]
): ProductFiltersState {
  const bounds = getPriceBounds(products);

  return {
    availability: "all",
    sortBy: "relevance",
    priceRange: [bounds.min, bounds.max],
  } satisfies ProductFiltersState;
}

export function areProductFiltersEqual(
  a: ProductFiltersState,
  b: ProductFiltersState
): boolean {
  return (
    a.availability === b.availability &&
    a.sortBy === b.sortBy &&
    a.priceRange[0] === b.priceRange[0] &&
    a.priceRange[1] === b.priceRange[1]
  );
}

export function applyProductFilters(
  products: Product[],
  filters: ProductFiltersState
): Product[] {
  const [minPrice, maxPrice] = filters.priceRange;
  const priceMin = Math.min(minPrice, maxPrice);
  const priceMax = Math.max(minPrice, maxPrice);

  const filtered = products.filter((product) => {
    const withinPriceRange =
      product.price >= priceMin && product.price <= priceMax;
    const matchesAvailability =
      filters.availability === "all" || product.stockQuantity > 0;

    return withinPriceRange && matchesAvailability;
  });

  if (filters.sortBy === "priceAsc") {
    return [...filtered].sort((a, b) => a.price - b.price);
  }

  if (filters.sortBy === "priceDesc") {
    return [...filtered].sort((a, b) => b.price - a.price);
  }

  if (filters.sortBy === "nameAsc") {
    return [...filtered].sort((a, b) =>
      a.name.localeCompare(b.name, "pt-BR", { sensitivity: "base" })
    );
  }

  return filtered;
}

export function countActiveProductFilters(
  filters: ProductFiltersState,
  defaults: ProductFiltersState
): number {
  let count = 0;

  if (filters.availability !== defaults.availability) {
    count += 1;
  }

  if (filters.sortBy !== defaults.sortBy) {
    count += 1;
  }

  if (
    filters.priceRange[0] !== defaults.priceRange[0] ||
    filters.priceRange[1] !== defaults.priceRange[1]
  ) {
    count += 1;
  }

  return count;
}

export function useProductFilters(products: Product[]) {
  const defaultFilters = useMemo(
    () => createDefaultProductFilters(products),
    [products]
  );

  const [filters, setFilters] = useState<ProductFiltersState>(() =>
    cloneFilterState(defaultFilters)
  );

  useEffect(() => {
    setFilters(cloneFilterState(defaultFilters));
  }, [defaultFilters]);

  const updateFilters = useCallback((changes: Partial<ProductFiltersState>) => {
    setFilters((prev) => ({
      availability: changes.availability ?? prev.availability,
      sortBy: changes.sortBy ?? prev.sortBy,
      priceRange: changes.priceRange
        ? [changes.priceRange[0], changes.priceRange[1]]
        : [prev.priceRange[0], prev.priceRange[1]],
    }));
  }, []);

  const filteredProducts = useMemo(
    () => applyProductFilters(products, filters),
    [products, filters]
  );

  const resetFilters = useCallback(() => {
    setFilters(cloneFilterState(defaultFilters));
  }, [defaultFilters]);

  const areFiltersDefault = useMemo(
    () => areProductFiltersEqual(filters, defaultFilters),
    [filters, defaultFilters]
  );

  const bounds = useMemo(() => getPriceBounds(products), [products]);

  const activeFiltersCount = useMemo(
    () => countActiveProductFilters(filters, defaultFilters),
    [filters, defaultFilters]
  );

  return {
    filters,
    filteredProducts,
    updateFilters,
    resetFilters,
    areFiltersDefault,
    bounds,
    activeFiltersCount,
  } as const;
}

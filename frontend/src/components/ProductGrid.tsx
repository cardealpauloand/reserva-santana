import { useMemo, useState } from "react";
import { ProductCard } from "./ProductCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCategories, useProducts } from "@/hooks/useCatalog";

const LoadingGrid = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {Array.from({ length: 8 }).map((_, index) => (
      <div key={index} className="space-y-4">
        <Skeleton className="w-full aspect-[3/4] rounded-lg" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-6 w-24" />
      </div>
    ))}
  </div>
);

export const ProductGrid = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { data: categories } = useCategories();

  const productParams = useMemo(
    () => (selectedCategory ? { category: selectedCategory } : undefined),
    [selectedCategory]
  );

  const {
    data: products,
    isLoading,
    isError,
    error,
  } = useProducts(productParams);

  const categoryOptions = useMemo(
    () =>
      [
        { slug: null, label: "Todos" },
        ...(categories ?? []).map((category) => ({
          slug: category.slug,
          label: category.name,
        })),
      ],
    [categories]
  );

  return (
    <section className="container px-4 md:px-6 py-16">
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Vinhos em Destaque
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Selecionamos os melhores vinhos para você. Qualidade premium com preços especiais.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          {categoryOptions.map((category) => {
            const isActive = category.slug === selectedCategory;
            const label = category.label;
            return (
              <Button
                key={category.slug ?? "todos"}
                variant={isActive || (!selectedCategory && category.slug === null) ? "default" : "outline"}
                onClick={() => setSelectedCategory(category.slug)}
                className="transition-all duration-300"
              >
                {label}
              </Button>
            );
          })}
        </div>

        {isError && (
          <p className="text-center text-muted-foreground">
            Não foi possível carregar os produtos: {error.message}
          </p>
        )}

        {isLoading ? (
          <LoadingGrid />
        ) : !products || products.length === 0 ? (
          <p className="text-center text-muted-foreground">
            Nenhum produto encontrado no momento.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

import { useMemo } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useProducts } from "@/hooks/useCatalog";
import { ProductFiltersLauncher } from "@/components/ProductFiltersLauncher";
import { useProductFilters } from "@/hooks/useProductFilters";
import { Button } from "@/components/ui/button";

const Catalog = () => {
  const { data: products, isLoading } = useProducts();

  const {
    filters,
    filteredProducts,
    updateFilters,
    resetFilters,
    areFiltersDefault,
    bounds,
    activeFiltersCount,
  } = useProductFilters(products ?? []);

  const resultsSummary = useMemo(() => {
    if (isLoading) {
      return "Carregando produtos...";
    }
    if (filteredProducts.length === (products?.length ?? 0)) {
      const count = products?.length ?? 0;
      return `${count} ${count === 1 ? "produto encontrado" : "produtos encontrados"}`;
    }
    return `Mostrando ${filteredProducts.length} de ${products?.length ?? 0} produtos`;
  }, [isLoading, filteredProducts.length, products?.length]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="container px-4 md:px-6 py-16 ">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-foreground">Catálogo de Vinhos</h2>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <ProductFiltersLauncher
                filters={filters}
                bounds={bounds}
                onFiltersChange={updateFilters}
                onReset={resetFilters}
                isResetDisabled={areFiltersDefault}
                disabled={isLoading}
                areFiltersDefault={areFiltersDefault}
                activeFiltersCount={activeFiltersCount}
                title="Filtros do catálogo"
                description="Refine os produtos por ordenação, preço e disponibilidade."
              />

              <p className="text-sm text-muted-foreground sm:text-right">
                {resultsSummary}
              </p>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, index) => (
                  <Skeleton key={index} className="aspect-square w-full rounded-xl" />
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="py-16 text-center">
                <div className="space-y-3">
                  <p className="text-muted-foreground">
                    Nenhum produto corresponde aos filtros aplicados.
                  </p>
                  <Button type="button" variant="link" size="sm" onClick={resetFilters}>
                    Limpar filtros
                  </Button>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Catalog;

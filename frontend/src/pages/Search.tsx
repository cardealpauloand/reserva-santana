import { useMemo } from "react";
import { NavLink, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchProducts } from "@/services/catalog";
import { ProductFiltersLauncher } from "@/components/ProductFiltersLauncher";
import { useProductFilters } from "@/hooks/useProductFilters";
import { Button } from "@/components/ui/button";
import { useCategories } from "@/hooks/useCatalog";
import { cn } from "@/lib/utils";

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = (searchParams.get("q") || "").trim();
  const shouldSearch = query.length > 0;

  const { data: categories, isLoading: isLoadingCategories } = useCategories();

  const { data: products, isLoading } = useQuery({
    queryKey: ["catalog", "search", query],
    queryFn: () => fetchProducts({ search: query }),
    enabled: shouldSearch,
  });

  const searchResults = useMemo(
    () => (shouldSearch ? products ?? [] : []),
    [shouldSearch, products]
  );

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    (categories ?? []).forEach((item) => {
      counts[item.slug] = item.productCount ?? 0;
    });
    return counts;
  }, [categories]);

  const categoryOptions = useMemo(
    () =>
      (categories ?? []).map((item) => ({
        slug: item.slug,
        name: item.name,
      })),
    [categories]
  );

  const {
    filters,
    filteredProducts,
    updateFilters,
    resetFilters,
    areFiltersDefault,
    bounds,
    activeFiltersCount,
  } = useProductFilters(searchResults);

  const productsTitle = shouldSearch
    ? `Resultados para "${query}"`
    : "Buscar produtos";

  const resultsSummary = useMemo(() => {
    if (isLoading) {
      return "Carregando produtos...";
    }

    if (filteredProducts.length === searchResults.length) {
      const count = searchResults.length;
      return `${count} ${
        count === 1 ? "produto encontrado" : "produtos encontrados"
      }`;
    }

    return `Mostrando ${filteredProducts.length} de ${searchResults.length} produtos`;
  }, [isLoading, filteredProducts.length, searchResults.length]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="container px-4 md:px-6 py-16 ">
          <div className="flex flex-col gap-8 md:flex-row ">
            <aside className="md:w-64 md:flex-shrink-0">
              <div className="space-y-4 rounded-xl border bg-card p-4 shadow-sm">
                <h2 className="text-lg font-semibold text-foreground">
                  Categorias
                </h2>
                <nav className="flex gap-2 overflow-x-auto pb-2 md:flex-col md:gap-1 md:overflow-visible md:pb-0">
                  {isLoadingCategories
                    ? Array.from({ length: 4 }).map((_, index) => (
                        <Skeleton
                          key={index}
                          className="h-10 w-full rounded-md"
                        />
                      ))
                    : categoryOptions.map(({ slug, name }) => (
                        <NavLink
                          key={slug}
                          to={`/categoria/${slug}`}
                          className={({ isActive }) =>
                            cn(
                              "flex min-w-[10rem] items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors md:min-w-0",
                              isActive
                                ? "bg-primary text-primary-foreground shadow-sm"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )
                          }
                        >
                          <span>{name}</span>
                          <span className="text-xs font-normal opacity-80">
                            {categoryCounts[slug] ?? 0}
                          </span>
                        </NavLink>
                      ))}
                </nav>
              </div>
            </aside>

            <div className="flex-1 space-y-6">
              <h2 className="text-3xl font-bold text-foreground">
                {productsTitle}
              </h2>

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
                  title="Filtros da busca"
                  description="Refine os resultados por preço, disponibilidade e ordenação."
                />

                <p className="text-sm text-muted-foreground sm:text-right">
                  {resultsSummary}
                </p>
              </div>

              {isLoading ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {Array.from({ length: 8 }).map((_, index) => (
                    <Skeleton
                      key={index}
                      className="aspect-[3/4] w-full rounded-xl"
                    />
                  ))}
                </div>
              ) : filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
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
                    <Button
                      type="button"
                      variant="link"
                      size="sm"
                      onClick={resetFilters}
                    >
                      Limpar filtros
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Search;

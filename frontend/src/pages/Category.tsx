import { NavLink, useParams } from "react-router-dom";
import { useMemo } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { cn } from "@/lib/utils";
import { useCategories, useCategory } from "@/hooks/useCatalog";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductFiltersLauncher } from "@/components/ProductFiltersLauncher";
import { useProductFilters } from "@/hooks/useProductFilters";
import { Button } from "@/components/ui/button";

const Category = () => {
  const { category } = useParams<{ category: string }>();
  const { data: categories, isLoading: isLoadingCategories } = useCategories();
  const {
    data: categoryDetails,
    isLoading: isLoadingCategory,
    isError,
    error,
  } = useCategory(category);

  const categoryNotFound =
    isError && error.message.toLowerCase().includes("not");

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

  const products = categoryDetails?.products ?? [];
  const {
    filters,
    filteredProducts,
    updateFilters,
    resetFilters,
    areFiltersDefault,
    bounds,
    activeFiltersCount,
  } = useProductFilters(products);

  const resultsSummary = useMemo(() => {
    if (isLoadingCategory) {
      return "Carregando produtos...";
    }

    if (filteredProducts.length === products.length) {
      const count = products.length;
      return `${count} ${
        count === 1 ? "produto encontrado" : "produtos encontrados"
      }`;
    }

    return `Mostrando ${filteredProducts.length} de ${products.length} produtos`;
  }, [isLoadingCategory, filteredProducts.length, products.length]);

  if (!category || categoryNotFound) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container px-4 md:px-6 py-16">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-foreground">
              Categoria não encontrada
            </h1>
            <p className="text-muted-foreground">
              A categoria que você procura não existe.
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

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
                {categoryDetails?.name ?? "Carregando..."}
              </h2>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <ProductFiltersLauncher
                  filters={filters}
                  bounds={bounds}
                  onFiltersChange={updateFilters}
                  onReset={resetFilters}
                  isResetDisabled={areFiltersDefault}
                  disabled={isLoadingCategory}
                  areFiltersDefault={areFiltersDefault}
                  activeFiltersCount={activeFiltersCount}
                  title={`Filtros de ${categoryDetails?.name ?? "categoria"}`}
                  description="Refine os produtos por ordenação, preço e disponibilidade."
                />

                <p className="text-sm text-muted-foreground sm:text-right">
                  {resultsSummary}
                </p>
              </div>

              {isLoadingCategory ? (
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

export default Category;

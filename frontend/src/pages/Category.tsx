import { NavLink, useParams } from "react-router-dom";
import { useMemo } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { cn } from "@/lib/utils";
import { useCategories, useCategory } from "@/hooks/useCatalog";
import { Skeleton } from "@/components/ui/skeleton";

const Category = () => {
  const { category } = useParams<{ category: string }>();
  const { data: categories, isLoading: isLoadingCategories } = useCategories();
  const {
    data: categoryDetails,
    isLoading: isLoadingCategory,
    isError,
    error,
  } = useCategory(category);

  const categoryNotFound = isError && error.message.toLowerCase().includes("not");

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

  if (!category || categoryNotFound) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container px-4 md:px-6 py-16">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-foreground">Categoria não encontrada</h1>
            <p className="text-muted-foreground">A categoria que você procura não existe.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const products = categoryDetails?.products ?? [];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="bg-gradient-to-br from-primary/10 to-secondary/10 py-12 md:py-16">
          <div className="container px-4 md:px-6">
            <div className="max-w-3xl">
              <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
                {categoryDetails?.name ?? "Carregando..."}
              </h1>
              <p className="text-lg text-muted-foreground">
                Descubra nossa seleção de {categoryDetails?.name?.toLowerCase() ?? "vinhos"} com qualidade premium e preços especiais.
              </p>
            </div>
          </div>
        </section>

        <section className="container px-4 md:px-6 py-16">
          <div className="flex flex-col gap-8 md:flex-row">
            <aside className="md:w-64 md:flex-shrink-0">
              <div className="space-y-4 rounded-xl border bg-card p-4 shadow-sm">
                <h2 className="text-lg font-semibold text-foreground">Categorias</h2>
                <nav className="flex gap-2 overflow-x-auto pb-2 md:flex-col md:gap-1 md:overflow-visible md:pb-0">
                  {isLoadingCategories ? (
                    Array.from({ length: 4 }).map((_, index) => (
                      <Skeleton key={index} className="h-10 w-full rounded-md" />
                    ))
                  ) : (
                    categoryOptions.map(({ slug, name }) => (
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
                    ))
                  )}
                </nav>
              </div>
            </aside>

            <div className="flex-1 space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground">
                  {isLoadingCategory
                    ? "Carregando produtos..."
                    : `${products.length} ${products.length === 1 ? "produto encontrado" : "produtos encontrados"}`}
                </p>
              </div>

              {isLoadingCategory ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {Array.from({ length: 8 }).map((_, index) => (
                    <Skeleton key={index} className="aspect-[3/4] w-full rounded-xl" />
                  ))}
                </div>
              ) : products.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="py-16 text-center">
                  <p className="text-muted-foreground">Nenhum produto encontrado nesta categoria.</p>
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

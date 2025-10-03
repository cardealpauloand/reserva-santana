import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchProducts } from "@/services/catalog";

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = (searchParams.get("q") || "").trim();
  const shouldSearch = query.length > 0;

  const {
    data: products,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["catalog", "search", query],
    queryFn: () => fetchProducts({ search: query }),
    enabled: shouldSearch,
  });

  const results = useMemo(() => (shouldSearch ? products ?? [] : []), [shouldSearch, products]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="bg-gradient-to-br from-primary/10 to-secondary/10 py-12 md:py-16">
          <div className="container px-4 md:px-6">
            <div className="max-w-3xl">
              <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
                Resultados da busca
              </h1>
              <p className="text-lg text-muted-foreground">
                Buscando por: <span className="font-semibold text-foreground">"{query}"</span>
              </p>
            </div>
          </div>
        </section>

        <section className="container px-4 md:px-6 py-16">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground">
                {isLoading && shouldSearch
                  ? "Carregando produtos..."
                  : `${results.length} ${results.length === 1 ? "produto encontrado" : "produtos encontrados"}`}
              </p>
            </div>

            {isError && shouldSearch && (
              <p className="text-center text-muted-foreground">
                Não foi possível realizar a busca: {error.message}
              </p>
            )}

            {isLoading && shouldSearch ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, index) => (
                  <Skeleton key={index} className="aspect-[3/4] w-full rounded-xl" />
                ))}
              </div>
            ) : results.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {results.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-muted-foreground">
                  {shouldSearch
                    ? `Nenhum produto encontrado para "${query}".`
                    : "Digite um termo de busca para encontrar produtos."}
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Search;

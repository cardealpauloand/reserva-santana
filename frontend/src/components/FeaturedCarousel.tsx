import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { ProductCard } from "./ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useProducts } from "@/hooks/useCatalog";

const LoadingCarousel = () => (
  <Carousel className="w-full">
    <CarouselContent className="-ml-2 md:-ml-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <CarouselItem
          key={index}
          className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
        >
          <div className="h-full space-y-4">
            <Skeleton className="w-full aspect-[3/4] rounded-lg" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-6 w-24" />
          </div>
        </CarouselItem>
      ))}
    </CarouselContent>
  </Carousel>
);

export const FeaturedCarousel = () => {
  const { data: products, isLoading, isError, error } = useProducts();

  const featuredProducts = (products ?? []).slice(0, 5);

  return (
    <section className="container px-4 md:px-6 py-16">
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Destaques da Semana
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Seleção especial dos nossos vinhos mais populares
          </p>
        </div>

        {isError && (
          <p className="text-center text-muted-foreground">
            Não foi possível carregar os destaques: {error.message}
          </p>
        )}

        {isLoading ? (
          <LoadingCarousel />
        ) : isError ? null : featuredProducts.length === 0 ? (
          <p className="text-center text-muted-foreground">Nenhum produto disponível no momento.</p>
        ) : (
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {featuredProducts.map((product) => (
                <CarouselItem
                  key={product.id}
                  className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
                >
                  <ProductCard product={product} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex" />
            <CarouselNext className="hidden md:flex" />
          </Carousel>
        )}
      </div>
    </section>
  );
};

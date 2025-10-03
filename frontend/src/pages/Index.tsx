import { Header } from "@/components/Header";
import { HeroCarousel } from "@/components/HeroCarousel";
import { FeaturedCarousel } from "@/components/FeaturedCarousel";
import { ProductGrid } from "@/components/ProductGrid";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <HeroCarousel />
        <FeaturedCarousel />
        <ProductGrid />
      </main>
      <Footer />
    </div>
  );
};

export default Index;

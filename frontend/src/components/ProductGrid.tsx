import { useState } from "react";
import { ProductCard } from "./ProductCard";
import { Button } from "@/components/ui/button";
import { products } from "@/data/products";

const categories = ["Todos", "Tinto", "Branco", "Rosé", "Espumante"];

export const ProductGrid = () => {
  const [selectedCategory, setSelectedCategory] = useState("Todos");

  const filteredProducts = selectedCategory === "Todos" 
    ? products 
    : products.filter(p => p.type === selectedCategory);

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
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => setSelectedCategory(category)}
              className="transition-all duration-300"
            >
              {category}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

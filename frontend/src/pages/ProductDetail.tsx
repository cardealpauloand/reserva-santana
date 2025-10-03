import { useParams, Link, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { products } from "@/data/products";
import { useCart } from "@/contexts/CartContext";
import { ProductCard } from "@/components/ProductCard";
import { Star, Plus, Minus, ArrowLeft, Wine, Thermometer, Percent } from "lucide-react";
import { useState, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  
  const product = products.find(p => p.id === Number(id));

  const suggestedProducts = useMemo(() => {
    if (!product) return [];
    return products
      .filter(p => p.type === product.type && p.id !== product.id)
      .slice(0, 4);
  }, [product]);

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container px-4 md:px-6 py-16">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-foreground">Produto não encontrado</h1>
            <p className="text-muted-foreground">O produto que você procura não existe.</p>
            <Button asChild>
              <Link to="/">Voltar para home</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem(product);
    }
    toast({
      title: "Adicionado ao carrinho",
      description: `${quantity}x ${product.name}`,
    });
  };

  const incrementQuantity = () => setQuantity(q => q + 1);
  const decrementQuantity = () => setQuantity(q => Math.max(1, q - 1));

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container px-4 md:px-6 py-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {/* Product Image */}
            <div className="space-y-4">
              <div className="aspect-[3/4] rounded-lg overflow-hidden bg-accent">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div className="space-y-2">
                <Badge variant="secondary" className="mb-2">
                  {product.type}
                </Badge>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                  {product.name}
                </h1>
                <p className="text-lg text-muted-foreground flex items-center gap-2">
                  <Wine className="h-4 w-4" />
                  {product.origin}
                </p>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < product.rating
                          ? "fill-primary text-primary"
                          : "fill-muted text-muted"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  ({product.rating}.0)
                </span>
              </div>

              {/* Price */}
              <div className="space-y-2">
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-bold text-foreground">
                    R$ {product.price.toFixed(2)}
                  </span>
                  <span className="text-xl text-muted-foreground line-through">
                    R$ {product.originalPrice.toFixed(2)}
                  </span>
                </div>
                <Badge variant="destructive" className="gap-1">
                  <Percent className="h-3 w-3" />
                  {discount}% OFF
                </Badge>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h2 className="text-lg font-semibold text-foreground">Descrição</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {product.description || "Um vinho excepcional cuidadosamente selecionado para proporcionar uma experiência única. Perfeito para ocasiões especiais ou para apreciar no dia a dia."}
                </p>
              </div>

              {/* Product Details */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-accent/50 rounded-lg">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Volume</p>
                  <p className="font-semibold text-foreground">{product.volume || "750ml"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Teor Alcoólico</p>
                  <p className="font-semibold text-foreground">{product.alcohol || "13%"}</p>
                </div>
                <div className="space-y-1 flex flex-col">
                  <p className="text-xs text-muted-foreground">Temperatura</p>
                  <p className="font-semibold text-foreground flex items-center gap-1">
                    <Thermometer className="h-3 w-3" />
                    {product.temperature || "16°C"}
                  </p>
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">Quantidade</label>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={decrementQuantity}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="text-xl font-semibold text-foreground w-12 text-center">
                    {quantity}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={incrementQuantity}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Add to Cart Button */}
              <div className="space-y-3">
                <Button
                  onClick={handleAddToCart}
                  size="lg"
                  className="w-full text-lg"
                >
                  Adicionar ao Carrinho - R$ {(product.price * quantity).toFixed(2)}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Entrega em até 5 dias úteis
                </p>
              </div>
            </div>
          </div>

          {/* Suggested Products */}
          {suggestedProducts.length > 0 && (
            <div className="mt-16 border-t border-border pt-16">
              <div className="mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                  Vinhos Semelhantes
                </h2>
                <p className="text-muted-foreground">
                  Outros vinhos da categoria {product.type.toLowerCase()} que você pode gostar
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {suggestedProducts.map((suggestedProduct) => (
                  <ProductCard key={suggestedProduct.id} product={suggestedProduct} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetail;

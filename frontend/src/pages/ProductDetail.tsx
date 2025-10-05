import { useParams, Link, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import { ProductCard } from "@/components/ProductCard";
import { Star, Plus, Minus, ArrowLeft, Wine, Thermometer, Percent } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { useProduct, useProducts } from "@/hooks/useCatalog";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const productId = Number(id);
  const navigate = useNavigate();
  const { addItem, items } = useCart();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);

  const {
    data: product,
    isLoading,
    isError,
    error,
  } = useProduct(Number.isFinite(productId) ? productId : undefined);

  const { data: allProducts } = useProducts();

  const cartQuantity = useMemo(() => {
    if (!product) {
      return 0;
    }

    const cartItem = items.find((item) => item.id === product.id);
    return cartItem?.quantity ?? 0;
  }, [items, product]);

  const availableToAdd = product ? Math.max(0, product.stockQuantity - cartQuantity) : 0;
  const isOutOfStock = availableToAdd === 0;

  const suggestedProducts = useMemo(() => {
    if (!product || !allProducts) return [];

    return allProducts
      .filter(
        (p) =>
          p.id !== product.id &&
          ((product.type && p.type === product.type) ||
            (product.categories?.[0] &&
              p.categories?.some((category) => category.slug === product.categories?.[0]?.slug)))
      )
      .slice(0, 4);
  }, [product, allProducts]);

  useEffect(() => {
    if (!product) {
      return;
    }

    setQuantity((current) => {
      if (availableToAdd === 0) {
        return 0;
      }

      if (current <= 0) {
        return 1;
      }

      return Math.min(current, availableToAdd);
    });
  }, [availableToAdd, product]);

  const handleAddToCart = () => {
    if (!product) return;

    if (isOutOfStock) {
      toast({
        title: "Produto indisponível",
        description: "Este produto está sem estoque no momento.",
        variant: "destructive",
      });
      return;
    }

    if (quantity <= 0) {
      toast({
        title: "Quantidade inválida",
        description: "Selecione ao menos uma unidade para adicionar ao carrinho.",
        variant: "destructive",
      });
      return;
    }

    if (quantity > availableToAdd) {
      toast({
        title: "Estoque insuficiente",
        description: `Você pode adicionar no máximo ${availableToAdd} ${availableToAdd === 1 ? "unidade" : "unidades"} deste produto.`,
        variant: "destructive",
      });
      return;
    }

    for (let i = 0; i < quantity; i++) {
      addItem(product);
    }
    toast({
      title: "Adicionado ao carrinho",
      description: `${quantity}x ${product.name}`,
    });
  };

  const incrementQuantity = () => {
    if (isOutOfStock) {
      return;
    }

    setQuantity((q) => Math.min(availableToAdd, q + 1));
  };

  const decrementQuantity = () => {
    setQuantity((q) => {
      if (q <= 1) {
        return isOutOfStock ? 0 : 1;
      }

      return q - 1;
    });
  };

  if (!Number.isFinite(productId) || (isError && error.message.toLowerCase().includes("not"))) {
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

  if (isError) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container px-4 md:px-6 py-16">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-foreground">Erro ao carregar produto</h1>
            <p className="text-muted-foreground">{error.message}</p>
            <Button asChild>
              <Link to="/">Voltar para home</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (isLoading || !product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container px-4 md:px-6 py-16">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            <Skeleton className="aspect-[3/4] w-full rounded-xl" />
            <div className="space-y-6">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-12 w-48" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const displayImage = product.image ?? product.primaryImage?.url ?? "https://placehold.co/800x1000?text=Vinho";
  const hasOriginalPrice = typeof product.originalPrice === "number" && product.originalPrice > product.price;
  const discount = hasOriginalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;
  const ratingValue = product.rating ?? 0;
  const stockLabel = `${product.stockQuantity} ${product.stockQuantity === 1 ? "unidade" : "unidades"} em estoque`;
  const alreadyInCartLabel = cartQuantity > 0
    ? ` • ${cartQuantity} ${cartQuantity === 1 ? "unidade" : "unidades"} no carrinho`
    : "";
  const availableLabel = isOutOfStock
    ? "Produto indisponível no momento"
    : `${availableToAdd} ${availableToAdd === 1 ? "unidade" : "unidades"} disponíveis para adicionar`;
  const stockInfoMessage = (() => {
    if (product.stockQuantity === 0) {
      return "Sem estoque disponível";
    }

    if (availableToAdd === 0 && cartQuantity > 0) {
      return `Todas as ${product.stockQuantity} ${product.stockQuantity === 1 ? "unidade" : "unidades"} já estão no carrinho`;
    }

    return `${stockLabel}${alreadyInCartLabel}`;
  })();
  const stockInfoClass =
    product.stockQuantity === 0 || (availableToAdd === 0 && cartQuantity > 0)
      ? "text-destructive"
      : "text-muted-foreground";

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
            <div className="space-y-4">
              <div className="aspect-[3/4] rounded-lg overflow-hidden bg-accent">
                <img
                  src={displayImage}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                {product.type && (
                  <Badge variant="secondary" className="mb-2">
                    {product.type}
                  </Badge>
                )}
                <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                  {product.name}
                </h1>
                {product.origin && (
                  <p className="text-lg text-muted-foreground flex items-center gap-2">
                    <Wine className="h-4 w-4" />
                    {product.origin}
                  </p>
                )}
              </div>

              {ratingValue > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < ratingValue
                            ? "fill-primary text-primary"
                            : "fill-muted text-muted"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    ({ratingValue.toFixed(1)})
                  </span>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-bold text-foreground">
                    R$ {product.price.toFixed(2)}
                  </span>
                  {hasOriginalPrice && (
                    <span className="text-xl text-muted-foreground line-through">
                      R$ {product.originalPrice?.toFixed(2)}
                    </span>
                  )}
                </div>
                <p className={`text-sm ${stockInfoClass}`}>
                  {stockInfoMessage}
                </p>
                {discount > 0 && (
                  <Badge variant="destructive" className="gap-1">
                    <Percent className="h-3 w-3" />
                    {discount}% OFF
                  </Badge>
                )}
              </div>

              <div className="space-y-2">
                <h2 className="text-lg font-semibold text-foreground">Descrição</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {product.description ||
                    "Um vinho excepcional cuidadosamente selecionado para proporcionar uma experiência única. Perfeito para ocasiões especiais ou para apreciar no dia a dia."}
                </p>
              </div>

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

              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">Quantidade</label>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={decrementQuantity}
                    disabled={isOutOfStock || quantity <= 1}
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
                    disabled={isOutOfStock || quantity >= availableToAdd}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">{availableLabel}</p>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleAddToCart}
                  size="lg"
                  className="w-full text-lg"
                  disabled={isOutOfStock || quantity <= 0}
                >
                  {isOutOfStock
                    ? "Sem estoque"
                    : `Adicionar ao Carrinho - R$ ${(product.price * quantity).toFixed(2)}`}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Entrega em até 5 dias úteis
                </p>
              </div>
            </div>
          </div>

          {suggestedProducts.length > 0 && (
            <section className="mt-16">
              <h2 className="text-2xl font-semibold text-foreground mb-6">
                Você também pode gostar
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {suggestedProducts.map((suggested) => (
                  <ProductCard key={suggested.id} product={suggested} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetail;

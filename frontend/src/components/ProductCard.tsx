import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Star } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/types/product";
import { useCart } from "@/contexts/CartContext";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const { addItem, items } = useCart();
  const { name, origin, type, price, originalPrice, rating } = product;

  const displayImage =
    product.image ??
    product.primaryImage?.url ??
    "https://placehold.co/600x800?text=Vinho";
  const ratingValue = rating ?? 0;
  const hasOriginalPrice =
    typeof originalPrice === "number" && originalPrice > price;
  const discount = hasOriginalPrice
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  const cartQuantity = items.find((item) => item.id === product.id)?.quantity ?? 0;
  const availableToAdd = Math.max(0, product.stockQuantity - cartQuantity);
  const isOutOfStock = product.stockQuantity <= 0;
  const hasReachedCartLimit = !isOutOfStock && availableToAdd === 0;
  const disableAddButton = isOutOfStock || hasReachedCartLimit;

  const handleAddToCart = () => {
    if (isOutOfStock) {
      toast.error("Produto indisponível", {
        description: "Sem unidades disponíveis em estoque.",
      });
      return;
    }

    if (hasReachedCartLimit) {
      toast.warning("Limite atingido", {
        description: "Você já adicionou todas as unidades disponíveis.",
      });
      return;
    }

    addItem(product);
    toast.success("Produto adicionado ao carrinho!", {
      description: `${name} foi adicionado com sucesso.`,
    });
  };

  const availabilityLabel = (() => {
    if (isOutOfStock) {
      return "Sem estoque";
    }

    if (hasReachedCartLimit) {
      return "Limite no carrinho";
    }

    return `${product.stockQuantity} ${product.stockQuantity === 1 ? "unidade" : "unidades"}`;
  })();

  return (
    <Card
      className={cn(
        "group overflow-hidden transition-all duration-300 border-border/50 hover:shadow-lg",
        isOutOfStock && "opacity-70 grayscale"
      )}
    >
      <Link to={`/produto/${product.id}`}>
        <div className="relative overflow-hidden bg-muted h-64">
          {discount > 0 && (
            <Badge className="absolute top-3 right-3 z-10 bg-secondary text-secondary-foreground font-bold">
              -{discount}%
            </Badge>
          )}
          {isOutOfStock && (
            <Badge
              variant="secondary"
              className="absolute top-3 left-3 z-10 bg-muted text-muted-foreground"
            >
              Sem estoque
            </Badge>
          )}
          <img
            src={displayImage}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      </Link>

      <CardContent className="p-4 space-y-2">
        {type && (
          <Badge variant="outline" className="text-xs">
            {type}
          </Badge>
        )}

        <Link to={`/produto/${product.id}`}>
          <h3 className="font-semibold text-lg line-clamp-2 text-foreground group-hover:text-primary transition-colors">
            {name}
          </h3>
        </Link>

        {origin && <p className="text-sm text-muted-foreground">{origin}</p>}

        {ratingValue > 0 && (
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < ratingValue
                    ? "fill-secondary text-secondary"
                    : "text-muted"
                }`}
              />
            ))}
            <span className="text-xs text-muted-foreground ml-1">
              ({ratingValue.toFixed(1)})
            </span>
          </div>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        <div className="flex flex-col">
          {hasOriginalPrice && (
            <span className="text-sm text-muted-foreground line-through">
              R$ {originalPrice.toFixed(2)}
            </span>
          )}
          <span className="text-2xl font-bold text-primary">
            R$ {price.toFixed(2)}
          </span>
          <span
            className={cn(
              "text-xs",
              isOutOfStock ? "text-destructive" : "text-muted-foreground"
            )}
          >
            {availabilityLabel}
          </span>
        </div>

        <Button
          size="icon"
          variant="default"
          onClick={handleAddToCart}
          className="h-10 w-10"
          disabled={disableAddButton}
        >
          <ShoppingCart className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Star } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/types/product";
import { useCart } from "@/contexts/CartContext";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { AspectRatio } from "@radix-ui/react-aspect-ratio";

interface ProductCardProps {
  product: Product;
  fallbackType?: string | null;
}

export const ProductCard = ({ product, fallbackType }: ProductCardProps) => {
  const { addItem, items } = useCart();
  const { name, origin, type, price, originalPrice, rating, categories } = product;

  // Prefer explicit product.type, otherwise fall back to the first category's type or name
  const rawType = type ?? fallbackType ?? categories?.[0]?.type ?? categories?.[0]?.name ?? null;

  // Normalize common category names so "Vinhos Tintos" or "Tintos" -> "Tinto"
  const displayType = rawType
    ? (() => {
        let t = String(rawType).trim();
        // remove common prefixes like "Vinhos "
        t = t.replace(/^vinhos\s+/i, "");
        // naive singularization: if ends with 's' (Portuguese plural), drop it
        if (t.length > 1 && /s$/i.test(t)) {
          t = t.slice(0, -1);
        }
        // capitalize first letter, leave rest as-is
        return t.charAt(0).toUpperCase() + t.slice(1);
      })()
    : null;

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
        "group overflow-hidden transition-all duration-300 border-border/50 hover:shadow-lg h-full flex flex-col",
        isOutOfStock && "opacity-70 grayscale"
      )}
    >
      <Link to={`/produto/${product.id}`}>
        {/* Image container with proper padding to show full image */}
        <div className="w-full">
          <div className="relative bg-white rounded-md flex items-center justify-center h-48 p-2">
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
              loading="lazy"
              className="max-h-full w-auto object-contain"
            />
            {/* Removed gradient overlay to keep clean white background */}
          </div>
        </div>
      </Link>

      <CardContent className="p-4 space-y-2 flex-1">
        {displayType && (
          <Badge variant="outline" className="text-xs">
            {displayType}
          </Badge>
        )}

        <Link to={`/produto/${product.id}`}>
          <h3 title={name} className="font-semibold text-base line-clamp-2 text-foreground group-hover:text-primary transition-colors">
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

      <CardFooter className="p-4 pt-0 flex items-center justify-between gap-3 mt-auto">
        <div className="flex flex-col min-w-0 flex-1">
          {hasOriginalPrice && (
            <span className="text-sm text-muted-foreground line-through">
              R$ {originalPrice.toFixed(2)}
            </span>
          )}
          <span className="text-xl md:text-2xl font-bold text-primary break-words">
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
          className="h-10 w-10 flex-shrink-0"
          disabled={disableAddButton}
        >
          <ShoppingCart className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

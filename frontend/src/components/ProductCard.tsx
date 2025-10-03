import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Star } from "lucide-react";
import { toast } from "sonner";
import { Product } from "@/data/products";
import { useCart } from "@/contexts/CartContext";
import { Link } from "react-router-dom";

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const { addItem } = useCart();
  const { name, origin, type, price, originalPrice, rating, image } = product;
  
  const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  const handleAddToCart = () => {
    addItem(product);
    toast.success("Produto adicionado ao carrinho!", {
      description: `${name} foi adicionado com sucesso.`
    });
  };

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 border-border/50">
      <Link to={`/produto/${product.id}`}>
        <div className="relative overflow-hidden aspect-[3/4] bg-muted">
          {discount > 0 && (
            <Badge className="absolute top-3 right-3 z-10 bg-secondary text-secondary-foreground font-bold">
              -{discount}%
            </Badge>
          )}
          <img 
            src={image} 
            alt={name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      </Link>
      
      <CardContent className="p-4 space-y-2">
        <Badge variant="outline" className="text-xs">{type}</Badge>
        
        <Link to={`/produto/${product.id}`}>
          <h3 className="font-semibold text-lg line-clamp-2 text-foreground group-hover:text-primary transition-colors">
            {name}
          </h3>
        </Link>
        
        <p className="text-sm text-muted-foreground">{origin}</p>
        
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              className={`h-4 w-4 ${i < rating ? "fill-secondary text-secondary" : "text-muted"}`}
            />
          ))}
          <span className="text-xs text-muted-foreground ml-1">({rating}.0)</span>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        <div className="flex flex-col">
          {originalPrice && (
            <span className="text-sm text-muted-foreground line-through">
              R$ {originalPrice.toFixed(2)}
            </span>
          )}
          <span className="text-2xl font-bold text-primary">
            R$ {price.toFixed(2)}
          </span>
        </div>
        
        <Button 
          size="icon"
          variant="default"
          onClick={handleAddToCart}
          className="h-10 w-10"
        >
          <ShoppingCart className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import type { Product } from "@/types/product";

interface CartItemProps {
  item: Product & { quantity: number };
}

export const CartItem = ({ item }: CartItemProps) => {
  const { updateQuantity, removeItem } = useCart();
  const originLabel = item.origin ?? "Origem não informada";

  return (
    <div className="flex gap-4 py-4 border-b border-border">
      <img
        src={item.image ?? item.primaryImage?.url ?? "https://placehold.co/200x200?text=Vinho"}
        alt={item.name}
        className="w-24 h-24 object-cover rounded-lg"
      />
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-semibold text-foreground">{item.name}</h3>
          <p className="text-sm text-muted-foreground">{originLabel}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => updateQuantity(item.id, item.quantity - 1)}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-8 text-center font-medium">{item.quantity}</span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => updateQuantity(item.id, item.quantity + 1)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="flex flex-col items-end justify-between">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => removeItem(item.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
        <div className="text-right">
          <p className="font-bold text-lg text-foreground">
            R$ {(item.price * item.quantity).toFixed(2)}
          </p>
          <p className="text-sm text-muted-foreground">
            R$ {item.price.toFixed(2)} cada
          </p>
        </div>
      </div>
    </div>
  );
};

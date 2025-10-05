import { createContext, useContext, useState, ReactNode } from "react";
import type { Product } from "@/types/product";

interface CartItem extends Product {
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (product: Product) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      const stock = product.stockQuantity;

      if (existing) {
        if (existing.quantity >= stock) {
          return prev;
        }

        return prev.map((item) =>
          item.id === product.id
            ? {
                ...item,
                stockQuantity: stock,
                quantity: Math.min(stock, item.quantity + 1),
              }
            : item
        );
      }

      if (stock <= 0) {
        return prev;
      }

      return [...prev, { ...product, stockQuantity: stock, quantity: 1 }];
    });
  };

  const removeItem = (productId: number) => {
    setItems((prev) => prev.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    setItems((prev) => {
      const target = prev.find((item) => item.id === productId);

      if (!target) {
        return prev;
      }

      const normalizedQuantity = Math.max(0, Math.min(quantity, target.stockQuantity));

      if (normalizedQuantity === 0) {
        return prev.filter((item) => item.id !== productId);
      }

      return prev.map((item) =>
        item.id === productId ? { ...item, quantity: normalizedQuantity } : item
      );
    });
  };

  const clearCart = () => {
    setItems([]);
  };

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
};

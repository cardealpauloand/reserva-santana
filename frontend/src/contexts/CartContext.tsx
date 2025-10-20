import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/contexts/AuthContext";
import { cartService } from "@/services/cart";
import type { CartProductItem } from "@/types/cart";
import type { Product } from "@/types/product";

type CartItem = CartProductItem;

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

const STORAGE_KEY = "reserva-santana:cart";

const clampQuantity = (quantity: number, stock?: number | null): number => {
  const safeQuantity = Math.max(0, Math.floor(quantity ?? 0));

  if (stock === undefined || stock === null) {
    return safeQuantity;
  }

  const safeStock = Math.max(0, Math.floor(stock));

  if (safeStock === 0) {
    return 0;
  }

  return Math.min(safeQuantity, safeStock);
};

const cloneCartItem = (item: CartItem): CartItem => ({
  ...item,
  categories: item.categories ? [...item.categories] : undefined,
  images: item.images ? item.images.map((image) => ({ ...image })) : undefined,
  primaryImage: item.primaryImage ? { ...item.primaryImage } : null,
});

const cloneCartItems = (items: CartItem[]) => items.map(cloneCartItem);

const mergeCartItems = (primary: CartItem[], secondary: CartItem[]): CartItem[] => {
  if (secondary.length === 0) {
    return cloneCartItems(primary);
  }

  const map = new Map<number, CartItem>();

  primary.forEach((item) => {
    map.set(item.id, cloneCartItem(item));
  });

  secondary.forEach((item) => {
    const existing = map.get(item.id);

    if (!existing) {
      map.set(item.id, cloneCartItem(item));
      return;
    }

    const referenceStock =
      existing.stockQuantity ??
      item.stockQuantity ??
      existing.quantity + item.quantity;

    const mergedQuantity = clampQuantity(
      existing.quantity + item.quantity,
      referenceStock
    );

    existing.quantity = mergedQuantity;
    existing.stockQuantity = Math.max(existing.stockQuantity ?? 0, item.stockQuantity ?? 0);

    if (!existing.image && item.image) {
      existing.image = item.image;
    }

    if (!existing.primaryImage && item.primaryImage) {
      existing.primaryImage = item.primaryImage ? { ...item.primaryImage } : null;
    }

    if (!existing.images && item.images) {
      existing.images = item.images.map((image) => ({ ...image }));
    }
  });

  return Array.from(map.values()).filter((item) => item.quantity > 0);
};

const toSyncPayload = (items: CartItem[]) =>
  items.map((item) => ({
    productId: item.id,
    quantity: clampQuantity(item.quantity, item.stockQuantity),
  }));

const readStoredCart = (): CartItem[] => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((item) => ({
        ...item,
        quantity: clampQuantity(Number(item.quantity ?? 0), item.stockQuantity),
        price: Number(item.price ?? 0),
      }))
      .filter(
        (item): item is CartItem =>
          typeof item === "object" &&
          item !== null &&
          typeof item.id === "number" &&
          item.quantity > 0
      );
  } catch (error) {
    console.error("Failed to parse stored cart", error);
    return [];
  }
};

const writeStoredCart = (items: CartItem[]) => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    if (!items.length) {
      window.localStorage.removeItem(STORAGE_KEY);
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error("Failed to persist cart locally", error);
  }
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const syncRequestIdRef = useRef(0);

  const loadCartForUser = useCallback(async (currentUser: typeof user) => {
    const storedItems = readStoredCart();

    if (!currentUser) {
      return cloneCartItems(storedItems);
    }

    try {
      const remoteCart = await cartService.getCart();
      let mergedItems = mergeCartItems(remoteCart.items, storedItems);

      if (storedItems.length > 0) {
        try {
          const synced = await cartService.syncCart(toSyncPayload(mergedItems));
          mergedItems = synced.items;
        } catch (syncError) {
          console.error("Failed to sync stored cart with server", syncError);
        }
      }

      const result = cloneCartItems(mergedItems);
      writeStoredCart(result);
      return result;
    } catch (error) {
      console.error("Failed to load remote cart", error);
      return cloneCartItems(storedItems);
    }
  }, []);

  useEffect(() => {
    let active = true;

    const hydrate = async () => {
      setIsHydrated(false);
      const loadedItems = await loadCartForUser(user);

      if (!active) {
        return;
      }

      setItems(loadedItems);
      setIsHydrated(true);
    };

    void hydrate();

    return () => {
      active = false;
    };
  }, [user, loadCartForUser]);

  const persistCart = useCallback(
    (nextItems: CartItem[]) => {
      writeStoredCart(nextItems);

      if (!user) {
        return;
      }

      const requestId = ++syncRequestIdRef.current;
      const payload = toSyncPayload(nextItems);

      (async () => {
        try {
          const response = await cartService.syncCart(payload);

          if (syncRequestIdRef.current !== requestId) {
            return;
          }

          const syncedItems = cloneCartItems(response.items);
          setItems(syncedItems);
          writeStoredCart(syncedItems);
        } catch (error) {
          console.error("Failed to sync cart with server", error);
        }
      })();
    },
    [user]
  );

  const updateItems = useCallback(
    (updater: (items: CartItem[]) => CartItem[]) => {
      if (!isHydrated) {
        return;
      }

      let nextItems: CartItem[] | null = null;

      setItems((prev) => {
        const updated = updater(prev);

        if (updated === prev) {
          nextItems = null;
          return prev;
        }

        nextItems = updated;
        return updated;
      });

      if (nextItems) {
        persistCart(nextItems);
      }
    },
    [isHydrated, persistCart]
  );

  const addItem = useCallback(
    (product: Product) => {
      updateItems((prev) => {
        const existing = prev.find((item) => item.id === product.id);

        if (existing) {
          const stockQuantity =
            product.stockQuantity ?? existing.stockQuantity ?? existing.quantity;
          const nextQuantity = clampQuantity(
            existing.quantity + 1,
            stockQuantity
          );

          if (nextQuantity === existing.quantity) {
            return prev;
          }

          return prev.map((item) =>
            item.id === product.id
              ? {
                  ...item,
                  quantity: nextQuantity,
                  stockQuantity,
                  price: product.price,
                  image: product.image ?? item.image,
                  primaryImage: product.primaryImage ?? item.primaryImage,
                  categories: product.categories ?? item.categories,
                }
              : item
          );
        }

        const initialQuantity = clampQuantity(1, product.stockQuantity);

        if (initialQuantity === 0) {
          return prev;
        }

        return [
          ...prev,
          {
            ...product,
            quantity: initialQuantity,
          },
        ];
      });
    },
    [updateItems]
  );

  const removeItem = useCallback(
    (productId: number) => {
      updateItems((prev) => {
        if (!prev.some((item) => item.id === productId)) {
          return prev;
        }

        return prev.filter((item) => item.id !== productId);
      });
    },
    [updateItems]
  );

  const updateQuantity = useCallback(
    (productId: number, quantity: number) => {
      updateItems((prev) => {
        const target = prev.find((item) => item.id === productId);

        if (!target) {
          return prev;
        }

        const normalizedQuantity = clampQuantity(quantity, target.stockQuantity);

        if (normalizedQuantity <= 0) {
          return prev.filter((item) => item.id !== productId);
        }

        if (normalizedQuantity === target.quantity) {
          return prev;
        }

        return prev.map((item) =>
          item.id === productId ? { ...item, quantity: normalizedQuantity } : item
        );
      });
    },
    [updateItems]
  );

  const clearCart = useCallback(() => {
    updateItems(() => []);
  }, [updateItems]);

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

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

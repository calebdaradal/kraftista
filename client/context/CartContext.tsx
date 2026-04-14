import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api } from "@/lib/api";

export interface CartItem {
  productId: string;
  quantity: number;
  selectedVariations: Record<string, string>; // variation id -> selected option
  price: number;
  image: string;
  name: string;
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  totalPrice: number;
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string, variations?: Record<string, string>) => void;
  updateQuantity: (
    productId: string,
    quantity: number,
    variations?: Record<string, string>
  ) => void;
  clearCart: () => void;
  getCartTotal: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    const stored = localStorage.getItem("craft_cart");
    return stored ? JSON.parse(stored) : [];
  });

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const saveCart = (newItems: CartItem[]) => {
    setItems(newItems);
    localStorage.setItem("craft_cart", JSON.stringify(newItems));
  };

  useEffect(() => {
    const token = localStorage.getItem("craft_customer_token");
    if (!token) return;
    api.customer
      .getCart(token)
      .then((cart) => {
        const mapped: CartItem[] = (cart.items ?? []).map((item: any) => ({
          productId: item.product_id,
          quantity: item.quantity,
          selectedVariations: item.selected_variations ?? {},
          price: Number(item.unit_price),
          image: item.image_url ?? "🛍️",
          name: item.product_name,
        }));
        saveCart(mapped);
      })
      .catch(() => {});
  }, []);

  const addToCart = (newItem: CartItem) => {
    const existingItemIndex = items.findIndex(
      (item) =>
        item.productId === newItem.productId &&
        JSON.stringify(item.selectedVariations) ===
          JSON.stringify(newItem.selectedVariations)
    );

    if (existingItemIndex > -1) {
      const updatedItems = [...items];
      updatedItems[existingItemIndex].quantity += newItem.quantity;
      saveCart(updatedItems);
    } else {
      saveCart([...items, newItem]);
    }
    const token = localStorage.getItem("craft_customer_token");
    if (token) {
      api.customer
        .upsertCartItem(
          {
            product_id: newItem.productId,
            quantity: newItem.quantity,
            selected_variations: newItem.selectedVariations,
            unit_price: newItem.price,
            image_url: newItem.image,
            product_name: newItem.name,
          },
          token
        )
        .catch(() => {});
    }
  };

  const removeFromCart = (
    productId: string,
    variations?: Record<string, string>
  ) => {
    const updatedItems = items.filter((item) => {
      if (item.productId !== productId) return true;
      if (!variations) return false;
      return (
        JSON.stringify(item.selectedVariations) !== JSON.stringify(variations)
      );
    });
    saveCart(updatedItems);
  };

  const updateQuantity = (
    productId: string,
    quantity: number,
    variations?: Record<string, string>
  ) => {
    const updatedItems = items.map((item) => {
      if (item.productId === productId) {
        if (
          variations &&
          JSON.stringify(item.selectedVariations) !==
            JSON.stringify(variations)
        ) {
          return item;
        }
        return { ...item, quantity: Math.max(0, quantity) };
      }
      return item;
    });
    saveCart(updatedItems.filter((item) => item.quantity > 0));
    const token = localStorage.getItem("craft_customer_token");
    if (token) {
      const item = items.find(
        (i) => i.productId === productId && JSON.stringify(i.selectedVariations) === JSON.stringify(variations ?? {})
      );
      if (item) {
        api.customer
          .upsertCartItem(
            {
              product_id: item.productId,
              quantity: Math.max(0, quantity),
              selected_variations: item.selectedVariations,
              unit_price: item.price,
              image_url: item.image,
              product_name: item.name,
            },
            token
          )
          .catch(() => {});
      }
    }
  };

  const clearCart = () => {
    saveCart([]);
  };

  const getCartTotal = () => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        totalPrice,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

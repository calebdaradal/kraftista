import { createContext, useContext, useState, ReactNode } from "react";

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

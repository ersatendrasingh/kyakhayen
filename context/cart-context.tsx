"use client";

import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { CartItem } from "@/types/cart-item";

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  updateQuantityInCart: (id: string, newQuantity: number) => void;
  removeFromCart: (id: string) => void;
  emptyCart: () => void;
}

const CartContext = createContext<CartContextType>({
  cartItems: [],
  addToCart: () => {},
  updateQuantityInCart: () => {},
  removeFromCart: () => {},
  emptyCart: () => {},
});

export const useCart = () => useContext(CartContext);

export const CartProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  useEffect(() => {
    const localStorageCartItems = localStorage.getItem("cartItems");
    if (localStorageCartItems) {
      setCartItems(JSON.parse(localStorageCartItems));
    }
  }, [setCartItems]);

  const addToCart = (item: CartItem) => {
    const existingCartItemsJSON = localStorage.getItem("cartItems");
    const existingCartItems: CartItem[] = existingCartItemsJSON
      ? JSON.parse(existingCartItemsJSON)
      : [];

    const existingItemIndex = existingCartItems.findIndex(
      (cartItem) => cartItem.id === item.id
    );

    if (existingItemIndex !== -1) {
      existingCartItems[existingItemIndex].quantity += item.quantity;
    } else {
      existingCartItems.push(item);
    }
    localStorage.setItem("cartItems", JSON.stringify(existingCartItems));
    setCartItems(existingCartItems);
  };
  const updateQuantityInCart = (id: string, newQuantity: number) => {
    const existingCartItemsJSON = localStorage.getItem("cartItems");
    const existingCartItems: CartItem[] = existingCartItemsJSON
      ? JSON.parse(existingCartItemsJSON)
      : [];
    const updatedQuantity = Math.max(newQuantity, 1);
    const itemIndex = existingCartItems.findIndex((item) => item.id === id);

    if (itemIndex === -1) {
      return;
    }
    const updatedCartItems = [...existingCartItems];

    updatedCartItems[itemIndex].quantity = updatedQuantity;
    setCartItems(updatedCartItems);
    localStorage.setItem("cartItems", JSON.stringify(updatedCartItems));
  };

  const removeFromCart = (id: string) => {
    const existingCartItemsJSON = localStorage.getItem("cartItems");
    const existingCartItems: CartItem[] = existingCartItemsJSON
      ? JSON.parse(existingCartItemsJSON)
      : [];
    const updatedCartItems = existingCartItems.filter((item) => item.id !== id);
    setCartItems(updatedCartItems);
    localStorage.setItem("cartItems", JSON.stringify(updatedCartItems));
  };

  const emptyCart = () => {
    setCartItems([]); // Clear the cart items from state
    localStorage.removeItem("cartItems"); // Remove cart items from localStorage
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQuantityInCart,
        removeFromCart,
        emptyCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

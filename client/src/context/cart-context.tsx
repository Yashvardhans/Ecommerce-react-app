import { createContext, ReactNode, useCallback, useEffect, useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";

interface CartItem {
  id: number;
  productId: number;
  quantity: number;
  product: {
    id: number;
    name: string;
    slug: string;
    price: string;
    image: string;
  };
}

interface CartContextType {
  cartItems: CartItem[];
  cartItemsCount: number;
  cartTotal: number;
  isLoading: boolean;
  addToCart: (item: { productId: number; quantity: number }) => Promise<void>;
  updateCartItemQuantity: (id: number, quantity: number) => Promise<void>;
  removeFromCart: (id: number) => Promise<void>;
  clearCart: () => void;
}

export const CartContext = createContext<CartContextType>({
  cartItems: [],
  cartItemsCount: 0,
  cartTotal: 0,
  isLoading: false,
  addToCart: async () => {},
  updateCartItemQuantity: async () => {},
  removeFromCart: async () => {},
  clearCart: () => {},
});

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useAuth();
  
  const cartItemsCount = cartItems.reduce((count, item) => count + item.quantity, 0);
  const cartTotal = cartItems.reduce(
    (total, item) => total + parseFloat(item.product.price) * item.quantity, 
    0
  );
  
  // Load cart from server or localStorage
  const loadCart = useCallback(async () => {
    setIsLoading(true);
    try {
      if (isAuthenticated) {
        // Load from server if authenticated
        const response = await fetch("/api/cart", {
          credentials: "include",
        });
        
        if (response.ok) {
          const data = await response.json();
          setCartItems(data);
        }
      } else {
        // Load from localStorage if not authenticated
        const storedCart = localStorage.getItem("cart");
        if (storedCart) {
          setCartItems(JSON.parse(storedCart));
        }
      }
    } catch (error) {
      console.error("Failed to load cart", error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);
  
  // Initialize cart
  useEffect(() => {
    loadCart();
  }, [loadCart]);
  
  // Save cart to localStorage when it changes (for guests)
  useEffect(() => {
    if (!isAuthenticated && cartItems.length > 0) {
      localStorage.setItem("cart", JSON.stringify(cartItems));
    }
  }, [cartItems, isAuthenticated]);
  
  const addToCart = async (item: { productId: number; quantity: number }) => {
    setIsLoading(true);
    try {
      if (isAuthenticated) {
        // Add to server cart if authenticated
        const response = await apiRequest("POST", "/api/cart", item);
        const updatedCart = await response.json();
        setCartItems(updatedCart);
      } else {
        // Add to local cart if not authenticated
        // First, fetch product details
        const productResponse = await fetch(`/api/products/${item.productId}`);
        if (!productResponse.ok) throw new Error("Product not found");
        
        const product = await productResponse.json();
        
        // Check if item is already in cart
        const existingItemIndex = cartItems.findIndex(
          (cartItem) => cartItem.productId === item.productId
        );
        
        if (existingItemIndex !== -1) {
          // Update quantity if item exists
          const updatedItems = [...cartItems];
          updatedItems[existingItemIndex].quantity += item.quantity;
          setCartItems(updatedItems);
        } else {
          // Add new item if it doesn't exist
          const newItem: CartItem = {
            id: Date.now(), // Use timestamp as temporary ID
            productId: item.productId,
            quantity: item.quantity,
            product: {
              id: product.id,
              name: product.name,
              slug: product.slug,
              price: product.price,
              image: product.image,
            },
          };
          
          setCartItems((prevItems) => [...prevItems, newItem]);
        }
      }
    } catch (error) {
      console.error("Failed to add item to cart", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const updateCartItemQuantity = async (id: number, quantity: number) => {
    setIsLoading(true);
    try {
      if (isAuthenticated) {
        // Update on server if authenticated
        const response = await apiRequest("PUT", `/api/cart/${id}`, { quantity });
        const updatedCart = await response.json();
        setCartItems(updatedCart);
      } else {
        // Update locally if not authenticated
        const updatedItems = cartItems.map((item) =>
          item.id === id ? { ...item, quantity } : item
        );
        setCartItems(updatedItems);
      }
    } catch (error) {
      console.error("Failed to update cart item", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const removeFromCart = async (id: number) => {
    setIsLoading(true);
    try {
      if (isAuthenticated) {
        // Remove from server if authenticated
        const response = await apiRequest("DELETE", `/api/cart/${id}`);
        const updatedCart = await response.json();
        setCartItems(updatedCart);
      } else {
        // Remove locally if not authenticated
        const updatedItems = cartItems.filter((item) => item.id !== id);
        setCartItems(updatedItems);
        
        if (updatedItems.length === 0) {
          localStorage.removeItem("cart");
        }
      }
    } catch (error) {
      console.error("Failed to remove item from cart", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem("cart");
  };
  
  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartItemsCount,
        cartTotal,
        isLoading,
        addToCart,
        updateCartItemQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

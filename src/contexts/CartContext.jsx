import React, { createContext, useContext, useReducer, useEffect } from "react";
import { useAuth } from "./AuthContext";
import API_URL from "../config/api.js";

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case "LOAD_CART":
      return action.payload;

    case "SET_LOADING":
      return { ...state, loading: action.payload };

    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const { user, loading: authLoading, checkAuth } = useAuth();
  const [cart, dispatch] = useReducer(cartReducer, {
    items: [],
    total: 0,
    loading: false,
  });

  useEffect(() => {
    // Wait for auth to finish loading before checking user
    if (authLoading) return;
    
    if (user) {
      loadCart();
    } else {
      dispatch({ type: "LOAD_CART", payload: { items: [], total: 0 } });
    }
  }, [user, authLoading]);

  const loadCart = async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      
      // Get token from localStorage as fallback
      let storedToken = localStorage.getItem("auth_token");
      if (storedToken) {
        storedToken = storedToken.trim();
        // Remove invalid tokens
        if (!storedToken || storedToken === "authenticated") {
          localStorage.removeItem("auth_token");
          storedToken = null;
        }
      }
      
      const headers = {};
      if (storedToken) {
        headers["Authorization"] = `Bearer ${storedToken}`;
      }

      const response = await fetch(`${API_URL}/cart`, {
        method: "GET",
        headers,
        credentials: "include", // Include cookies
      });

      if (response.ok) {
        const data = await response.json();
        dispatch({
          type: "LOAD_CART",
          payload: {
            items: data.cart.items || [],
            total: data.cart.total || 0,
          },
        });
      } else if (response.status === 401) {
        // Clear invalid token
        localStorage.removeItem("auth_token");
        dispatch({ type: "LOAD_CART", payload: { items: [], total: 0 } });
      }
    } catch (error) {
      console.error("Failed to load cart:", error);
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const addToCart = async (product) => {
    try {
      // Wait for auth to finish loading
      if (authLoading) {
        throw new Error("Please wait, authentication is loading...");
      }

      if (!user) {
        throw new Error("Please login to add items to cart");
      }

      // Get token from localStorage as fallback
      let storedToken = localStorage.getItem("auth_token");
      if (storedToken) {
        storedToken = storedToken.trim();
        // Remove invalid tokens
        if (!storedToken || storedToken === "authenticated") {
          localStorage.removeItem("auth_token");
          storedToken = null;
        }
      }
      
      const headers = {
        "Content-Type": "application/json",
      };
      if (storedToken) {
        headers["Authorization"] = `Bearer ${storedToken}`;
      }

      const response = await fetch(`${API_URL}/cart/add`, {
        method: "POST",
        headers,
        credentials: "include", // Include cookies
        body: JSON.stringify({ product }),
      });

      // Check response status before parsing JSON
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { error: "Failed to add to cart" };
        }
        
        if (response.status === 401) {
          // Session expired - clear invalid token and refresh auth state
          localStorage.removeItem("auth_token");
          if (checkAuth) {
            await checkAuth();
          }
          const errorMessage = errorData.error || "Session expired. Please login again.";
          throw new Error(errorMessage);
        }
        throw new Error(errorData.error || "Failed to add to cart");
      }

      const data = await response.json();

      dispatch({
        type: "LOAD_CART",
        payload: {
          items: data.cart.items || [],
          total: data.cart.total || 0,
        },
      });
    } catch (error) {
      console.error("Failed to add to cart:", error);
      throw error;
    }
  };

  const removeFromCart = async (productId) => {
    try {
      // Get token from localStorage as fallback
      let storedToken = localStorage.getItem("auth_token");
      if (storedToken) {
        storedToken = storedToken.trim();
        // Remove invalid tokens
        if (!storedToken || storedToken === "authenticated") {
          localStorage.removeItem("auth_token");
          storedToken = null;
        }
      }
      
      const headers = {
        "Content-Type": "application/json",
      };
      if (storedToken) {
        headers["Authorization"] = `Bearer ${storedToken}`;
      }

      const response = await fetch(`${API_URL}/cart/remove`, {
        method: "DELETE",
        headers,
        credentials: "include", // Include cookies
        body: JSON.stringify({ productId }),
      });

      const data = await response.json();

      if (response.ok) {
        dispatch({
          type: "LOAD_CART",
          payload: {
            items: data.cart.items || [],
            total: data.cart.total || 0,
          },
        });
      }
    } catch (error) {
      console.error("Failed to remove from cart:", error);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      // Get token from localStorage as fallback
      let storedToken = localStorage.getItem("auth_token");
      if (storedToken) {
        storedToken = storedToken.trim();
        // Remove invalid tokens
        if (!storedToken || storedToken === "authenticated") {
          localStorage.removeItem("auth_token");
          storedToken = null;
        }
      }
      
      const headers = {
        "Content-Type": "application/json",
      };
      if (storedToken) {
        headers["Authorization"] = `Bearer ${storedToken}`;
      }

      const response = await fetch(`${API_URL}/cart/update`, {
        method: "PUT",
        headers,
        credentials: "include", // Include cookies
        body: JSON.stringify({ productId, quantity }),
      });

      const data = await response.json();

      if (response.ok) {
        dispatch({
          type: "LOAD_CART",
          payload: {
            items: data.cart.items || [],
            total: data.cart.total || 0,
          },
        });
      }
    } catch (error) {
      console.error("Failed to update cart:", error);
    }
  };

  const clearCart = async () => {
    try {
      // Get token from localStorage as fallback
      const storedToken = localStorage.getItem("auth_token");
      const headers = {};
      if (storedToken) {
        headers["Authorization"] = `Bearer ${storedToken}`;
      }

      const response = await fetch(`${API_URL}/cart/clear`, {
        method: "DELETE",
        headers,
        credentials: "include", // Include cookies
      });

      if (response.ok) {
        dispatch({
          type: "LOAD_CART",
          payload: { items: [], total: 0 },
        });
      }
    } catch (error) {
      console.error("Failed to clear cart:", error);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart: {
          ...cart,
          total: cart.items.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          ),
        },
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        loadCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

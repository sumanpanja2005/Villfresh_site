import React, { createContext, useContext, useState, useEffect } from "react";

const API_URL = "http://localhost:5000/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Get token from localStorage as fallback
      let storedToken = localStorage.getItem("auth_token");
      
      // Trim and validate token
      if (storedToken) {
        storedToken = storedToken.trim();
        // Remove token if it's empty or invalid format
        if (!storedToken || storedToken === "authenticated") {
          localStorage.removeItem("auth_token");
          storedToken = null;
        }
      }
      
      const headers = {};
      if (storedToken) {
        headers["Authorization"] = `Bearer ${storedToken}`;
      }

      const response = await fetch(`${API_URL}/auth/me`, {
        method: "GET",
        headers,
        credentials: "include", // Important: include cookies
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        if (storedToken) {
          setToken(storedToken);
        } else {
          setToken("authenticated");
        }
      } else if (response.status === 401) {
        // Clear stored token if auth fails
        localStorage.removeItem("auth_token");
        setUser(null);
        setToken(null);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      localStorage.removeItem("auth_token");
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Important: include cookies
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      setUser(data.user);
      // Store token in localStorage as fallback if cookies don't work
      if (data.token && typeof data.token === 'string' && data.token.trim()) {
        const cleanToken = data.token.trim();
        localStorage.setItem("auth_token", cleanToken);
        setToken(cleanToken);
      } else {
        setToken("authenticated"); // Just mark as authenticated
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const signup = async (name, email, phone, password) => {
    try {
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Important: include cookies
        body: JSON.stringify({ name, email, phone, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Signup failed");
      }

      setUser(data.user);
      // Store token in localStorage as fallback if cookies don't work
      if (data.token && typeof data.token === 'string' && data.token.trim()) {
        const cleanToken = data.token.trim();
        localStorage.setItem("auth_token", cleanToken);
        setToken(cleanToken);
      } else {
        setToken("authenticated"); // Just mark as authenticated
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      // Get token for Authorization header
      const storedToken = localStorage.getItem("auth_token");
      const headers = {};
      if (storedToken) {
        headers["Authorization"] = `Bearer ${storedToken}`;
      }

      // Call logout endpoint to clear cookie on server
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        headers,
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear stored token
      localStorage.removeItem("auth_token");
      setUser(null);
      setToken(null);
    }
  };

  const updateProfile = async (updatedData) => {
    try {
      // Get token from localStorage as fallback
      const storedToken = localStorage.getItem("auth_token");
      const headers = {
        "Content-Type": "application/json",
      };
      if (storedToken) {
        headers["Authorization"] = `Bearer ${storedToken}`;
      }

      // Remove profilePicture from updatedData if it exists
      const { profilePicture, ...dataToSend } = updatedData;

      const response = await fetch(`${API_URL}/auth/profile`, {
        method: "PUT",
        headers,
        credentials: "include", // Important: include cookies
        body: JSON.stringify(dataToSend),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Update failed");
      }

      setUser(data.user);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const getToken = () => {
    return token;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        updateProfile,
        loading,
        getToken,
        checkAuth, // Expose checkAuth to allow refreshing auth state
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

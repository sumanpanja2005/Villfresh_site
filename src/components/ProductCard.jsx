import React, { useState } from "react";
import { ShoppingCart, Star } from "lucide-react";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleAddToCart = async () => {
    // Wait for auth to finish loading
    if (authLoading) {
      alert("Please wait, checking authentication...");
      return;
    }

    if (!user) {
      navigate("/login");
      return;
    }

    setLoading(true);
    try {
      await addToCart(product);
    } catch (error) {
      const errorMessage = error.message || "Failed to add to cart";
      alert(errorMessage);
      
      // If session expired, redirect to login
      if (errorMessage.includes("Session expired") || errorMessage.includes("Invalid token")) {
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="aspect-w-16 aspect-h-9 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
        />
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          {product.name}
        </h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {product.description}
        </p>

        <div className="flex items-center justify-between mb-3">
          <span className="text-2xl font-bold text-green-600">
            ₹{product.price}
          </span>
          {product.weight && (
            <span className="text-sm text-gray-500">{product.weight}</span>
          )}
        </div>

        <div className="flex items-center mb-3">
          <div className="flex items-center space-x-1 text-yellow-500">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-current" />
            ))}
          </div>
          <span className="text-sm text-gray-600 ml-2">(4.8)</span>
        </div>

        {product.benefits && product.benefits.length > 0 && (
          <div className="mb-3">
            <p className="text-sm text-gray-600 mb-1">Benefits:</p>
            <div className="flex flex-wrap gap-1">
              {product.benefits.slice(0, 2).map((benefit, index) => (
                <span
                  key={index}
                  className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full"
                >
                  {benefit}
                </span>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={handleAddToCart}
          disabled={loading}
          className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          <ShoppingCart className="h-4 w-4" />
          <span>{loading ? "Adding..." : "Add to Cart"}</span>
        </button>
      </div>
    </div>
  );
};

export default ProductCard;

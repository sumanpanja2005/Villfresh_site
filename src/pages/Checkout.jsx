import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CreditCard, Truck, MapPin, Phone, Mail, User } from "lucide-react";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import API_URL from "../config/api.js";

const Checkout = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    paymentMethod: "upi",
    upiApp: "", // Selected UPI app (phonepe, googlepay, paytm, etc.)
    upiId: "", // Optional UPI ID if user wants to specify
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Validate form
      if (
        !formData.fullName ||
        !formData.phone ||
        !formData.address ||
        !formData.city ||
        !formData.state ||
        !formData.pincode
      ) {
        setError("Please fill in all required fields");
        setLoading(false);
        return;
      }

      if (formData.paymentMethod === "upi" && !formData.upiApp) {
        setError("Please select a UPI app");
        setLoading(false);
        return;
      }

      if (!user) {
        setError("Please login to place an order");
        setLoading(false);
        return;
      }

      // Check if cart is empty
      if (!cart.items || cart.items.length === 0) {
        setError("Your cart is empty");
        setLoading(false);
        return;
      }

      // Create order via API
      const response = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include cookies
        body: JSON.stringify({
          items: cart.items.map((item) => ({
            id: item.productId || item.id,
            name: item.name,
            image: item.image,
            price: item.price,
            quantity: item.quantity,
          })),
          shippingAddress: {
            fullName: formData.fullName,
            email: formData.email || user.email || "",
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            pincode: formData.pincode,
          },
          paymentMethod: formData.paymentMethod,
          upiApp: formData.paymentMethod === "upi" ? formData.upiApp : null,
          upiId: formData.paymentMethod === "upi" ? formData.upiId : null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle out of stock errors
        if (data.outOfStockItems) {
          setError(
            `Some products are out of stock: ${data.outOfStockItems.join(", ")}`
          );
        } else {
          setError(data.error || "Order placement failed");
        }
        setLoading(false);
        return;
      }

      // For COD orders, clear cart and navigate to success
      if (data.requiresPayment === false) {
        await clearCart();
        navigate("/order-success", { state: { order: data.order } });
        return;
      }

      // For UPI payments, navigate to payment processing page
      if (data.requiresPayment === true && data.order) {
        // Store order ID and payment details
        sessionStorage.setItem("pendingOrderId", data.order._id);
        if (data.paymentUrl) {
          sessionStorage.setItem("paymentUrl", data.paymentUrl);
        }
        if (data.qrCode) {
          sessionStorage.setItem("paymentQrCode", data.qrCode);
        }
        
        // Clear cart before redirecting
        await clearCart();
        
        // Navigate to payment processing page
        navigate("/payment-process", { state: { order: data.order } });
        return;
      }

      // Fallback: navigate to success page
      await clearCart();
      navigate("/order-success", { state: { order: data.order } });
    } catch (err) {
      console.error("Order placement error:", err);
      setError(err.message || "Order placement failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = cart.total + Math.round(cart.total * 0.05);

  return (
    <div className="min-h-screen py-8 bg-gray-50">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Shipping Information */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <Truck className="h-5 w-5 mr-2" />
                  Shipping Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      PIN Code *
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                      rows="3"
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Enter your complete address"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State *
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Payment Method
                </h2>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      id="upi"
                      name="paymentMethod"
                      value="upi"
                      checked={formData.paymentMethod === "upi"}
                      onChange={handleChange}
                      className="h-4 w-4 text-green-600"
                    />
                    <label
                      htmlFor="upi"
                      className="text-sm font-medium text-gray-700"
                    >
                      UPI Payment
                    </label>
                  </div>

                  {formData.paymentMethod === "upi" && (
                    <div className="ml-7 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Select UPI App *
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {[
                            { id: "phonepe", name: "PhonePe", icon: "📱" },
                            { id: "googlepay", name: "Google Pay", icon: "💳" },
                            { id: "paytm", name: "Paytm", icon: "💵" },
                            { id: "bhim", name: "BHIM UPI", icon: "🏦" },
                          ].map((app) => (
                            <button
                              key={app.id}
                              type="button"
                              onClick={() =>
                                setFormData({ ...formData, upiApp: app.id })
                              }
                              className={`p-3 border-2 rounded-lg text-center transition-colors ${
                                formData.upiApp === app.id
                                  ? "border-green-600 bg-green-50"
                                  : "border-gray-300 hover:border-green-400"
                              }`}
                            >
                              <div className="text-2xl mb-1">{app.icon}</div>
                              <div className="text-xs font-medium">{app.name}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          UPI ID (Optional)
                        </label>
                        <input
                          type="text"
                          name="upiId"
                          value={formData.upiId}
                          onChange={handleChange}
                          placeholder="Enter your UPI ID (e.g., name@paytm)"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Leave empty to use selected app's default UPI ID
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      id="cod"
                      name="paymentMethod"
                      value="cod"
                      checked={formData.paymentMethod === "cod"}
                      onChange={handleChange}
                      className="h-4 w-4 text-green-600"
                    />
                    <label
                      htmlFor="cod"
                      className="text-sm font-medium text-gray-700"
                    >
                      Cash on Delivery
                    </label>
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                  {error}
                </div>
              )}
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

              <div className="space-y-3 mb-4">
                {cart.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center"
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div>
                        <p className="text-sm font-medium">{item.name}</p>
                        <p className="text-xs text-gray-600">
                          Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-medium">
                      ₹{item.price * item.quantity}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>₹{cart.total}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax</span>
                  <span>₹{Math.round(cart.total * 0.05)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total</span>
                  <span>₹{totalAmount}</span>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors mt-6 disabled:opacity-50"
              >
                {loading ? "Processing..." : `Place Order (₹${totalAmount})`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

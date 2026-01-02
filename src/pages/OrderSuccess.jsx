import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  CheckCircle,
  Package,
  Truck,
  Calendar,
  ArrowRight,
  Loader,
  XCircle,
} from "lucide-react";

const API_URL = "http://localhost:5000/api";

const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [order, setOrder] = useState(location.state?.order);
  const [loading, setLoading] = useState(false);
  const [checkingPayment, setCheckingPayment] = useState(false);

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);

    // Check if there's a pending order ID in sessionStorage (from payment redirect)
    const pendingOrderId = sessionStorage.getItem("pendingOrderId");
    
    if (pendingOrderId && !order) {
      // Fetch order details
      fetchOrderDetails(pendingOrderId);
      sessionStorage.removeItem("pendingOrderId");
    } else if (order && order.paymentStatus === "pending" && order.paymentMethod === "upi") {
      // If order exists but payment is pending, check payment status
      checkPaymentStatus();
    }
  }, []);

  const fetchOrderDetails = async (orderId) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/orders/${orderId}`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch order details");
      }

      const data = await response.json();
      setOrder(data.order);
      
      // If payment is still pending, check status
      if (data.order.paymentStatus === "pending" && data.order.paymentMethod === "upi") {
        checkPaymentStatusForOrder(data.order._id);
      }
    } catch (error) {
      console.error("Error fetching order:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkPaymentStatus = () => {
    if (!order || !order._id) return;
    checkPaymentStatusForOrder(order._id);
  };

  const checkPaymentStatusForOrder = async (orderId) => {
    try {
      setCheckingPayment(true);
      const response = await fetch(`${API_URL}/orders/${orderId}/payment-status`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to check payment status");
      }

      const data = await response.json();
      
      // IMPORTANT: Frontend NEVER decides payment success
      // Only update order with status from backend
      // Backend verifies payment through webhook, frontend only displays
      if (data.order) {
        setOrder(data.order);
      }
    } catch (error) {
      console.error("Error checking payment status:", error);
    } finally {
      setCheckingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-12 w-12 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Order not found
          </h2>
          <Link
            to="/"
            className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  const isPaymentPending = order.paymentStatus === "pending" && order.paymentMethod === "upi";
  const isPaymentFailed = order.paymentStatus === "failed";
  const isPaymentPaid = order.paymentStatus === "paid";

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            {isPaymentPaid ? (
              <>
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-16 w-16 text-green-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                  Order Confirmed!
                </h1>
                <p className="text-gray-600">
                  Payment successful! Thank you for your order. Your organic products will be delivered soon.
                </p>
              </>
            ) : isPaymentPending ? (
              <>
                <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  {checkingPayment ? (
                    <Loader className="h-16 w-16 text-yellow-600 animate-spin" />
                  ) : (
                    <Package className="h-16 w-16 text-yellow-600" />
                  )}
                </div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                  Payment Pending
                </h1>
                <p className="text-gray-600">
                  {checkingPayment
                    ? "Checking payment status..."
                    : "Your order has been created. Please complete the payment to confirm your order."}
                </p>
                {!checkingPayment && (
                  <button
                    onClick={checkPaymentStatus}
                    className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                  >
                    Check Payment Status
                  </button>
                )}
              </>
            ) : isPaymentFailed ? (
              <>
                <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <XCircle className="h-16 w-16 text-red-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                  Payment Failed
                </h1>
                <p className="text-gray-600">
                  Your payment could not be processed. Please try again or contact support.
                </p>
              </>
            ) : (
              <>
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-16 w-16 text-green-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                  Order Confirmed!
                </h1>
                <p className="text-gray-600">
                  Thank you for your order. Your organic products will be delivered soon.
                </p>
              </>
            )}
          </div>

          {/* Order Details */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Order Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-600">Order ID</p>
                <p className="font-semibold">#{order._id || order.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Order Date</p>
                <p className="font-semibold">
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="font-semibold text-green-600">₹{order.total}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Payment Method</p>
                <p className="font-semibold capitalize">
                  {order.paymentMethod === "upi"
                    ? "UPI Payment"
                    : "Cash on Delivery"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Payment Status</p>
                <p
                  className={`font-semibold ${
                    order.paymentStatus === "paid"
                      ? "text-green-600"
                      : order.paymentStatus === "failed"
                      ? "text-red-600"
                      : "text-yellow-600"
                  }`}
                >
                  {order.paymentStatus === "paid"
                    ? "Paid"
                    : order.paymentStatus === "failed"
                    ? "Failed"
                    : "Pending"}
                </p>
              </div>
            </div>

            {/* Order Items */}
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Items Ordered</h3>
              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div key={item.productId || item.id || index} className="flex items-center space-x-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-600">
                        ₹{item.price} × {item.quantity}
                      </p>
                    </div>
                    <span className="font-semibold">
                      ₹{item.price * item.quantity}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Delivery Information */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Delivery Information</h2>

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Package className="h-5 w-5 text-green-600 mt-1" />
                <div>
                  <p className="font-medium">Shipping Address</p>
                  <p className="text-sm text-gray-600">
                    {order.shippingAddress.fullName}
                    <br />
                    {order.shippingAddress.address}
                    <br />
                    {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                    - {order.shippingAddress.pincode}
                    <br />
                    {order.shippingAddress.phone}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Calendar className="h-5 w-5 text-green-600 mt-1" />
                <div>
                  <p className="font-medium">Estimated Delivery</p>
                  <p className="text-sm text-gray-600">
                    {new Date(order.estimatedDelivery).toLocaleDateString()}
                    (3-5 business days)
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Truck className="h-5 w-5 text-green-600 mt-1" />
                <div>
                  <p className="font-medium">Delivery Status</p>
                  <p className="text-sm text-gray-600">
                    Order confirmed and being prepared for shipment
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-green-50 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-green-800 mb-3">
              What's Next?
            </h2>
            <div className="space-y-2 text-sm text-green-700">
              <div className="flex items-center space-x-2">
                <ArrowRight className="h-4 w-4" />
                <span>We'll prepare your order with care</span>
              </div>
              <div className="flex items-center space-x-2">
                <ArrowRight className="h-4 w-4" />
                <span>You'll receive a tracking notification once shipped</span>
              </div>
              <div className="flex items-center space-x-2">
                <ArrowRight className="h-4 w-4" />
                <span>Your organic products will be delivered fresh</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/dashboard"
              className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors text-center"
            >
              View Order History
            </Link>
            <Link
              to="/products"
              className="flex-1 border border-green-600 text-green-600 py-3 px-6 rounded-lg font-semibold hover:bg-green-50 transition-colors text-center"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;

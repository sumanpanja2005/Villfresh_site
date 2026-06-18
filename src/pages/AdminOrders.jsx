import React, { useState, useEffect } from "react";
import {
  CheckCircle2,
  Package,
  User,
  CreditCard,
  MapPin,
  Calendar,
  Eye,
  EyeOff,
  XCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import API_URL from "../config/api.js";

const AdminOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [cancellingOrderId, setCancellingOrderId] = useState(null);

  useEffect(() => {
    if (user && user.role === "admin") {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/orders`, {
        credentials: "include",
      });
      const data = await response.json();

      if (response.ok) {
        setOrders(data.orders || []);
      } else {
        console.error("Failed to fetch orders:", data.error);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkCompleted = async (orderId) => {
    if (
      !window.confirm(
        "Are you sure you want to mark this order as delivery completed?"
      )
    ) {
      return;
    }

    try {
      setUpdatingOrderId(orderId);
      const response = await fetch(
        `${API_URL}/orders/${orderId}/delivery-complete`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        // Update the order in the local state immediately
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === orderId
              ? {
                  ...order,
                  deliveryStatus: "completed",
                  deliveredAt: data.order.deliveredAt,
                  paymentStatus: data.order.paymentStatus, // Update payment status (for COD orders)
                }
              : order
          )
        );
      } else {
        alert(data.error || "Failed to mark order as completed");
      }
    } catch (error) {
      console.error("Failed to mark order as completed:", error);
      alert("Failed to mark order as completed. Please try again.");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (
      !window.confirm(
        "Are you sure you want to cancel this order? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      setCancellingOrderId(orderId);

      const response = await fetch(`${API_URL}/orders/${orderId}/cancel`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to cancel order");
      }

      // Update state exactly like delivery completion
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId
            ? {
                ...order,
                status: "cancelled",
                deliveryStatus: "cancelled",
                cancelledAt: data.order.cancelledAt,
                paymentStatus: data.order.paymentStatus,
              }
            : order
        )
      );
    } catch (error) {
      console.error("Failed to cancel order:", error);
      alert(error.message);
    } finally {
      setCancellingOrderId(null);
    }
  };

  const toggleOrderDetails = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800",
      shipped: "bg-purple-100 text-purple-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      paid: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
      refunded: "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  // Check if user is admin
  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Access Denied
          </h2>
          <p className="text-gray-600">
            You need admin privileges to access this page.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Navigation Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <div className="flex space-x-4">
            <Link
              to="/admin"
              className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              Products Management
            </Link>
            <Link
              to="/admin/orders"
              className="px-4 py-2 text-sm font-medium text-green-600 border-b-2 border-green-600"
            >
              Orders Management
            </Link>
          </div>
        </div>

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Orders Management
          </h1>
          <div className="text-sm text-gray-600">
            Total Orders: <span className="font-semibold">{orders.length}</span>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              No Orders Found
            </h2>
            <p className="text-gray-600">
              There are no orders to display at the moment.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order._id}
                className={`bg-white rounded-lg shadow-md overflow-hidden ${
                  order.status === "cancelled"
                    ? "border-2 border-red-300 bg-red-50"
                    : ""
                }`}
              >
                {/* Order Header */}
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 flex-wrap">
                        <div>
                          <span className="text-sm text-gray-500">
                            Order ID:
                          </span>
                          <span className="ml-2 font-semibold text-gray-900">
                            #{order._id.toString().slice(-8).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">
                            Customer:
                          </span>
                          <span className="ml-2 font-medium text-gray-900">
                            {order.userId?.name || "N/A"}
                          </span>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Total:</span>
                          <span className="ml-2 font-bold text-green-600">
                            ₹{order.total}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                          order.status
                        )} ${
                          order.status === "cancelled"
                            ? "ring-2 ring-red-300"
                            : ""
                        }`}
                      >
                        {order.status === "cancelled" && (
                          <XCircle className="h-3 w-3 mr-1" />
                        )}
                        {order.status}
                      </span>
                      <span
                        className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(
                          order.paymentStatus
                        )}`}
                      >
                        {order.paymentStatus}
                      </span>
                      {order.deliveryStatus === "completed" ? (
                        <span className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Delivered
                        </span>
                      ) : (
                        <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Pending Delivery
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Order Details */}
                {expandedOrder === order._id && (
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Customer Information */}
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                          <User className="h-4 w-4 mr-2" />
                          Customer Information
                        </h3>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="text-gray-500">Name:</span>
                            <span className="ml-2 font-medium text-gray-900">
                              {order.userId?.name || "N/A"}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Email:</span>
                            <span className="ml-2 text-gray-900">
                              {order.userId?.email || "N/A"}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Phone:</span>
                            <span className="ml-2 text-gray-900">
                              {order.userId?.phone ||
                                order.shippingAddress?.phone ||
                                "N/A"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Shipping Address */}
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                          <MapPin className="h-4 w-4 mr-2" />
                          Shipping Address
                        </h3>
                        <div className="space-y-2 text-sm text-gray-900">
                          <div>{order.shippingAddress?.fullName}</div>
                          <div>{order.shippingAddress?.address}</div>
                          <div>
                            {order.shippingAddress?.city},{" "}
                            {order.shippingAddress?.state}{" "}
                            {order.shippingAddress?.pincode}
                          </div>
                          {order.shippingAddress?.phone && (
                            <div className="text-gray-500">
                              Phone: {order.shippingAddress.phone}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Order Items */}
                      <div className="md:col-span-2">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                          <Package className="h-4 w-4 mr-2" />
                          Ordered Items ({order.items?.length || 0})
                        </h3>
                        <div className="space-y-2">
                          {order.items?.map((item, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-4 p-3 bg-white rounded-lg border border-gray-200"
                            >
                              <img
                                src={item.image}
                                alt={item.name}
                                className="h-16 w-16 object-cover rounded"
                              />
                              <div className="flex-1">
                                <div className="font-medium text-gray-900">
                                  {item.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  Quantity: {item.quantity} × ₹{item.price}
                                </div>
                              </div>
                              <div className="font-semibold text-gray-900">
                                ₹{item.price * item.quantity}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Order Timeline */}
                      <div className="md:col-span-2">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          Order Timeline
                        </h3>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="text-gray-500">Order Placed:</span>
                            <span className="ml-2 text-gray-900">
                              {formatDate(order.createdAt)}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">
                              Estimated Delivery:
                            </span>
                            <span className="ml-2 text-gray-900">
                              {formatDate(order.estimatedDelivery)}
                            </span>
                          </div>
                          {order.deliveredAt && (
                            <div>
                              <span className="text-gray-500">
                                Delivered At:
                              </span>
                              <span className="ml-2 font-medium text-green-600">
                                {formatDate(order.deliveredAt)}
                              </span>
                            </div>
                          )}
                          <div>
                            <span className="text-gray-500">
                              Payment Method:
                            </span>
                            <span className="ml-2 text-gray-900 uppercase">
                              {order.paymentMethod}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Order Actions */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
                  <button
                    onClick={() => toggleOrderDetails(order._id)}
                    className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center"
                  >
                    {expandedOrder === order._id ? (
                      <>
                        <EyeOff className="h-4 w-4 mr-1" />
                        Hide Details
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </>
                    )}
                  </button>
                  <div className="flex items-center gap-3">
                    {order.status === "cancelled" ? (
                      <div className="flex items-center text-red-600 font-medium">
                        <XCircle className="h-4 w-4 mr-2" />
                        Order Cancelled
                      </div>
                    ) : (
                      <>
                        {order.deliveryStatus !== "completed" && (
                          <>
                            <button
                              onClick={() => handleCancelOrder(order._id)}
                              disabled={cancellingOrderId === order._id}
                              className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                            >
                              {cancellingOrderId === order._id ? (
                                "Cancelling..."
                              ) : (
                                <>
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Cancel Order
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => handleMarkCompleted(order._id)}
                              disabled={updatingOrderId === order._id}
                              className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                            >
                              {updatingOrderId === order._id ? (
                                "Updating..."
                              ) : (
                                <>
                                  <CheckCircle2 className="h-4 w-4 mr-2" />
                                  Mark as Delivery Completed
                                </>
                              )}
                            </button>
                          </>
                        )}
                        {order.deliveryStatus === "completed" && (
                          <div className="flex items-center text-green-600 font-medium">
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Delivery Completed
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;

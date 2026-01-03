import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Loader, CheckCircle, XCircle, Smartphone, ExternalLink } from "lucide-react";
import API_URL from "../config/api.js";

const PaymentProcess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [order, setOrder] = useState(location.state?.order);
  const [paymentUrl, setPaymentUrl] = useState(null);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("pending"); // pending, paid, failed
  const [error, setError] = useState("");

  useEffect(() => {
    // Get order from location state or sessionStorage
    if (!order) {
      const pendingOrderId = sessionStorage.getItem("pendingOrderId");
      if (pendingOrderId) {
        fetchOrderDetails(pendingOrderId);
      } else {
        setError("Order not found");
      }
    } else {
      initializePayment();
    }
  }, []);

  const fetchOrderDetails = async (orderId) => {
    try {
      const response = await fetch(`${API_URL}/orders/${orderId}`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch order details");
      }

      const data = await response.json();
      setOrder(data.order);
      initializePayment(data.order);
    } catch (error) {
      console.error("Error fetching order:", error);
      setError("Failed to load order details");
    }
  };

  const initializePayment = (orderData = null) => {
    const currentOrder = orderData || order;
    if (!currentOrder) return;

    // Get payment URL from sessionStorage or order
    const storedPaymentUrl = sessionStorage.getItem("paymentUrl");
    const url = storedPaymentUrl || currentOrder.paymentIntentUrl;

    if (url) {
      setPaymentUrl(url);
      // Open UPI intent in new window/tab
      openUPIIntent(url);
    } else {
      setError("Payment URL not found");
    }
  };

  const openUPIIntent = (url) => {
    // Try to open UPI app directly
    // For mobile devices, this will open the UPI app
    // For desktop, it will open in a new window
    try {
      // Check if it's a UPI deep link
      if (url.startsWith("upi://") || url.startsWith("phonepe://") || url.startsWith("paytm://") || url.startsWith("tez://")) {
        // Mobile device - open UPI app directly
        window.location.href = url;
      } else {
        // Web URL - open in new window
        const paymentWindow = window.open(url, "UPIPayment", "width=500,height=700");
        
        // Check if window was blocked
        if (!paymentWindow) {
          setError("Popup blocked. Please allow popups and try again.");
          // Fallback: redirect to payment URL
          setTimeout(() => {
            window.location.href = url;
          }, 2000);
        } else {
          // Monitor window close
          const checkWindow = setInterval(() => {
            if (paymentWindow.closed) {
              clearInterval(checkWindow);
              // Start checking payment status
              checkPaymentStatus();
            }
          }, 1000);
        }
      }
    } catch (error) {
      console.error("Error opening UPI intent:", error);
      // Fallback: redirect to payment URL
      window.location.href = url;
    }
  };

  const checkPaymentStatus = async () => {
    if (!order || !order._id) return;

    setCheckingStatus(true);
    
    // Poll payment status every 3 seconds
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`${API_URL}/orders/${order._id}/payment-status`, {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to check payment status");
        }

        const data = await response.json();
        
        // Update order status
        if (data.order) {
          setOrder(data.order);
        }

        // Check payment status - ONLY backend decides success
        if (data.paymentStatus === "paid") {
          clearInterval(pollInterval);
          setPaymentStatus("paid");
          setCheckingStatus(false);
          
          // Navigate to success page after short delay
          setTimeout(() => {
            navigate("/order-success", { state: { order: data.order } });
          }, 1500);
        } else if (data.paymentStatus === "failed") {
          clearInterval(pollInterval);
          setPaymentStatus("failed");
          setCheckingStatus(false);
        } else {
          // Still pending - continue polling (max 2 minutes)
          const elapsed = Date.now() - (order.createdAt ? new Date(order.createdAt).getTime() : Date.now());
          if (elapsed > 120000) {
            clearInterval(pollInterval);
            setCheckingStatus(false);
            setError("Payment timeout. Please check your payment status in order history.");
          }
        }
      } catch (error) {
        console.error("Error checking payment status:", error);
        // Continue polling on error
      }
    }, 3000);

    // Stop polling after 2 minutes
    setTimeout(() => {
      clearInterval(pollInterval);
      setCheckingStatus(false);
    }, 120000);
  };

  const handleRetryPayment = () => {
    if (paymentUrl) {
      openUPIIntent(paymentUrl);
      checkPaymentStatus();
    }
  };

  const handleManualCheck = () => {
    checkPaymentStatus();
  };

  if (error && !order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <XCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">{error}</h2>
          <button
            onClick={() => navigate("/dashboard")}
            className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            {paymentStatus === "paid" ? (
              <>
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-16 w-16 text-green-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                  Payment Successful!
                </h1>
                <p className="text-gray-600">
                  Your payment has been verified. Redirecting to order confirmation...
                </p>
              </>
            ) : paymentStatus === "failed" ? (
              <>
                <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <XCircle className="h-16 w-16 text-red-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                  Payment Failed
                </h1>
                <p className="text-gray-600">
                  Your payment could not be processed. Please try again.
                </p>
              </>
            ) : (
              <>
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  {checkingStatus ? (
                    <Loader className="h-16 w-16 text-blue-600 animate-spin" />
                  ) : (
                    <Smartphone className="h-16 w-16 text-blue-600" />
                  )}
                </div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                  Complete Your Payment
                </h1>
                <p className="text-gray-600">
                  {checkingStatus
                    ? "Verifying payment status..."
                    : "Please complete the payment in your UPI app. We'll verify the payment automatically."}
                </p>
              </>
            )}
          </div>

          {/* Order Details */}
          {order && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Order Details</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order ID</span>
                  <span className="font-semibold">#{order._id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount</span>
                  <span className="font-semibold text-green-600">₹{order.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Status</span>
                  <span
                    className={`font-semibold ${
                      paymentStatus === "paid"
                        ? "text-green-600"
                        : paymentStatus === "failed"
                        ? "text-red-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {paymentStatus === "paid"
                      ? "Paid"
                      : paymentStatus === "failed"
                      ? "Failed"
                      : "Pending"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Instructions */}
          {paymentStatus === "pending" && (
            <div className="bg-blue-50 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-3">
                Payment Instructions
              </h3>
              <ul className="space-y-2 text-sm text-blue-700">
                <li className="flex items-start">
                  <span className="mr-2">1.</span>
                  <span>Complete the payment in your UPI app</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">2.</span>
                  <span>Do not close this page</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">3.</span>
                  <span>Payment will be verified automatically by our backend</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">4.</span>
                  <span>You'll be redirected once payment is confirmed</span>
                </li>
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {paymentStatus === "pending" && (
              <>
                {paymentUrl && (
                  <button
                    onClick={() => openUPIIntent(paymentUrl)}
                    className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <ExternalLink className="h-5 w-5" />
                    <span>Open UPI App Again</span>
                  </button>
                )}
                <button
                  onClick={handleManualCheck}
                  disabled={checkingStatus}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {checkingStatus ? "Checking..." : "Check Payment Status"}
                </button>
              </>
            )}

            {paymentStatus === "failed" && (
              <button
                onClick={handleRetryPayment}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                Retry Payment
              </button>
            )}

            <button
              onClick={() => navigate("/dashboard")}
              className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              View Order History
            </button>
          </div>

          {/* Important Note */}
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>Important:</strong> Payment confirmation is handled by our backend through secure webhook verification. 
              The frontend only displays the status - it never decides payment success.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentProcess;




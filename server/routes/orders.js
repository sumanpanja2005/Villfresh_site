import express from "express";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { authenticate } from "../middleware/auth.js";
import paymentService from "../services/paymentService.js";
import emailService from "../services/emailService.js";
import mongoose from "mongoose";

const router = express.Router();

// Create order
router.post("/", authenticate, async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, upiApp, upiId } = req.body;

    // Validate items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Items are required" });
    }

    // Validate shipping address
    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.address || !shippingAddress.city || !shippingAddress.state || !shippingAddress.pincode) {
      return res.status(400).json({ error: "Complete shipping address is required" });
    }

    // Check stock availability for all products
    const outOfStockItems = [];
    for (const item of items) {
      const productId = item.id || item.productId;
      
      // Try to find product in database if productId is a valid ObjectId
      if (mongoose.Types.ObjectId.isValid(productId)) {
        const product = await Product.findById(productId);
        if (!product) {
          outOfStockItems.push({ name: item.name, reason: "Product not found" });
        } else if (!product.inStock) {
          outOfStockItems.push({ name: product.name, reason: "Out of stock" });
        }
      } else {
        // If productId is not a valid ObjectId, we can't verify stock
        // In production, you might want to handle this differently
        console.warn(`Product ID ${productId} is not a valid ObjectId, skipping stock check`);
      }
    }

    if (outOfStockItems.length > 0) {
      return res.status(400).json({
        error: "Some products are out of stock",
        outOfStockItems: outOfStockItems.map(item => `${item.name}: ${item.reason}`),
      });
    }

    // Map items to include productId as ObjectId
    const orderItems = items.map((item) => {
      const productId = item.id || item.productId;
      return {
        productId: mongoose.Types.ObjectId.isValid(productId) 
          ? new mongoose.Types.ObjectId(productId)
          : null,
        name: item.name,
        image: item.image,
        price: item.price,
        quantity: item.quantity,
      };
    });

    // Calculate total
    const total = orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // Add tax (5%)
    const totalWithTax = total + Math.round(total * 0.05);

    // Determine payment gateway
    const paymentGateway = paymentMethod === "upi" ? "phonepe" : "cod";

    // Create order with PENDING status
    const order = new Order({
      userId: req.user._id,
      items: orderItems,
      total: totalWithTax,
      shippingAddress,
      paymentMethod,
      paymentGateway,
      upiId: paymentMethod === "upi" ? upiId : null,
      status: "pending",
      paymentStatus: "pending",
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    });

    await order.save();

    // For COD orders, mark as confirmed immediately
    if (paymentMethod === "cod") {
      order.status = "confirmed";
      order.paymentStatus = "pending"; // COD payment is pending until delivery
      await order.save();

      // Send order confirmation email for COD
      if (shippingAddress.email) {
        emailService.sendOrderConfirmation(order, shippingAddress.email).catch(err => {
          console.error("Failed to send order confirmation email:", err);
        });
      }

      return res.status(201).json({
        message: "Order created successfully",
        order,
        requiresPayment: false,
      });
    }

    // For UPI payments, initiate payment
    if (paymentMethod === "upi") {
      try {
        // Use selected UPI app or UPI ID
        const upiTarget = upiApp || upiId || null;
        
        const paymentResponse = await paymentService.initiatePayment({
          orderId: order._id.toString(),
          amount: totalWithTax,
          userId: req.user._id,
          phone: shippingAddress.phone,
          upiId: upiTarget, // Can be app name (phonepe, googlepay) or UPI ID (name@paytm)
        });

        // Update order with payment transaction details
        order.paymentTransactionId = paymentResponse.transactionId;
        order.paymentIntentUrl = paymentResponse.redirectUrl;
        order.paymentQrCode = paymentResponse.qrCode;
        await order.save();

        return res.status(201).json({
          message: "Order created. Please complete payment.",
          order,
          requiresPayment: true,
          paymentUrl: paymentResponse.redirectUrl,
          qrCode: paymentResponse.qrCode,
        });
      } catch (paymentError) {
        // If payment initiation fails, delete the order
        await Order.findByIdAndDelete(order._id);
        return res.status(500).json({
          error: "Failed to initiate payment",
          details: paymentError.message,
        });
      }
    }

    res.status(201).json({
      message: "Order created successfully",
      order,
    });
  } catch (error) {
    console.error("Order creation error:", error);
    res.status(400).json({ error: error.message });
  }
});

// Get single order (must come before /:id route)
router.get("/my-orders", authenticate, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });
    res.json({ orders, count: orders.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single order
router.get("/:id", authenticate, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Check if user owns this order or is admin
    if (
      order.userId.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ error: "Access denied" });
    }

    res.json({ order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all orders (Admin only)
router.get("/", authenticate, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }

    const orders = await Order.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 });
    res.json({ orders, count: orders.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update order status (Admin only)
router.put("/:id/status", authenticate, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }

    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json({ message: "Order status updated", order });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


// Check payment status endpoint (for frontend polling)
router.get("/:id/payment-status", authenticate, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Check if user owns this order or is admin
    if (
      order.userId.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ error: "Access denied" });
    }

    // If payment is already processed, return current status
    if (order.paymentStatus === "paid" || order.paymentStatus === "failed") {
      return res.json({
        paymentStatus: order.paymentStatus,
        orderStatus: order.status,
        order,
      });
    }

    // If payment transaction ID exists, check status with PhonePe
    if (order.paymentTransactionId && order.paymentGateway === "phonepe") {
      try {
        const paymentStatus = await paymentService.checkPaymentStatus(
          order.paymentTransactionId
        );

        // IMPORTANT: Status check endpoint is for polling only
        // Payment confirmation ONLY happens through webhook verification
        // This endpoint only returns current status, never updates to "paid"
        // Webhook is the single source of truth for payment success
        
        // Only update to "failed" if webhook hasn't confirmed it yet
        // Never update to "paid" here - only webhook can do that
        if (paymentStatus.state === "FAILED" && order.paymentStatus === "pending") {
          // Mark as failed only if still pending (webhook might not have arrived yet)
          // But don't mark as paid - wait for webhook
          order.paymentStatus = "failed";
          await order.save();
        }
        
        // Note: If paymentStatus.state === "SUCCESS", we still don't update here
        // We wait for webhook verification to confirm payment

        return res.json({
          paymentStatus: order.paymentStatus,
          orderStatus: order.status,
          order,
          gatewayStatus: paymentStatus.state,
        });
      } catch (paymentError) {
        console.error("Payment status check error:", paymentError);
        // Return current order status even if gateway check fails
        return res.json({
          paymentStatus: order.paymentStatus,
          orderStatus: order.status,
          order,
          error: "Could not verify payment status with gateway",
        });
      }
    }

    // Return current status
    res.json({
      paymentStatus: order.paymentStatus,
      orderStatus: order.status,
      order,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

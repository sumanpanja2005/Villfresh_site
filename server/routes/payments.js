import express from "express";
import Order from "../models/Order.js";
import paymentService from "../services/paymentService.js";
import emailService from "../services/emailService.js";

const router = express.Router();

// Payment webhook handler (no authentication required - secured by webhook secret)
// Note: Raw body parser is applied in server/index.js before express.json()
router.post("/webhook", async (req, res) => {
  try {
    // PhonePe sends webhook data - the body might be base64 encoded
    let webhookData;
    try {
      const bodyString = req.body.toString();
      webhookData = JSON.parse(bodyString);
    } catch (e) {
      console.error("Error parsing webhook body:", e);
      return res.status(400).json({ error: "Invalid webhook data format" });
    }
    
    // Extract X-VERIFY header for signature verification
    const xVerify = req.headers["x-verify"] || req.headers["X-VERIFY"];
    
    if (!xVerify) {
      console.error("Missing X-VERIFY header in webhook");
      return res.status(400).json({ error: "Missing X-VERIFY header" });
    }

    // Verify webhook signature
    const isValid = paymentService.verifyWebhookSignature(webhookData, xVerify);
    
    if (!isValid) {
      console.error("Invalid webhook signature");
      return res.status(401).json({ error: "Invalid webhook signature" });
    }

    // PhonePe webhook structure: { response: { data: {...}, code: "..." } }
    // Or direct: { data: {...}, code: "..." }
    let responseData = webhookData;
    
    // If response is base64 encoded, decode it
    if (webhookData.response && typeof webhookData.response === 'string') {
      try {
        responseData = JSON.parse(Buffer.from(webhookData.response, 'base64').toString('utf-8'));
      } catch (e) {
        // If not base64, use as is
        responseData = webhookData.response;
      }
    } else if (webhookData.response) {
      responseData = webhookData.response;
    }

    // Extract payment details from webhook
    const merchantTransactionId = responseData.data?.merchantTransactionId 
      || responseData.merchantTransactionId;
    const transactionId = responseData.data?.transactionId 
      || responseData.transactionId;
    const state = responseData.data?.state || responseData.state; // SUCCESS, PENDING, FAILED
    const code = responseData.code || webhookData.code; // PAYMENT_SUCCESS, PAYMENT_PENDING, PAYMENT_ERROR

    if (!merchantTransactionId) {
      return res.status(400).json({ error: "Missing merchant transaction ID" });
    }

    // Find order by ID (merchantTransactionId is the order ID)
    const order = await Order.findById(merchantTransactionId);
    
    if (!order) {
      console.error(`Order not found: ${merchantTransactionId}`);
      return res.status(404).json({ error: "Order not found" });
    }

    // CRITICAL: Only backend decides payment success through webhook verification
    // Frontend never determines payment status - it only displays what backend confirms
    
    // Update order based on payment status from webhook
    if (state === "SUCCESS" || code === "PAYMENT_SUCCESS") {
      // Payment successful - ONLY backend can set this status
      // Verify amount matches to prevent fraud
      const webhookAmount = responseData.data?.amount 
        ? responseData.data.amount / 100 // Convert from paise to rupees
        : null;
      
      if (webhookAmount && Math.abs(webhookAmount - order.total) > 0.01) {
        console.error(`Amount mismatch for order ${order._id}: Expected ${order.total}, Got ${webhookAmount}`);
        // Don't mark as paid if amount doesn't match
        return res.status(400).json({ error: "Amount mismatch" });
      }

      // Only update if payment status is still pending (idempotent)
      if (order.paymentStatus === "pending") {
        order.paymentStatus = "paid";
        order.status = "confirmed";
        order.paymentTransactionId = transactionId || order.paymentTransactionId;
        await order.save();

        // Send order confirmation email
        if (order.shippingAddress.email) {
          emailService.sendOrderConfirmation(order, order.shippingAddress.email).catch(err => {
            console.error("Failed to send order confirmation email:", err);
          });
        }

        console.log(`Order ${order._id} marked as paid via webhook verification`);
      }
    } else if (state === "FAILED" || code === "PAYMENT_ERROR") {
      // Payment failed - only update if still pending
      if (order.paymentStatus === "pending") {
        order.paymentStatus = "failed";
        await order.save();
        console.log(`Order ${order._id} payment failed via webhook`);
      }
    } else if (state === "PENDING" || code === "PAYMENT_PENDING") {
      // Payment still pending
      console.log(`Order ${order._id} payment still pending`);
    }

    // Always return success to PhonePe to acknowledge receipt
    res.status(200).json({ success: true, message: "Webhook processed" });
  } catch (error) {
    console.error("Webhook processing error:", error);
    // Still return 200 to PhonePe to prevent retries for malformed requests
    res.status(200).json({ success: false, error: error.message });
  }
});

export default router;


# UPI Payment Implementation - PhonePe Integration

This document describes the UPI payment order flow implementation for the Villfresh e-commerce website using PhonePe payment gateway.

## Overview

The implementation provides a complete UPI payment flow with:
- Order creation with stock validation
- Payment initiation via PhonePe
- Secure webhook handling for payment verification
- Order confirmation emails
- Payment status tracking

## Architecture

### Backend Components

1. **Order Model** (`server/models/Order.js`)
   - Extended with payment fields:
     - `paymentStatus`: pending, paid, failed, refunded
     - `paymentGateway`: phonepe, cod
     - `paymentTransactionId`: PhonePe transaction ID
     - `paymentIntentUrl`: Payment redirect URL
     - `paymentQrCode`: QR code for payment (if applicable)

2. **Payment Service** (`server/services/paymentService.js`)
   - Handles PhonePe API integration
   - Payment initiation
   - Payment status checking
   - Webhook signature verification

3. **Email Service** (`server/services/emailService.js`)
   - Sends order confirmation emails
   - HTML email templates with order details

4. **Order Routes** (`server/routes/orders.js`)
   - Stock validation before order creation
   - Order creation with payment initiation
   - Payment status checking endpoint

5. **Payment Routes** (`server/routes/payments.js`)
   - Webhook handler for PhonePe callbacks
   - Secure signature verification
   - Order status updates

### Frontend Components

1. **Checkout Page** (`src/pages/Checkout.jsx`)
   - Form validation
   - Order creation
   - Payment gateway redirect
   - Stock error handling

2. **Order Success Page** (`src/pages/OrderSuccess.jsx`)
   - Payment status display
   - Payment status polling
   - Order details display

## Payment Flow

### 1. Checkout Process

```
User fills checkout form
    ↓
Frontend validates form
    ↓
Backend validates stock availability
    ↓
Backend creates order with status: PENDING
    ↓
For UPI: Backend initiates PhonePe payment
    ↓
Frontend redirects to PhonePe payment page
```

### 2. Payment Completion

```
User completes payment on PhonePe
    ↓
PhonePe redirects to order-success page
    ↓
PhonePe sends webhook to backend
    ↓
Backend verifies webhook signature
    ↓
Backend updates order: paymentStatus = PAID, status = CONFIRMED
    ↓
Backend sends order confirmation email
    ↓
Frontend displays success message
```

### 3. Security Features

- **Stock Validation**: Products are checked for availability before order creation
- **Webhook Verification**: All webhooks are verified using X-VERIFY header signature
- **No Frontend Trust**: Payment success is only confirmed via backend webhook
- **Secure Headers**: CORS and authentication properly configured

## API Endpoints

### Order Creation
```
POST /api/orders
Body: {
  items: [...],
  shippingAddress: {...},
  paymentMethod: "upi" | "cod",
  upiId: "string" (optional)
}
Response: {
  order: {...},
  requiresPayment: boolean,
  paymentUrl: "string" (if UPI)
}
```

### Payment Status Check
```
GET /api/orders/:id/payment-status
Response: {
  paymentStatus: "pending" | "paid" | "failed",
  orderStatus: "pending" | "confirmed" | ...,
  order: {...}
}
```

### Webhook (PhonePe)
```
POST /api/payments/webhook
Headers: {
  X-VERIFY: "signature###saltIndex"
}
Body: PhonePe webhook payload
```

## Environment Variables

See `ENV_SETUP.md` for complete environment variable configuration.

Key variables:
- `PHONEPE_MERCHANT_ID`: Your PhonePe merchant ID
- `PHONEPE_SALT_KEY`: Your PhonePe salt key
- `PHONEPE_SALT_INDEX`: Salt index (usually 1)
- `PHONEPE_BASE_URL`: API base URL (sandbox or production)
- `PHONEPE_CALLBACK_URL`: Webhook URL
- `SMTP_*`: Email service configuration

## Testing

### Local Development

1. Set up environment variables (see `ENV_SETUP.md`)
2. Use PhonePe sandbox for testing
3. Use ngrok or similar to expose webhook endpoint:
   ```bash
   ngrok http 5000
   ```
4. Update `PHONEPE_CALLBACK_URL` with ngrok URL

### Test Flow

1. Add products to cart
2. Go to checkout
3. Fill shipping details
4. Select UPI payment
5. Enter UPI ID (optional)
6. Click "Place Order"
7. Redirected to PhonePe payment page
8. Complete payment (use test credentials)
9. Redirected back to order success page
10. Verify order status updates

## Error Handling

### Stock Validation
- Products are checked before order creation
- Out-of-stock products are rejected with error message
- Order is not created if any product is unavailable

### Payment Failures
- Payment initiation failures: Order is deleted, error returned
- Payment processing failures: Order status set to "failed"
- Webhook verification failures: Request rejected

### Email Failures
- Email sending failures are logged but don't block order processing
- Order confirmation still proceeds even if email fails

## Security Considerations

1. **Webhook Security**
   - All webhooks verified using X-VERIFY signature
   - Invalid signatures are rejected
   - Webhook endpoint doesn't require authentication (secured by signature)

2. **Payment Verification**
   - Never trust frontend payment success
   - All payment confirmations come via webhook
   - Payment status can be polled but webhook is authoritative

3. **Stock Management**
   - Stock checked at order creation time
   - Prevents overselling
   - Real-time validation against database

## Future Enhancements

- [ ] Payment retry mechanism for failed payments
- [ ] Refund handling
- [ ] Payment method selection (UPI Intent, QR, Collect)
- [ ] Order cancellation with refund
- [ ] Payment analytics and reporting

## Troubleshooting

### Payment Not Initiating
- Check PhonePe credentials in environment variables
- Verify API base URL (sandbox vs production)
- Check network connectivity to PhonePe API

### Webhook Not Receiving
- Verify webhook URL is publicly accessible
- Check PhonePe dashboard webhook configuration
- Verify X-VERIFY header is being sent
- Check server logs for webhook requests

### Email Not Sending
- Verify SMTP credentials
- Check email service logs
- Ensure email address is valid
- For Gmail, use App Password, not regular password

## Support

For PhonePe integration issues:
- PhonePe Developer Docs: https://developer.phonepe.com
- PhonePe Merchant Support: https://merchant.phonepe.com


# Environment Variables Setup

Create a `.env` file in the root directory with the following variables:

## Required Environment Variables

```env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/villfresh?retryWrites=true&w=majority

# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend URL (for CORS and redirects)
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:5000

# JWT Secret (use a strong random string in production)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# PhonePe Payment Gateway Configuration
# Get these from PhonePe Merchant Dashboard: https://merchant.phonepe.com
PHONEPE_MERCHANT_ID=your_merchant_id
PHONEPE_SALT_KEY=your_salt_key
PHONEPE_SALT_INDEX=1

# PhonePe API Base URL
# For testing/sandbox: https://api-preprod.phonepe.com/apis/pg-sandbox
# For production: https://api.phonepe.com/apis/hermes
PHONEPE_BASE_URL=https://api-preprod.phonepe.com/apis/pg-sandbox

# Payment Redirect URLs
PHONEPE_REDIRECT_URL=http://localhost:5173/order-success
PHONEPE_CALLBACK_URL=http://localhost:5000/api/payments/webhook

# Email Service Configuration (for order confirmation emails)
# Gmail SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## PhonePe Setup Instructions

1. **Sign up for PhonePe Merchant Account**
   - Visit https://merchant.phonepe.com
   - Complete the registration process
   - Get your Merchant ID, Salt Key, and Salt Index from the dashboard

2. **Configure Webhook URL**
   - In your PhonePe merchant dashboard, set the webhook URL to: `https://yourdomain.com/api/payments/webhook`
   - For local testing, use a service like ngrok to expose your local server

3. **Test Mode vs Production**
   - Use sandbox URL for testing: `https://api-preprod.phonepe.com/apis/pg-sandbox`
   - Use production URL for live: `https://api.phonepe.com/apis/hermes`

## Email Service Setup (Gmail)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Enter "Villfresh" as the name
   - Copy the generated 16-character password
   - Use this password in `SMTP_PASS`

## Local Development with Webhooks

For local development, you'll need to expose your local server to receive webhooks:

1. **Using ngrok**:
   ```bash
   ngrok http 5000
   ```
   - Use the ngrok URL for `PHONEPE_CALLBACK_URL`
   - Example: `https://abc123.ngrok.io/api/payments/webhook`

2. **Using localtunnel**:
   ```bash
   npx localtunnel --port 5000
   ```

## Production Deployment

1. Set `NODE_ENV=production`
2. Use production PhonePe API URL
3. Use your production domain for redirect and callback URLs
4. Ensure your server has HTTPS enabled (required for webhooks)
5. Use strong, unique values for `JWT_SECRET` and `PHONEPE_SALT_KEY`


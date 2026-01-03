# Render Deployment Guide

## ✅ Pre-Deployment Checklist

### 1. Code Verification
- ✅ Static file serving configured in `server/index.js`
- ✅ API URL uses relative paths in production (`/api`)
- ✅ No hardcoded `localhost` URLs in frontend
- ✅ Express listens on `0.0.0.0` and `process.env.PORT`
- ✅ Vite build outputs to `dist/` directory
- ✅ React Router catch-all route configured

### 2. Render Configuration

#### Build Command
```bash
npm install && npm run build
```

#### Start Command
```bash
NODE_ENV=production node server/index.js
```

### 3. Required Environment Variables

Set these in Render Dashboard → Environment:

```env
# Server Configuration
NODE_ENV=production
PORT=10000  # Render sets this automatically, but you can set it explicitly

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/villfresh?retryWrites=true&w=majority

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# URLs (Important: Use your Render app URL)
FRONTEND_URL=https://your-app-name.onrender.com
BACKEND_URL=https://your-app-name.onrender.com

# PhonePe Payment Gateway
PHONEPE_MERCHANT_ID=your_merchant_id
PHONEPE_SALT_KEY=your_salt_key
PHONEPE_SALT_INDEX=1
PHONEPE_BASE_URL=https://api.phonepe.com/apis/hermes
PHONEPE_REDIRECT_URL=https://your-app-name.onrender.com/payment-process
PHONEPE_CALLBACK_URL=https://your-app-name.onrender.com/api/payments/webhook

# Email Service (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### 4. Deployment Steps

1. **Push code to GitHub**
   ```bash
   git add .
   git commit -m "Ready for Render deployment"
   git push origin main
   ```

2. **Create Render Web Service**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Select the repository and branch

3. **Configure Build & Start**
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `NODE_ENV=production node server/index.js`
   - **Environment**: Node.js
   - **Node Version**: 18 or higher

4. **Set Environment Variables**
   - Add all variables from section 3 above
   - Replace `your-app-name.onrender.com` with your actual Render URL

5. **Deploy**
   - Click "Create Web Service"
   - Wait for build to complete
   - Check logs for any errors

### 5. Post-Deployment Verification

1. **Check Health Endpoint**
   ```
   https://your-app-name.onrender.com/api/health
   ```
   Should return: `{"status":"OK","message":"VILLFRESH API is running"}`

2. **Check Frontend**
   ```
   https://your-app-name.onrender.com
   ```
   Should load the React app

3. **Check API Routes**
   ```
   https://your-app-name.onrender.com/api/products
   ```
   Should return products JSON

4. **Check React Router**
   Navigate to any route like `/products`, `/cart`, etc.
   Should load correctly (no 404)

### 6. Troubleshooting

#### Frontend Not Loading
- ✅ Verify `NODE_ENV=production` is set
- ✅ Check build logs - ensure `dist/` directory was created
- ✅ Verify static file serving path in server logs
- ✅ Check that `dist/index.html` exists

#### API Routes Not Working
- ✅ Verify CORS configuration
- ✅ Check MongoDB connection
- ✅ Verify JWT_SECRET is set
- ✅ Check server logs for errors

#### Payment Webhooks Not Working
- ✅ Verify `PHONEPE_CALLBACK_URL` is set to your Render URL
- ✅ Check PhonePe dashboard webhook configuration
- ✅ Verify webhook endpoint is accessible (not behind auth)
- ✅ Check X-VERIFY header in webhook logs

#### Build Fails
- ✅ Check Node version (should be 18+)
- ✅ Verify all dependencies in `package.json`
- ✅ Check for TypeScript errors (if any)
- ✅ Verify Vite build completes successfully

### 7. Important Notes

- **Port**: Render automatically sets `PORT` environment variable. Your code uses `process.env.PORT || 5000`, which is correct.
- **HTTPS**: Render provides HTTPS automatically. No additional configuration needed.
- **Cold Starts**: Free tier services spin down after inactivity. First request may take 30-60 seconds.
- **Build Time**: First build may take 5-10 minutes. Subsequent builds are faster.
- **Logs**: Check Render dashboard logs for debugging.

### 8. Production Optimizations (Optional)

1. **Enable Auto-Deploy**: Automatically deploy on git push
2. **Set Up Monitoring**: Use Render's built-in monitoring
3. **Database Indexing**: Ensure MongoDB indexes are optimized
4. **CDN**: Consider using a CDN for static assets
5. **Caching**: Add caching headers for static assets

---

## ✅ Deployment Status

Your code is **READY** for Render deployment! All critical components are configured correctly.


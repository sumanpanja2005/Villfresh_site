import crypto from 'crypto';

/**
 * PhonePe Payment Gateway Service
 * Handles payment initiation and webhook verification
 */
class PaymentService {
  constructor() {
    // PhonePe API credentials from environment variables
    this.merchantId = process.env.PHONEPE_MERCHANT_ID;
    this.saltKey = process.env.PHONEPE_SALT_KEY;
    this.saltIndex = process.env.PHONEPE_SALT_INDEX || '1';
    this.baseUrl = process.env.PHONEPE_BASE_URL || 'https://api.phonepe.com/apis/hermes';
    this.redirectUrl = process.env.PHONEPE_REDIRECT_URL || `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment-process`;
    this.callbackUrl = process.env.PHONEPE_CALLBACK_URL || `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/payments/webhook`;
  }

  /**
   * Generate X-VERIFY header for PhonePe API
   */
  generateXVerify(payload) {
    const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
    const stringToHash = base64Payload + this.callbackUrl + this.saltKey;
    const sha256Hash = crypto.createHash('sha256').update(stringToHash).digest('hex');
    return sha256Hash + '###' + this.saltIndex;
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload, xVerify) {
    try {
      const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
      const stringToHash = base64Payload + this.saltKey;
      const sha256Hash = crypto.createHash('sha256').update(stringToHash).digest('hex');
      const expectedXVerify = sha256Hash + '###' + this.saltIndex;
      return xVerify === expectedXVerify;
    } catch (error) {
      console.error('Webhook signature verification error:', error);
      return false;
    }
  }

  /**
   * Initiate UPI payment
   * @param {Object} orderData - Order details
   * @returns {Object} Payment response with redirect URL
   */
  async initiatePayment(orderData) {
    try {
      // Validate PhonePe credentials
      if (!this.merchantId || !this.saltKey) {
        throw new Error('PhonePe credentials not configured. Please set PHONEPE_MERCHANT_ID and PHONEPE_SALT_KEY in environment variables.');
      }

      const { orderId, amount, userId, phone, upiId } = orderData;

      // Map UPI app names to PhonePe target app codes
      const upiAppMap = {
        'phonepe': 'PHONEPE',
        'googlepay': 'GOOGLEPAY',
        'paytm': 'PAYTM',
        'bhim': 'BHIM',
      };

      // Determine target app
      let targetApp = 'ALL'; // Default: allow all UPI apps
      let vpa = null;

      if (upiId) {
        if (upiId.includes('@')) {
          // It's a UPI ID (e.g., name@paytm)
          vpa = upiId;
          // Extract app from UPI ID if possible
          const appFromId = upiId.split('@')[1]?.toLowerCase();
          if (appFromId && upiAppMap[appFromId]) {
            targetApp = upiAppMap[appFromId];
          }
        } else {
          // It's an app name (e.g., phonepe, googlepay)
          targetApp = upiAppMap[upiId.toLowerCase()] || 'ALL';
        }
      }

      // PhonePe payment request payload
      const payload = {
        merchantId: this.merchantId,
        merchantTransactionId: orderId,
        merchantUserId: userId.toString(),
        amount: amount * 100, // Convert to paise (PhonePe expects amount in paise)
        redirectUrl: this.redirectUrl,
        redirectMode: 'REDIRECT',
        callbackUrl: this.callbackUrl,
        mobileNumber: phone,
        paymentInstrument: {
          type: 'UPI_INTENT',
          targetApp: targetApp,
          ...(vpa ? { vpa: vpa } : {}),
        },
      };

      // Generate X-VERIFY header
      const xVerify = this.generateXVerify(payload);

      // Base64 encode payload
      const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');

      // Make API request to PhonePe
      const response = await fetch(`${this.baseUrl}/pg/v1/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-VERIFY': xVerify,
        },
        body: JSON.stringify({
          request: base64Payload,
        }),
      });

      const responseData = await response.json();

      // PhonePe API response structure
      // Decode the base64 response if present
      let decodedData = responseData;
      if (responseData.data && typeof responseData.data === 'string') {
        try {
          decodedData = JSON.parse(Buffer.from(responseData.data, 'base64').toString('utf-8'));
        } catch (e) {
          // If decoding fails, use responseData as is
          decodedData = responseData;
        }
      }

      if (!response.ok || (decodedData.success !== true && decodedData.code !== 'PAYMENT_INITIATED')) {
        throw new Error(decodedData.message || responseData.message || 'Payment initiation failed');
      }

      // Extract redirect URL from response
      // PhonePe response structure: data.instrumentResponse.redirectInfo.url
      const redirectUrl = decodedData.data?.instrumentResponse?.redirectInfo?.url 
        || decodedData.instrumentResponse?.redirectInfo?.url
        || responseData.data?.instrumentResponse?.redirectInfo?.url;

      if (!redirectUrl) {
        throw new Error('Payment redirect URL not received');
      }

      return {
        success: true,
        redirectUrl,
        transactionId: decodedData.data?.merchantTransactionId || responseData.data?.merchantTransactionId,
        qrCode: decodedData.data?.instrumentResponse?.qrData 
          || decodedData.instrumentResponse?.qrData 
          || responseData.data?.instrumentResponse?.qrData 
          || null,
      };
    } catch (error) {
      console.error('Payment initiation error:', error);
      throw new Error(error.message || 'Failed to initiate payment');
    }
  }

  /**
   * Check payment status
   * @param {String} transactionId - PhonePe transaction ID
   * @returns {Object} Payment status
   */
  async checkPaymentStatus(transactionId) {
    try {
      const url = `${this.baseUrl}/pg/v1/status/${this.merchantId}/${transactionId}`;
      const stringToHash = `/pg/v1/status/${this.merchantId}/${transactionId}${this.saltKey}`;
      const sha256Hash = crypto.createHash('sha256').update(stringToHash).digest('hex');
      const xVerify = sha256Hash + '###' + this.saltIndex;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'X-VERIFY': xVerify,
          'X-MERCHANT-ID': this.merchantId,
        },
      });

      const responseData = await response.json();

      if (!response.ok || responseData.success !== true) {
        throw new Error(responseData.message || 'Payment status check failed');
      }

      return {
        success: true,
        code: responseData.code,
        message: responseData.message,
        transactionId: responseData.data?.merchantTransactionId,
        state: responseData.data?.state, // SUCCESS, PENDING, FAILED
      };
    } catch (error) {
      console.error('Payment status check error:', error);
      throw new Error(error.message || 'Failed to check payment status');
    }
  }
}

export default new PaymentService();


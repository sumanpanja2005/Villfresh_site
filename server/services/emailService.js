import nodemailer from 'nodemailer';

/**
 * Email Service for sending order confirmation emails
 */
class EmailService {
  constructor() {
    // Email configuration from environment variables
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  /**
   * Send order confirmation email
   * @param {Object} order - Order object
   * @param {String} recipientEmail - Recipient email address
   */
  async sendOrderConfirmation(order, recipientEmail) {
    try {
      if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.warn('SMTP credentials not configured. Skipping email send.');
        return { success: false, message: 'Email service not configured' };
      }

      const orderItemsHtml = order.items
        .map(
          (item) => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">
            <img src="${item.image}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px;" />
          </td>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price * item.quantity}</td>
        </tr>
      `
        )
        .join('');

      const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Confirmation - Villfresh</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #22c55e; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0;">Order Confirmed!</h1>
          </div>
          
          <div style="background-color: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px;">
            <p>Dear ${order.shippingAddress.fullName},</p>
            
            <p>Thank you for your order! We're excited to deliver fresh organic products to you.</p>
            
            <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #22c55e; margin-top: 0;">Order Details</h2>
              <p><strong>Order ID:</strong> #${order._id}</p>
              <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
              <p><strong>Total Amount:</strong> ₹${order.total}</p>
              <p><strong>Payment Status:</strong> <span style="color: #22c55e; font-weight: bold;">${order.paymentStatus === 'paid' ? 'Paid' : 'Pending'}</span></p>
            </div>
            
            <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #22c55e; margin-top: 0;">Order Items</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr style="background-color: #f3f4f6;">
                    <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Image</th>
                    <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Product</th>
                    <th style="padding: 10px; text-align: center; border-bottom: 2px solid #ddd;">Quantity</th>
                    <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Price</th>
                    <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${orderItemsHtml}
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="4" style="padding: 10px; text-align: right; font-weight: bold; border-top: 2px solid #ddd;">Total:</td>
                    <td style="padding: 10px; text-align: right; font-weight: bold; border-top: 2px solid #ddd;">₹${order.total}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            
            <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #22c55e; margin-top: 0;">Delivery Information</h2>
              <p><strong>Shipping Address:</strong></p>
              <p>
                ${order.shippingAddress.fullName}<br>
                ${order.shippingAddress.address}<br>
                ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}<br>
                Phone: ${order.shippingAddress.phone}
              </p>
              <p><strong>Estimated Delivery:</strong> ${new Date(order.estimatedDelivery).toLocaleDateString()}</p>
            </div>
            
            <p style="margin-top: 30px;">We'll send you tracking information once your order ships.</p>
            
            <p>Thank you for choosing Villfresh!</p>
            
            <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #6b7280; font-size: 12px;">
              This is an automated email. Please do not reply to this message.
            </p>
          </div>
        </body>
      </html>
    `;

      const mailOptions = {
        from: `"Villfresh" <${process.env.SMTP_USER}>`,
        to: recipientEmail,
        subject: `Order Confirmation - #${order._id}`,
        html: htmlContent,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Order confirmation email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending order confirmation email:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new EmailService();


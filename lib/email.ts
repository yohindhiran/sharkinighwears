import nodemailer from "nodemailer";

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

export async function sendEmail({ to, subject, html, text }: SendEmailOptions) {
  const from = process.env.SMTP_FROM || `SHARKI NIGHTWEARS <${process.env.ADMIN_EMAIL || "orders@sharkinightwears.com"}>`;
  const transporter = getTransporter();

  if (!transporter) {
    console.info(`[Email Service - Simulated] To: ${to} | Subject: ${subject}`);
    return { success: true, simulated: true };
  }

  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      text: text || html.replace(/<[^>]*>?/gm, ""),
      html,
    });
    console.info(`[Email Service] Sent email to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[Email Service Error] Failed to send email to ${to}:`, error);
    return { success: false, error };
  }
}

export async function sendOrderConfirmationEmail(params: {
  orderNumber: string;
  recipient: string;
  email: string;
  items: Array<{ productName: string; quantity: number; unitPrice: number; size?: string | null; color?: string | null }>;
  total: number;
  addressLine1: string;
  city: string;
  state: string;
  pincode: string;
  paymentMethod?: string;
}) {
  const itemsHtml = params.items
    .map(
      (item) => `
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #eeeeee;">
            <strong>${item.productName}</strong>
            ${item.size || item.color ? `<br><small style="color: #666;">${[item.size, item.color].filter(Boolean).join(" · ")}</small>` : ""}
          </td>
          <td style="padding: 10px 0; text-align: center; border-bottom: 1px solid #eeeeee;">${item.quantity}</td>
          <td style="padding: 10px 0; text-align: right; border-bottom: 1px solid #eeeeee;">₹${(item.unitPrice * item.quantity).toLocaleString("en-IN")}</td>
        </tr>
      `
    )
    .join("");

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e1e1e; background-color: #fbf9f5; margin: 0; padding: 24px;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; padding: 36px; border: 1px solid #eee; border-radius: 4px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="font-family: Georgia, serif; font-size: 24px; letter-spacing: 0.15em; text-transform: uppercase; margin: 0;">SHARKI</h1>
          <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #888; margin-top: 4px;">Nightwears</p>
        </div>
        <hr style="border: 0; border-top: 1px solid #e0d6c9; margin: 20px 0;">
        <h2 style="font-size: 18px; margin-bottom: 8px;">Thank you for your order, ${params.recipient}!</h2>
        <p style="color: #555; font-size: 14px; line-height: 1.6;">Your order <strong>#${params.orderNumber}</strong> has been received and is being prepared with care in our house.</p>
        
        <h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em; margin-top: 24px; margin-bottom: 12px; color: #444;">Order Summary</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <thead>
            <tr style="border-bottom: 2px solid #333; text-align: left; font-size: 12px; text-transform: uppercase; color: #777;">
              <th style="padding-bottom: 8px;">Item</th>
              <th style="padding-bottom: 8px; text-align: center;">Qty</th>
              <th style="padding-bottom: 8px; text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="padding-top: 16px; font-weight: bold; font-size: 15px;">Total Amount</td>
              <td style="padding-top: 16px; font-weight: bold; font-size: 15px; text-align: right;">₹${params.total.toLocaleString("en-IN")}</td>
            </tr>
          </tfoot>
        </table>

        <div style="margin-top: 28px; background: #faf8f5; padding: 16px; border-radius: 4px; font-size: 13px; color: #444;">
          <strong>Delivery Address:</strong><br>
          ${params.recipient}<br>
          ${params.addressLine1}<br>
          ${params.city}, ${params.state} - ${params.pincode}<br>
          ${params.paymentMethod ? `<br><strong>Payment Mode:</strong> ${params.paymentMethod.toUpperCase()}` : ""}
        </div>

        <p style="margin-top: 28px; font-size: 13px; color: #777; line-height: 1.5; text-align: center;">
          Have questions about your order? Reach out to us at ${process.env.ADMIN_EMAIL || "sharkinightwears@gmail.com"}.
        </p>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: params.email,
    subject: `Order Confirmation #${params.orderNumber} - SHARKI NIGHTWEARS`,
    html,
  });
}

export async function sendAdminNewOrderAlert(params: {
  orderNumber: string;
  recipient: string;
  email: string;
  phone: string;
  items: Array<{ productName: string; quantity: number; unitPrice: number }>;
  total: number;
  addressLine1: string;
  city: string;
  state: string;
  pincode: string;
}) {
  const adminEmail = process.env.ADMIN_EMAIL || "sharkinightwears@gmail.com";
  const itemsText = params.items.map((i) => `${i.productName} x ${i.quantity} (₹${i.unitPrice})`).join(", ");

  const html = `
    <h2>New Order Placed: #${params.orderNumber}</h2>
    <p><strong>Customer:</strong> ${params.recipient} (${params.email}, ${params.phone})</p>
    <p><strong>Total:</strong> ₹${params.total.toLocaleString("en-IN")}</p>
    <p><strong>Items:</strong> ${itemsText}</p>
    <p><strong>Shipping:</strong> ${params.addressLine1}, ${params.city}, ${params.state} - ${params.pincode}</p>
  `;

  return sendEmail({
    to: adminEmail,
    subject: `[NEW ORDER] #${params.orderNumber} - ₹${params.total}`,
    html,
  });
}

export async function sendWelcomeEmail(params: { name: string; email: string }) {
  const html = `
    <div style="font-family: Georgia, serif; max-width: 600px; margin: auto; padding: 24px; color: #222;">
      <h1 style="letter-spacing: 0.2em; text-transform: uppercase;">SHARKI</h1>
      <p style="font-size: 16px; line-height: 1.6;">Welcome to SHARKI NIGHTWEARS, ${params.name}.</p>
      <p style="font-size: 14px; color: #555; line-height: 1.6;">
        We craft pure comfort for unhurried evenings and peaceful mornings. Your account is now active.
      </p>
      <p style="margin-top: 20px;">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/shop" style="background: #111; color: #fff; padding: 12px 24px; text-decoration: none; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.1em; display: inline-block;">
          Explore Collection
        </a>
      </p>
    </div>
  `;

  return sendEmail({
    to: params.email,
    subject: `Welcome to SHARKI NIGHTWEARS, ${params.name}`,
    html,
  });
}

export async function sendWholesaleEnquiryNotification(params: {
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  location: string;
  expectedQuantity?: number | null;
  message?: string | null;
}) {
  const adminEmail = process.env.ADMIN_EMAIL || "sharkinightwears@gmail.com";
  const html = `
    <h2>New Wholesale Enquiry Received</h2>
    <p><strong>Business Name:</strong> ${params.businessName}</p>
    <p><strong>Contact Person:</strong> ${params.contactName}</p>
    <p><strong>Email:</strong> ${params.email}</p>
    <p><strong>Phone:</strong> ${params.phone}</p>
    <p><strong>Location:</strong> ${params.location}</p>
    <p><strong>Expected Quantity:</strong> ${params.expectedQuantity || "Not specified"}</p>
    <p><strong>Message:</strong> ${params.message || "None"}</p>
  `;

  return sendEmail({
    to: adminEmail,
    subject: `[Wholesale Enquiry] ${params.businessName} - ${params.contactName}`,
    html,
  });
}

export async function sendContactMessageNotification(params: {
  name: string;
  email: string;
  message: string;
}) {
  const adminEmail = process.env.ADMIN_EMAIL || "sharkinightwears@gmail.com";
  const html = `
    <h2>New Contact Form Message</h2>
    <p><strong>From:</strong> ${params.name} (${params.email})</p>
    <p><strong>Message:</strong></p>
    <blockquote style="background: #f8f8f8; padding: 12px; border-left: 3px solid #333;">
      ${params.message.replace(/\n/g, "<br>")}
    </blockquote>
  `;

  return sendEmail({
    to: adminEmail,
    subject: `[Contact Form] Message from ${params.name}`,
    html,
  });
}

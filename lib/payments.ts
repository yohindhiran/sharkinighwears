export type PaymentIntent = { provider: string; amount: number; orderId: string; clientSecret?: string };
export interface PaymentProvider { createPayment(amount: number, orderId: string): Promise<PaymentIntent>; verifyPayment(payload: Record<string, string>): Promise<boolean>; }
export class ConfiguredPaymentProvider implements PaymentProvider {
  async createPayment(amount: number, orderId: string) { if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) throw new Error("Payment provider is not configured"); return { provider: "razorpay", amount, orderId }; }
  async verifyPayment() { if (!process.env.RAZORPAY_KEY_SECRET) throw new Error("Payment provider is not configured"); return false; }
}

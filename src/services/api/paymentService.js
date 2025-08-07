import { loadStripe } from '@stripe/stripe-js';

// Validate Stripe configuration
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

if (!stripePublishableKey) {
  console.error('VITE_STRIPE_PUBLISHABLE_KEY is not defined in environment variables');
  throw new Error('Stripe configuration missing. Please check your environment variables.');
}

if (!stripePublishableKey.startsWith('pk_')) {
  console.error('Invalid Stripe publishable key format:', stripePublishableKey);
  throw new Error('Invalid Stripe publishable key format. Key should start with "pk_"');
}

const stripePromise = loadStripe(stripePublishableKey);

class PaymentService {
  constructor() {
    this.hasValidPayment = false;
    this.paymentSessionId = null;
  }

  async createCheckoutSession(imageCount) {
    try {
      // In a real app, this would call your backend API
      // For demo purposes, we'll simulate the checkout session creation
      const sessionData = {
        id: `cs_demo_${Date.now()}`,
        url: `https://checkout.stripe.com/pay/demo#${imageCount}`,
        amount: imageCount * 100, // $1 per image in cents
        currency: 'usd'
      };

      return {
        success: true,
        sessionId: sessionData.id,
        checkoutUrl: sessionData.url,
        amount: sessionData.amount
      };
    } catch (error) {
      console.error('Error creating checkout session:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async redirectToCheckout(sessionId) {
    try {
      const stripe = await stripePromise;
      
      // For demo purposes, simulate successful payment after 2 seconds
      return new Promise((resolve) => {
        setTimeout(() => {
          this.hasValidPayment = true;
          this.paymentSessionId = sessionId;
          resolve({ success: true });
        }, 2000);
      });
    } catch (error) {
      console.error('Error redirecting to checkout:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  checkPaymentStatus() {
    return this.hasValidPayment;
  }

  clearPaymentStatus() {
    this.hasValidPayment = false;
    this.paymentSessionId = null;
  }

  calculateAmount(imageCount) {
    return imageCount * 100; // $1 per image in cents
  }

  formatPrice(amountInCents) {
    return (amountInCents / 100).toFixed(2);
  }
}

export const paymentService = new PaymentService();
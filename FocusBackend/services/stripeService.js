// Initialize Stripe only if API key is provided
const stripe = process.env.STRIPE_SECRET_KEY 
  ? require('stripe')(process.env.STRIPE_SECRET_KEY)
  : null;
const logger = require('../utils/logger');

class StripeService {
  // Create a new customer
  async createCustomer(email, name) {
    try {
      const customer = await stripe.customers.create({
        email,
        name,
        metadata: {
          source: 'centra-web-app'
        }
      });
      return customer;
    } catch (error) {
      logger.error('Error creating Stripe customer', { error: error.message });
      throw error;
    }
  }

  // Create a checkout session for subscription or one-time payment
  async createCheckoutSession(customerId, priceId, successUrl, cancelUrl, mode = 'subscription') {
    if (!stripe) {
      throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY in your environment variables.');
    }
    try {
      const sessionConfig = {
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: mode,
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          source: 'centra-web-app'
        }
      };

      // Add subscription_data only for subscription mode
      if (mode === 'subscription') {
        sessionConfig.subscription_data = {
          metadata: {
            source: 'centra-web-app'
          }
        };
      }

      const session = await stripe.checkout.sessions.create(sessionConfig);
      return session;
    } catch (error) {
      logger.error('Error creating checkout session', { error: error.message });
      throw error;
    }
  }

  // Create a billing portal session
  async createBillingPortalSession(customerId, returnUrl) {
    if (!stripe) {
      throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY in your environment variables.');
    }
    try {
      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
      });
      return session;
    } catch (error) {
      logger.error('Error creating billing portal session', { error: error.message });
      throw error;
    }
  }

  // Get subscription details
  async getSubscription(subscriptionId) {
    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      return subscription;
    } catch (error) {
      console.error('Error retrieving subscription:', error);
      throw error;
    }
  }

  // Cancel subscription
  async cancelSubscription(subscriptionId) {
    try {
      const subscription = await stripe.subscriptions.cancel(subscriptionId);
      return subscription;
    } catch (error) {
      logger.error('Error canceling subscription', { error: error.message });
      throw error;
    }
  }

  // Update subscription
  async updateSubscription(subscriptionId, priceId) {
    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
        items: [{
          id: subscription.items.data[0].id,
          price: priceId,
        }],
        proration_behavior: 'create_prorations',
      });
      return updatedSubscription;
    } catch (error) {
      logger.error('Error updating subscription', { error: error.message });
      throw error;
    }
  }

  // Get customer's subscriptions
  async getCustomerSubscriptions(customerId) {
    try {
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: 'all',
      });
      return subscriptions;
    } catch (error) {
      logger.error('Error retrieving customer subscriptions', { error: error.message });
      throw error;
    }
  }

  // Verify webhook signature
  verifyWebhookSignature(payload, signature) {
    if (!stripe) {
      throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY in your environment variables.');
    }
    try {
      const event = stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
      return event;
    } catch (error) {
      logger.error('Webhook signature verification failed', { error: error.message });
      throw error;
    }
  }
}

module.exports = new StripeService();



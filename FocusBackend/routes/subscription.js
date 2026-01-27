const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const stripeService = require('../services/stripeService');
const logger = require('../utils/logger');

// @route   POST /api/subscription/create-checkout-session
// @desc    Create Stripe checkout session for subscription
// @access  Private
router.post('/create-checkout-session', auth, async (req, res, next) => {
  try {
    const { priceId, planType } = req.body;
    
    if (!priceId || typeof priceId !== 'string') {
      return res.status(400).json({ 
        success: false,
        message: 'Price ID is required' 
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    // Create or get Stripe customer
    let customerId = user.subscription.stripeCustomerId;
    if (!customerId) {
      const customer = await stripeService.createCustomer(
        user.email,
        `${user.firstName} ${user.lastName}`
      );
      customerId = customer.id;
      
      // Update user with customer ID
      user.subscription.stripeCustomerId = customerId;
      await user.save();
      logger.info('Stripe customer created', { userId: user._id, customerId });
    }

    // Determine payment mode: 'subscription' for monthly/annual, 'payment' for lifetime
    const isLifetime = planType === 'lifetime';
    const mode = isLifetime ? 'payment' : 'subscription';

    // Create checkout session
    const successUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard?subscription=success`;
    const cancelUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard?subscription=cancelled`;
    
    const session = await stripeService.createCheckoutSession(
      customerId,
      priceId,
      successUrl,
      cancelUrl,
      mode
    );

    logger.info('Checkout session created', { 
      userId: user._id, 
      sessionId: session.id,
      mode,
      planType 
    });

    res.json({ 
      success: true,
      sessionId: session.id, 
      url: session.url 
    });
  } catch (error) {
    logger.error('Create checkout session error', { 
      error: error.message, 
      stack: error.stack,
      userId: req.user?._id 
    });
    next(error);
  }
});

// @route   POST /api/subscription/create-portal-session
// @desc    Create Stripe billing portal session
// @access  Private
router.post('/create-portal-session', auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user || !user.subscription.stripeCustomerId) {
      return res.status(404).json({ 
        success: false,
        message: 'No subscription found' 
      });
    }

    const returnUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard`;
    const session = await stripeService.createBillingPortalSession(
      user.subscription.stripeCustomerId,
      returnUrl
    );

    logger.info('Billing portal session created', { userId: user._id });

    res.json({ 
      success: true,
      url: session.url 
    });
  } catch (error) {
    logger.error('Create portal session error', { 
      error: error.message, 
      stack: error.stack,
      userId: req.user?._id 
    });
    next(error);
  }
});

// @route   GET /api/subscription/status
// @desc    Get user's subscription status
// @access  Private
router.get('/status', auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    const subscription = user.subscription;
    
    // Determine if user is pro
    const isPro = subscription.plan !== 'free' && 
                  subscription.status === 'active' && 
                  subscription.currentPeriodEnd > new Date();

    res.json({
      success: true,
      plan: subscription.plan,
      status: subscription.status,
      isPro,
      currentPeriodEnd: subscription.currentPeriodEnd,
      stripeCustomerId: subscription.stripeCustomerId
    });
  } catch (error) {
    logger.error('Get subscription status error', { 
      error: error.message, 
      stack: error.stack,
      userId: req.user?._id 
    });
    next(error);
  }
});

// @route   POST /api/subscription/cancel
// @desc    Cancel user's subscription
// @access  Private
router.post('/cancel', auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user || !user.subscription.stripeSubscriptionId) {
      return res.status(404).json({ 
        success: false,
        message: 'No active subscription found' 
      });
    }

    // Cancel subscription in Stripe
    await stripeService.cancelSubscription(user.subscription.stripeSubscriptionId);

    // Update user subscription status
    user.subscription.status = 'canceled';
    user.subscription.plan = 'free';
    await user.save();

    logger.info('Subscription canceled', { userId: user._id });

    res.json({ 
      success: true,
      message: 'Subscription canceled successfully' 
    });
  } catch (error) {
    logger.error('Cancel subscription error', { 
      error: error.message, 
      stack: error.stack,
      userId: req.user?._id 
    });
    next(error);
  }
});

// @route   POST /api/subscription/webhook
// @desc    Handle Stripe webhooks
// @access  Public
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const signature = req.headers['stripe-signature'];
    const event = stripeService.verifyWebhookSignature(req.body, signature);

    logger.info('Stripe webhook received', { eventType: event.type });

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;
      case 'payment_intent.succeeded':
        // Handle one-time payment (lifetime plan)
        await handlePaymentIntentSucceeded(event.data.object);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
      default:
        logger.debug(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    logger.error('Webhook error', { 
      error: error.message, 
      stack: error.stack 
    });
    res.status(400).json({ 
      success: false,
      message: 'Webhook error' 
    });
  }
});

// Helper functions for webhook handling
async function handleCheckoutCompleted(session) {
  try {
    const customerId = session.customer;
    const subscriptionId = session.subscription;
    const paymentMode = session.mode; // 'subscription' or 'payment'
    
    // Find user by customer ID
    const user = await User.findOne({ 'subscription.stripeCustomerId': customerId });
    if (!user) {
      logger.warn('User not found for checkout completion', { customerId });
      return;
    }

    if (paymentMode === 'subscription' && subscriptionId) {
      // Handle subscription payment
      const subscription = await stripeService.getSubscription(subscriptionId);
      
      user.subscription.plan = 'premium';
      user.subscription.stripeSubscriptionId = subscriptionId;
      user.subscription.status = subscription.status;
      user.subscription.currentPeriodEnd = new Date(subscription.current_period_end * 1000);
      
      await user.save();
      logger.info('Subscription activated', { userId: user._id, subscriptionId });
    } else if (paymentMode === 'payment') {
      // Handle one-time payment (lifetime plan)
      user.subscription.plan = 'premium';
      user.subscription.status = 'active';
      // Set a far future date for lifetime (100 years from now)
      user.subscription.currentPeriodEnd = new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000);
      
      await user.save();
      logger.info('Lifetime plan activated', { userId: user._id, sessionId: session.id });
    }
  } catch (error) {
    logger.error('Error handling checkout completed', { 
      error: error.message, 
      stack: error.stack 
    });
  }
}

async function handlePaymentIntentSucceeded(paymentIntent) {
  try {
    // This is a backup handler for one-time payments
    // The checkout.session.completed event should handle it, but this provides redundancy
    const customerId = paymentIntent.customer;
    
    if (!customerId) return;
    
    const user = await User.findOne({ 'subscription.stripeCustomerId': customerId });
    if (!user) return;

    // Only update if not already premium (to avoid overwriting subscription data)
    if (user.subscription.plan !== 'premium') {
      user.subscription.plan = 'premium';
      user.subscription.status = 'active';
      user.subscription.currentPeriodEnd = new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000);
      
      await user.save();
      logger.info('Lifetime plan activated via payment intent', { userId: user._id, paymentIntentId: paymentIntent.id });
    }
  } catch (error) {
    logger.error('Error handling payment intent succeeded', { 
      error: error.message, 
      stack: error.stack 
    });
  }
}

async function handleSubscriptionUpdated(subscription) {
  try {
    const user = await User.findOne({ 'subscription.stripeSubscriptionId': subscription.id });
    if (!user) return;

    user.subscription.status = subscription.status;
    user.subscription.currentPeriodEnd = new Date(subscription.current_period_end * 1000);
    
    await user.save();
    logger.info('Subscription updated', { userId: user._id, subscriptionId: subscription.id });
  } catch (error) {
    logger.error('Error handling subscription updated', { 
      error: error.message, 
      stack: error.stack 
    });
  }
}

async function handleSubscriptionDeleted(subscription) {
  try {
    const user = await User.findOne({ 'subscription.stripeSubscriptionId': subscription.id });
    if (!user) return;

    user.subscription.plan = 'free';
    user.subscription.status = 'canceled';
    user.subscription.stripeSubscriptionId = null;
    
    await user.save();
    logger.info('Subscription canceled', { userId: user._id, subscriptionId: subscription.id });
  } catch (error) {
    logger.error('Error handling subscription deleted', { 
      error: error.message, 
      stack: error.stack 
    });
  }
}

async function handlePaymentSucceeded(invoice) {
  try {
    const subscriptionId = invoice.subscription;
    const user = await User.findOne({ 'subscription.stripeSubscriptionId': subscriptionId });
    if (!user) return;

    user.subscription.status = 'active';
    await user.save();
    logger.info('Payment succeeded', { userId: user._id, invoiceId: invoice.id });
  } catch (error) {
    logger.error('Error handling payment succeeded', { 
      error: error.message, 
      stack: error.stack 
    });
  }
}

async function handlePaymentFailed(invoice) {
  try {
    const subscriptionId = invoice.subscription;
    const user = await User.findOne({ 'subscription.stripeSubscriptionId': subscriptionId });
    if (!user) return;

    user.subscription.status = 'past_due';
    await user.save();
    logger.warn('Payment failed', { userId: user._id, invoiceId: invoice.id });
  } catch (error) {
    logger.error('Error handling payment failed', { 
      error: error.message, 
      stack: error.stack 
    });
  }
}

module.exports = router;



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

    // Enforce one active subscription per account: block new checkout if customer already has active/trialing subscription
    try {
      const subscriptions = await stripeService.getCustomerSubscriptions(customerId);
      const hasActive = subscriptions.data && subscriptions.data.some(
        sub => sub.status === 'active' || sub.status === 'trialing'
      );
      if (hasActive) {
        logger.info('Checkout blocked: customer already has active subscription', { userId: user._id, customerId });
        const returnUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard`;
        const activeSub = subscriptions.data.find(s => s.status === 'active' || s.status === 'trialing');
        const portalSession = await stripeService.createBillingPortalSession(
          customerId,
          returnUrl,
          activeSub ? activeSub.id : null
        );
        return res.status(409).json({
          success: false,
          code: 'ALREADY_SUBSCRIBED',
          message: 'You already have an active subscription. Use Manage Billing to change or cancel it.',
          portalUrl: portalSession.url,
        });
      }
    } catch (checkErr) {
      logger.warn('Could not check existing subscriptions, allowing checkout', { error: checkErr.message, customerId });
      // Proceed with checkout if we can't check (e.g. Stripe API issue)
    }

    // Also block if user is already Pro in our DB (e.g. lifetime or subscription already synced)
    if (user.subscription.plan === 'premium' && user.subscription.status === 'active') {
      logger.info('Checkout blocked: user already has premium plan', { userId: user._id });
      try {
        const returnUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard`;
        const portalSession = await stripeService.createBillingPortalSession(
          customerId,
          returnUrl,
          user.subscription.stripeSubscriptionId || null
        );
        return res.status(409).json({
          success: false,
          code: 'ALREADY_SUBSCRIBED',
          message: 'You already have an active plan. Use Manage Billing to change or cancel it.',
          portalUrl: portalSession.url,
        });
      } catch (portalErr) {
        return res.status(409).json({
          success: false,
          code: 'ALREADY_SUBSCRIBED',
          message: 'You already have an active plan. Go to Settings → Subscription to manage billing.',
        });
      }
    }

    // Determine payment mode: 'subscription' for monthly/annual, 'payment' for lifetime
    const isLifetime = planType === 'lifetime';
    const mode = isLifetime ? 'payment' : 'subscription';

    // Create checkout session
    const successUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard?subscription=success&session_id={CHECKOUT_SESSION_ID}`;
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
      returnUrl,
      user.subscription.stripeSubscriptionId || null
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
// @desc    Get user's subscription status (syncs from Stripe when customer exists so state is always current)
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

    // When user has Stripe customer ID, sync from Stripe so cancel/resubscribe in Portal is reflected
    if (user.subscription.stripeCustomerId) {
      try {
        const subscriptions = await stripeService.getCustomerSubscriptions(user.subscription.stripeCustomerId);
        const now = new Date();
        const activeSub = subscriptions.data && subscriptions.data.find(sub => {
          if (sub.status === 'active' || sub.status === 'trialing') return true;
          if (sub.status === 'canceled' && sub.current_period_end && sub.current_period_end * 1000 > now.getTime()) return true;
          return false;
        });
        if (activeSub) {
          user.subscription.plan = 'premium';
          user.subscription.stripeSubscriptionId = activeSub.id;
          user.subscription.status = activeSub.status;
          user.subscription.currentPeriodEnd = new Date(activeSub.current_period_end * 1000);
          await user.save();
        } else {
          // No active or in-period subscription in Stripe: ensure we downgrade if period has ended
          const periodEnd = user.subscription.currentPeriodEnd ? new Date(user.subscription.currentPeriodEnd) : null;
          if (!periodEnd || periodEnd <= now) {
            user.subscription.plan = 'free';
            user.subscription.status = 'canceled';
            user.subscription.stripeSubscriptionId = null;
            await user.save();
          }
        }
      } catch (syncErr) {
        logger.warn('Subscription sync from Stripe failed in GET /status', { error: syncErr.message, userId: user._id });
      }
    }

    const subscription = user.subscription;
    const now = new Date();
    const stillInPaidPeriod = subscription.currentPeriodEnd && new Date(subscription.currentPeriodEnd) > now;
    const isPro =
      subscription.plan === 'premium' &&
      (subscription.status === 'active' || subscription.status === 'trialing' ||
        (subscription.status === 'canceled' && stillInPaidPeriod));

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

// @route   POST /api/subscription/verify
// @desc    Verify and sync subscription status from Stripe
// @access  Private
async function verifySubscriptionHandler(req, res, next) {
  try {
    const user = await User.findById(req.user._id);
    const { session_id: sessionId } = req.body || {};

    logger.info('Verify subscription called', { userId: user?._id, hasSessionId: !!sessionId, sessionIdPrefix: sessionId ? sessionId.slice(0, 20) : null });

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    // 0) If session_id provided (from Stripe redirect), verify that session directly - most reliable
    if (sessionId && typeof sessionId === 'string' && sessionId.startsWith('cs_')) {
      try {
        const session = await stripeService.getCheckoutSession(sessionId, { expandCustomer: true });
        const sessionCustomerId = typeof session.customer === 'string'
          ? session.customer
          : (session.customer && session.customer.id);
        const sessionEmail = (session.customer_email || (session.customer && session.customer.email) || '').toString().toLowerCase();
        const userEmail = (user.email || '').toLowerCase();
        const customerMatch =
          sessionCustomerId === (user.subscription.stripeCustomerId || '') ||
          (session.customer_email && (session.customer_email || '').toLowerCase() === userEmail) ||
          (sessionEmail && sessionEmail === userEmail);
        // Also accept when session is complete and we have session customer but user has no stripeCustomerId yet (e.g. redirect before save)
        const isComplete = session.status === 'complete' || session.payment_status === 'paid';
        const canTrustSession =
          isComplete &&
          (customerMatch || (!user.subscription.stripeCustomerId && sessionCustomerId));

        logger.info('Session lookup', {
          sessionStatus: session.status,
          paymentStatus: session.payment_status,
          sessionMode: session.mode,
          sessionCustomerId: sessionCustomerId ? String(sessionCustomerId).slice(0, 15) : null,
          userStripeCustomerId: user.subscription.stripeCustomerId ? String(user.subscription.stripeCustomerId).slice(0, 15) : null,
          customerMatch,
          canTrustSession,
          hasSubscription: !!session.subscription
        });

        if (session && canTrustSession) {
          // Ensure we have customer ID if missing (e.g. redirect before save)
          if (!user.subscription.stripeCustomerId && sessionCustomerId) {
            user.subscription.stripeCustomerId = sessionCustomerId;
            await user.save();
          }
          if (session.mode === 'subscription' && session.subscription) {
            const subscriptionId = typeof session.subscription === 'string'
              ? session.subscription
              : (session.subscription && session.subscription.id);
            if (!subscriptionId) {
              logger.warn('Session has no subscription id, upgrading from session anyway', { sessionId });
              user.subscription.plan = 'premium';
              user.subscription.stripeCustomerId = sessionCustomerId || user.subscription.stripeCustomerId;
              user.subscription.status = 'active';
              user.subscription.currentPeriodEnd = new Date(Date.now() + 31 * 24 * 60 * 60 * 1000); // ~1 month fallback when Stripe session has no subscription id
              await user.save();
              logger.info('Subscription verified from session_id (no sub id)', { userId: user._id, sessionId });
              return res.json({
                success: true,
                plan: 'premium',
                status: 'active',
                isPro: true,
                currentPeriodEnd: user.subscription.currentPeriodEnd,
                synced: true
              });
            } else {
              const subscription = await stripeService.getSubscription(subscriptionId);
              user.subscription.plan = 'premium';
              user.subscription.stripeCustomerId = sessionCustomerId || user.subscription.stripeCustomerId;
              user.subscription.stripeSubscriptionId = subscription.id;
              user.subscription.status = subscription.status;
              user.subscription.currentPeriodEnd = new Date(subscription.current_period_end * 1000);
              await user.save();
              logger.info('Subscription verified from session_id', { userId: user._id, sessionId });
              return res.json({
                success: true,
                plan: 'premium',
                status: subscription.status,
                isPro: true,
                currentPeriodEnd: user.subscription.currentPeriodEnd,
                synced: true
              });
            }
          }
          if (session.mode === 'payment') {
            user.subscription.plan = 'premium';
            user.subscription.stripeCustomerId = sessionCustomerId || user.subscription.stripeCustomerId;
            user.subscription.status = 'active';
            user.subscription.currentPeriodEnd = new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000);
            await user.save();
            logger.info('Lifetime plan verified from session_id', { userId: user._id, sessionId });
            return res.json({
              success: true,
              plan: 'premium',
              status: 'active',
              isPro: true,
              currentPeriodEnd: user.subscription.currentPeriodEnd,
              synced: true
            });
          }
          // Session is complete and trusted but mode/subscription not handled above - upgrade anyway
          user.subscription.plan = 'premium';
          user.subscription.stripeCustomerId = sessionCustomerId || user.subscription.stripeCustomerId;
          user.subscription.status = 'active';
          user.subscription.currentPeriodEnd = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
          await user.save();
          logger.info('Subscription verified from session_id (fallback)', { userId: user._id, sessionId });
          return res.json({
            success: true,
            plan: 'premium',
            status: 'active',
            isPro: true,
            currentPeriodEnd: user.subscription.currentPeriodEnd,
            synced: true
          });
        }
      } catch (sessionErr) {
        logger.warn('Stripe getCheckoutSession by session_id failed', { error: sessionErr.message, sessionId });
      }
    }

    if (!user.subscription.stripeCustomerId) {
      return res.json({
        success: true,
        plan: user.subscription.plan,
        status: user.subscription.status,
        isPro: false,
        message: 'No Stripe customer ID found'
      });
    }

    const customerId = user.subscription.stripeCustomerId;

    // 1) Check for active subscriptions (monthly/annual), including canceled-but-still-in-period (cancel_at_period_end)
    try {
      const subscriptions = await stripeService.getCustomerSubscriptions(customerId);
      const now = new Date();
      const activeSubscription = subscriptions.data.find(sub => {
        if (sub.status === 'active' || sub.status === 'trialing') return true;
        if (sub.status === 'canceled' && sub.current_period_end && sub.current_period_end * 1000 > now.getTime()) return true;
        return false;
      });

      if (activeSubscription) {
        user.subscription.plan = 'premium';
        user.subscription.stripeSubscriptionId = activeSubscription.id;
        user.subscription.status = activeSubscription.status;
        user.subscription.currentPeriodEnd = new Date(activeSubscription.current_period_end * 1000);
        await user.save();
        logger.info('Subscription verified and synced', { userId: user._id, subscriptionId: activeSubscription.id });
        return res.json({
          success: true,
          plan: 'premium',
          status: activeSubscription.status,
          isPro: true,
          currentPeriodEnd: user.subscription.currentPeriodEnd,
          synced: true
        });
      }
    } catch (stripeErr) {
      logger.warn('Stripe getCustomerSubscriptions failed, trying checkout sessions', { error: stripeErr.message, customerId });
    }

    // 2) Check completed Checkout Sessions (most reliable after redirect)
    try {
      const checkoutSessions = await stripeService.listCustomerCheckoutSessions(customerId);
      const completedSession = checkoutSessions.data && checkoutSessions.data[0];

      if (completedSession) {
        if (completedSession.mode === 'subscription' && completedSession.subscription) {
          const subscription = await stripeService.getSubscription(completedSession.subscription);
          user.subscription.plan = 'premium';
          user.subscription.stripeSubscriptionId = subscription.id;
          user.subscription.status = subscription.status;
          user.subscription.currentPeriodEnd = new Date(subscription.current_period_end * 1000);
          await user.save();
          logger.info('Subscription verified from checkout session', { userId: user._id, subscriptionId: subscription.id });
          return res.json({
            success: true,
            plan: 'premium',
            status: subscription.status,
            isPro: true,
            currentPeriodEnd: user.subscription.currentPeriodEnd,
            synced: true
          });
        }
        if (completedSession.mode === 'payment') {
          user.subscription.plan = 'premium';
          user.subscription.status = 'active';
          user.subscription.currentPeriodEnd = new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000);
          await user.save();
          logger.info('Lifetime plan verified from checkout session', { userId: user._id });
          return res.json({
            success: true,
            plan: 'premium',
            status: 'active',
            isPro: true,
            currentPeriodEnd: user.subscription.currentPeriodEnd,
            synced: true
          });
        }
      }
    } catch (stripeErr) {
      logger.warn('Stripe listCustomerCheckoutSessions failed, trying payment intents', { error: stripeErr.message, customerId });
    }

    // 3) Fallback: one-time payments (PaymentIntent) for lifetime
    try {
      const paymentIntents = await stripeService.getCustomerPaymentIntents(customerId);
      const successfulPayment = paymentIntents.data.find(pi => pi.status === 'succeeded');

      if (successfulPayment && user.subscription.plan !== 'premium') {
        user.subscription.plan = 'premium';
        user.subscription.status = 'active';
        user.subscription.currentPeriodEnd = new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000);
        await user.save();
        logger.info('Lifetime plan verified from payment intent', { userId: user._id, paymentIntentId: successfulPayment.id });
        return res.json({
          success: true,
          plan: 'premium',
          status: 'active',
          isPro: true,
          currentPeriodEnd: user.subscription.currentPeriodEnd,
          synced: true
        });
      }
    } catch (stripeErr) {
      logger.warn('Stripe getCustomerPaymentIntents failed', { error: stripeErr.message, customerId });
    }

    // No active subscription or payment found - return current state
    // Pro = premium and (active/trialing, or canceled but still within paid period)
    const now = new Date();
    const stillInPaidPeriod = user.subscription.currentPeriodEnd && new Date(user.subscription.currentPeriodEnd) > now;
    const isPro =
      user.subscription.plan === 'premium' &&
      (user.subscription.status === 'active' || user.subscription.status === 'trialing' ||
        (user.subscription.status === 'canceled' && stillInPaidPeriod));

    res.json({
      success: true,
      plan: user.subscription.plan,
      status: user.subscription.status,
      isPro,
      currentPeriodEnd: user.subscription.currentPeriodEnd,
      synced: false
    });
  } catch (error) {
    logger.error('Verify subscription error', { 
      error: error.message, 
      stack: error.stack,
      userId: req.user?._id 
    });
    next(error);
  }
}

router.post('/verify', auth, verifySubscriptionHandler);

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

    const periodEnd = new Date(subscription.current_period_end * 1000);
    user.subscription.status = subscription.status;
    user.subscription.currentPeriodEnd = periodEnd;

    if (subscription.status === 'active' || subscription.status === 'trialing') {
      user.subscription.plan = 'premium';
      user.subscription.stripeSubscriptionId = subscription.id;
    } else if ((subscription.status === 'canceled' || subscription.status === 'unpaid' || subscription.status === 'past_due') &&
        periodEnd <= new Date()) {
      user.subscription.plan = 'free';
      user.subscription.stripeSubscriptionId = null;
    }
    // If status is 'canceled' but period hasn't ended yet (cancel_at_period_end), keep plan premium

    await user.save();
    logger.info('Subscription updated', { userId: user._id, subscriptionId: subscription.id, status: subscription.status });
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
module.exports.verifySubscriptionHandler = verifySubscriptionHandler;



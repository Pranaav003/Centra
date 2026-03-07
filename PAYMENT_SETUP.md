# Stripe Payment System Setup Guide for Centra

## Overview
The payment system is fully integrated with Stripe and supports:
- **Monthly Subscription**: $4.99/month
- **Annual Subscription**: $2.99/month (billed annually at $35.88)
- **Lifetime Access**: $50.00 one-time payment

## Quick Start

1. **Get Stripe API Keys**: Sign up at [stripe.com](https://stripe.com) and get your test API keys
2. **Create Products**: Create 3 products in Stripe Dashboard (see Step 3 below)
3. **Configure Environment**: Add Stripe keys and price IDs to `.env` files
4. **Set Up Webhooks**: Configure webhook endpoint for payment events
5. **Test**: Use test cards to verify everything works

## Step-by-Step Setup

## Backend Setup

### 1. Install Dependencies
Stripe is already installed. If you need to reinstall:
```bash
cd WebBlocker/FocusBackend
npm install stripe
```

### 2. Configure Environment Variables
Create a `.env` file in `WebBlocker/FocusBackend/` with:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Stripe Price IDs (get these from Stripe Dashboard after creating products)
STRIPE_PRICE_MONTHLY=price_xxxxx_monthly
STRIPE_PRICE_ANNUAL=price_xxxxx_annual
STRIPE_PRICE_LIFETIME=price_xxxxx_lifetime
```

### 3. Create Products and Prices in Stripe Dashboard

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/test/products)
2. Create three products:

   **Product 1: Monthly Plan**
   - Name: "Centra Pro Monthly"
   - Description: "Monthly subscription to Centra Pro"
   - Price: $4.99 USD
   - Billing period: Monthly (recurring)
   - Copy the Price ID (starts with `price_`)

   **Product 2: Annual Plan**
   - Name: "Centra Pro Annual"
   - Description: "Annual subscription to Centra Pro - Save 40%"
   - Price: $35.88 USD (or $2.99/month billed annually)
   - Billing period: Yearly (recurring)
   - Copy the Price ID

   **Product 3: Lifetime Plan**
   - Name: "Centra Pro Lifetime"
   - Description: "One-time payment for lifetime access to Centra Pro"
   - Price: $50.00 USD
   - Billing period: One-time payment
   - Copy the Price ID

3. Add the Price IDs to your `.env` file

### 4. Configure Webhook Endpoint

1. Go to [Stripe Webhooks](https://dashboard.stripe.com/test/webhooks)
2. Click "Add endpoint"
3. Set endpoint URL: `https://yourdomain.com/api/subscription/webhook` (or use Stripe CLI for local testing)
4. Select events to listen for:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET` in your `.env` file

### 5. Local Testing with Stripe CLI (Optional)

For local development, use Stripe CLI to forward webhooks:

```bash
# Install Stripe CLI
# macOS: brew install stripe/stripe-cli/stripe
# Then login: stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:5001/api/subscription/webhook
```

This will give you a webhook secret starting with `whsec_` - use this for `STRIPE_WEBHOOK_SECRET` in development.

## Frontend Setup

### 1. Configure Environment Variables
Create a `.env` file in `WebBlocker/FocusWebApp/` with:

```env
# Stripe Price IDs (must match backend)
VITE_STRIPE_PRICE_MONTHLY=price_xxxxx_monthly
VITE_STRIPE_PRICE_ANNUAL=price_xxxxx_annual
VITE_STRIPE_PRICE_LIFETIME=price_xxxxx_lifetime
```

**Note**: Vite requires the `VITE_` prefix for environment variables to be exposed to the frontend.

### 2. Restart Development Server
After adding environment variables, restart the Vite dev server:
```bash
cd WebBlocker/FocusWebApp
npm run dev
```

## Testing Guide

### Prerequisites for Testing
- Backend server running on port 5001
- Frontend running on port 3000
- Stripe test mode API keys configured
- Webhook endpoint configured (or Stripe CLI running for local testing)

### Test Cards (Stripe Test Mode)

Use these test card numbers in Stripe checkout:

#### Success Cards
- **Basic Success**: `4242 4242 4242 4242`
  - Use any future expiry date (e.g., 12/34)
  - Any CVC (e.g., 123)
  - Any ZIP code (e.g., 12345)

- **Visa Success**: `4242 4242 4242 4242`
- **Mastercard Success**: `5555 5555 5555 4444`
- **American Express Success**: `3782 822463 10005`

#### Decline Cards
- **Card Declined**: `4000 0000 0000 0002`
- **Insufficient Funds**: `4000 0000 0000 9995`
- **Lost Card**: `4000 0000 0000 9987`
- **Stolen Card**: `4000 0000 0000 9979`

#### Authentication Required (3D Secure)
- **Requires Authentication**: `4000 0025 0000 3155`
  - Will prompt for authentication during checkout
  - Use any future expiry, CVC, and ZIP

#### Other Test Scenarios
- **Processing Error**: `4000 0000 0000 0119`
- **Expired Card**: `4000 0000 0000 0069`
- **Incorrect CVC**: `4000 0000 0000 0127`

### Complete Testing Flow

#### Test 1: Monthly Subscription
1. Log into Centra dashboard
2. Click on Settings (gear icon)
3. Click "Upgrade to Pro" or open subscription modal
4. Select "Monthly" plan ($4.99/month)
5. Click "Upgrade to Pro"
6. You'll be redirected to Stripe Checkout
7. Enter test card: `4242 4242 4242 4242`
8. Enter any future expiry (e.g., 12/34), CVC (123), ZIP (12345)
9. Click "Pay $4.99"
10. You'll be redirected back to dashboard with `?subscription=success`
11. Verify subscription status shows "Premium" or "Pro"
12. Check Stripe Dashboard → Customers → verify customer created
13. Check Stripe Dashboard → Subscriptions → verify subscription active

#### Test 2: Annual Subscription
1. Repeat steps 1-4 from Test 1
2. Select "Annual" plan ($35.88/year)
3. Complete checkout with test card
4. Verify subscription is active
5. Check that `currentPeriodEnd` is ~1 year from now

#### Test 3: Lifetime Plan
1. Repeat steps 1-4 from Test 1
2. Select "Lifetime" plan ($50.00 one-time)
3. Complete checkout with test card
4. Verify subscription is active
5. Check that `currentPeriodEnd` is set far in the future (100 years)

#### Test 4: Payment Decline
1. Start checkout process
2. Use decline card: `4000 0000 0000 0002`
3. Verify error message appears
4. Verify subscription status remains "Free"

#### Test 5: 3D Secure Authentication
1. Start checkout process
2. Use 3D Secure card: `4000 0025 0000 3155`
3. Complete authentication challenge
4. Verify payment succeeds

#### Test 6: Billing Portal
1. After successful subscription, go to Settings
2. Click "Manage Billing" or "Manage Subscription"
3. Verify Stripe Billing Portal opens
4. Test canceling subscription
5. Verify subscription status updates to "canceled"

### Testing Webhooks Locally

For local development, use Stripe CLI:

```bash
# Install Stripe CLI (if not installed)
# macOS: brew install stripe/stripe-cli/stripe
# Linux: See https://stripe.com/docs/stripe-cli

# Login to Stripe
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:5001/api/subscription/webhook
```

This will output a webhook signing secret (starts with `whsec_`). Use this in your backend `.env` file as `STRIPE_WEBHOOK_SECRET`.

### Verifying Webhook Events

Check webhook events in Stripe Dashboard:
1. Go to [Stripe Dashboard → Developers → Webhooks](https://dashboard.stripe.com/test/webhooks)
2. Click on your webhook endpoint
3. View "Events" tab to see all received events
4. Click on individual events to see payload details

Expected events after successful checkout:
- `checkout.session.completed`
- `customer.subscription.created` (for monthly/annual)
- `invoice.payment_succeeded` (for monthly/annual)
- `payment_intent.succeeded` (for lifetime)

### Testing Checklist

- [ ] Monthly subscription checkout works
- [ ] Annual subscription checkout works
- [ ] Lifetime plan checkout works
- [ ] Payment decline is handled gracefully
- [ ] 3D Secure authentication works
- [ ] Webhook receives `checkout.session.completed` event
- [ ] User subscription status updates after payment
- [ ] Billing portal opens correctly
- [ ] Subscription cancellation works
- [ ] Subscription status persists after page refresh
- [ ] Error messages display correctly for failed payments

## How It Works

### Subscription Flow (Monthly/Annual)
1. User selects plan and clicks "Upgrade to Pro"
2. Frontend calls `/api/subscription/create-checkout-session` with `planType` and `priceId`
3. Backend creates Stripe checkout session in `subscription` mode
4. User completes payment on Stripe
5. Stripe webhook `checkout.session.completed` fires
6. Backend updates user subscription status to `premium`
7. User is redirected back with `?subscription=success`

### One-Time Payment Flow (Lifetime)
1. User selects "Lifetime" plan
2. Frontend calls `/api/subscription/create-checkout-session` with `planType: 'lifetime'`
3. Backend creates Stripe checkout session in `payment` mode
4. User completes payment on Stripe
5. Stripe webhook `checkout.session.completed` fires (with `mode: 'payment'`)
6. Backend updates user subscription to `premium` with far-future expiry date
7. User is redirected back with `?subscription=success`

## Important Notes

- **Test Mode vs Live Mode**: Make sure you're using test API keys during development
- **Webhook Security**: Always verify webhook signatures in production
- **Price IDs**: Must match between frontend and backend
- **Environment Variables**: Restart servers after changing `.env` files
- **Lifetime Plan**: Sets `currentPeriodEnd` to 100 years in the future

## Troubleshooting

### Payment not processing
- Check Stripe Dashboard for errors
- Verify webhook endpoint is configured correctly
- Check backend logs for webhook events
- Ensure price IDs are correct

### Subscription status not updating
- Check webhook is receiving events (Stripe Dashboard → Webhooks → View logs)
- Verify webhook secret is correct
- Check backend logs for webhook processing errors

### Environment variables not working
- Frontend: Must use `VITE_` prefix and restart dev server
- Backend: Must restart server after changing `.env`

## Verification Script

A verification script is included to check your Stripe setup:

```bash
cd WebBlocker/FocusBackend
node scripts/verify-stripe-setup.js
```

This script will:
- ✅ Check all required environment variables are set
- ✅ Test Stripe API connection
- ✅ Verify products and prices exist
- ✅ Validate webhook configuration
- ✅ Check price amounts match expected values

## Quick Reference

### Test Cards
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0025 0000 3155`

### Stripe Dashboard Links
- **API Keys**: https://dashboard.stripe.com/test/apikeys
- **Products**: https://dashboard.stripe.com/test/products
- **Webhooks**: https://dashboard.stripe.com/test/webhooks
- **Customers**: https://dashboard.stripe.com/test/customers
- **Subscriptions**: https://dashboard.stripe.com/test/subscriptions

### Local Webhook Testing
```bash
stripe listen --forward-to localhost:5001/api/subscription/webhook
```

### Environment Variables Checklist

**Backend (.env):**
- [ ] `STRIPE_SECRET_KEY` (starts with `sk_test_` or `sk_live_`)
- [ ] `STRIPE_WEBHOOK_SECRET` (starts with `whsec_`)
- [ ] `STRIPE_PRICE_MONTHLY` (starts with `price_`)
- [ ] `STRIPE_PRICE_ANNUAL` (starts with `price_`)
- [ ] `STRIPE_PRICE_LIFETIME` (starts with `price_`)

**Frontend (.env):**
- [ ] `VITE_STRIPE_PRICE_MONTHLY` (must match backend)
- [ ] `VITE_STRIPE_PRICE_ANNUAL` (must match backend)
- [ ] `VITE_STRIPE_PRICE_LIFETIME` (must match backend)



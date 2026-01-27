# Payment System Setup Guide

## Overview
The payment system is now fully integrated with Stripe and supports:
- **Monthly Subscription**: $4.99/month
- **Annual Subscription**: $2.99/month (billed annually at $35.88)
- **Lifetime Access**: $50.00 one-time payment

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
   - Name: "Focus Pro Monthly"
   - Price: $4.99
   - Billing period: Monthly (recurring)
   - Copy the Price ID (starts with `price_`)

   **Product 2: Annual Plan**
   - Name: "Focus Pro Annual"
   - Price: $35.88 (or $2.99/month billed annually)
   - Billing period: Yearly (recurring)
   - Copy the Price ID

   **Product 3: Lifetime Plan**
   - Name: "Focus Pro Lifetime"
   - Price: $50.00
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

## Testing

### Test Cards (Stripe Test Mode)
Use these test card numbers in Stripe checkout:

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Requires Authentication**: `4000 0025 0000 3155`

Use any future expiry date, any CVC, and any ZIP code.

### Testing Flow

1. Open the subscription modal from Settings
2. Select a plan (Monthly, Annual, or Lifetime)
3. Click "Upgrade to Pro"
4. You'll be redirected to Stripe Checkout
5. Use a test card to complete payment
6. After payment, you'll be redirected back to the dashboard
7. Your subscription status should update automatically

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



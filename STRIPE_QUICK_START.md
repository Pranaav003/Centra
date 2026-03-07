# Stripe Quick Start Guide

This guide will help you set up Stripe payments for Centra in under 10 minutes.

## Step 1: Get Stripe Account & API Keys (2 minutes)

1. Sign up at [stripe.com](https://stripe.com) (free account)
2. Go to [API Keys](https://dashboard.stripe.com/test/apikeys)
3. Copy your **Test** secret key (starts with `sk_test_`)
4. Add it to `WebBlocker/FocusBackend/.env`:
   ```env
   STRIPE_SECRET_KEY=sk_test_your_actual_key_here
   ```

## Step 2: Create Products in Stripe (3 minutes)

1. Go to [Products](https://dashboard.stripe.com/test/products)
2. Click **"+ Add product"** three times:

   **Product 1: Monthly**
   - Name: `Centra Pro Monthly`
   - Description: `Monthly subscription to Centra Pro`
   - Price: `$4.99 USD`
   - Billing: `Recurring` → `Monthly`
   - Click **Save**
   - **Copy the Price ID** (starts with `price_`)

   **Product 2: Annual**
   - Name: `Centra Pro Annual`
   - Description: `Annual subscription to Centra Pro - Save 40%`
   - Price: `$35.88 USD`
   - Billing: `Recurring` → `Yearly`
   - Click **Save**
   - **Copy the Price ID**

   **Product 3: Lifetime**
   - Name: `Centra Pro Lifetime`
   - Description: `One-time payment for lifetime access`
   - Price: `$50.00 USD`
   - Billing: `One-time`
   - Click **Save**
   - **Copy the Price ID**

3. Add Price IDs to your `.env` files:

   **Backend** (`WebBlocker/FocusBackend/.env`):
   ```env
   STRIPE_PRICE_MONTHLY=price_xxxxx_monthly
   STRIPE_PRICE_ANNUAL=price_xxxxx_annual
   STRIPE_PRICE_LIFETIME=price_xxxxx_lifetime
   ```

   **Frontend** (`WebBlocker/FocusWebApp/.env`):
   ```env
   VITE_STRIPE_PRICE_MONTHLY=price_xxxxx_monthly
   VITE_STRIPE_PRICE_ANNUAL=price_xxxxx_annual
   VITE_STRIPE_PRICE_LIFETIME=price_xxxxx_lifetime
   ```

## Step 3: Set Up Webhooks for Local Testing (2 minutes)

### Option A: Stripe CLI (Recommended for Local Development)

1. Install Stripe CLI:
   ```bash
   # macOS
   brew install stripe/stripe-cli/stripe
   
   # Or download from: https://stripe.com/docs/stripe-cli
   ```

2. Login:
   ```bash
   stripe login
   ```

3. Forward webhooks to your local server:
   ```bash
   stripe listen --forward-to localhost:5001/api/subscription/webhook
   ```

4. Copy the webhook signing secret (starts with `whsec_`) from the output
5. Add it to `WebBlocker/FocusBackend/.env`:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_your_secret_here
   ```

### Option B: Stripe Dashboard (For Production)

1. Go to [Webhooks](https://dashboard.stripe.com/test/webhooks)
2. Click **"Add endpoint"**
3. Endpoint URL: `https://yourdomain.com/api/subscription/webhook`
4. Select events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click **"Add endpoint"**
6. Copy the **Signing secret** (starts with `whsec_`)
7. Add it to your `.env` file

## Step 4: Verify Setup (1 minute)

Run the verification script:

```bash
cd WebBlocker/FocusBackend
node scripts/verify-stripe-setup.js
```

This will check:
- ✅ All environment variables are set
- ✅ Stripe API connection works
- ✅ Products and prices exist
- ✅ Webhook configuration is correct

## Step 5: Test Payment (2 minutes)

1. **Start your servers:**
   ```bash
   # Terminal 1: Backend
   cd WebBlocker/FocusBackend
   npm run dev

   # Terminal 2: Frontend
   cd WebBlocker/FocusWebApp
   npm run dev

   # Terminal 3: Stripe CLI (if using local webhooks)
   stripe listen --forward-to localhost:5001/api/subscription/webhook
   ```

2. **Test a payment:**
   - Open http://localhost:3000
   - Log in to your account
   - Go to Settings → Upgrade to Pro
   - Select a plan (Monthly, Annual, or Lifetime)
   - Click "Upgrade to Pro"
   - Use test card: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., `12/34`)
   - CVC: Any 3 digits (e.g., `123`)
   - ZIP: Any 5 digits (e.g., `12345`)
   - Click "Pay"

3. **Verify success:**
   - You should be redirected back to dashboard
   - Subscription status should show "Premium" or "Pro"
   - Check Stripe Dashboard → Customers to see the customer
   - Check Stripe Dashboard → Subscriptions (for monthly/annual)

## Test Cards Reference

| Scenario | Card Number | Expected Result |
|----------|-------------|-----------------|
| **Success** | `4242 4242 4242 4242` | Payment succeeds |
| **Decline** | `4000 0000 0000 0002` | Payment declined |
| **3D Secure** | `4000 0025 0000 3155` | Requires authentication |

Use any future expiry date, any CVC, and any ZIP code.

## Troubleshooting

### "Stripe is not configured" error
- Check `STRIPE_SECRET_KEY` is set in backend `.env`
- Restart backend server after changing `.env`

### "Price ID not found" error
- Verify Price IDs match between frontend and backend `.env` files
- Check Price IDs exist in Stripe Dashboard
- Make sure you're using **test** mode Price IDs (not live)

### Webhook not receiving events
- For local: Make sure Stripe CLI is running: `stripe listen --forward-to localhost:5001/api/subscription/webhook`
- Check webhook secret matches in `.env`
- Verify webhook endpoint URL is correct

### Payment succeeds but subscription doesn't update
- Check webhook is receiving events (Stripe Dashboard → Webhooks → View logs)
- Check backend logs for webhook processing errors
- Verify webhook secret is correct

## Next Steps

- Read the full [PAYMENT_SETUP.md](./PAYMENT_SETUP.md) for detailed documentation
- Test all three payment plans (Monthly, Annual, Lifetime)
- Test payment decline scenarios
- Test subscription cancellation via billing portal

## Need Help?

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Test Cards](https://stripe.com/docs/testing)
- [Stripe CLI Guide](https://stripe.com/docs/stripe-cli)

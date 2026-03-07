# Stripe Setup & Testing Guide

## What You Need to Do (5 Steps)

### Step 1: Get Stripe Account & API Key (2 minutes)

1. **Sign up for Stripe** (if you don't have an account):
   - Go to https://stripe.com
   - Click "Start now" (it's free)
   - Complete the signup form

2. **Get your Test API Key**:
   - After logging in, you'll be in **Test Mode** (toggle in top right should say "Test mode")
   - Go to: https://dashboard.stripe.com/test/apikeys
   - Find **"Secret key"** (starts with `sk_test_`)
   - Click **"Reveal test key"** and copy it

3. **Add to Backend `.env`**:
   ```bash
   # Open: WebBlocker/FocusBackend/.env
   # Replace this line:
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
   # With your actual key:
   STRIPE_SECRET_KEY=sk_test_51AbC123... (your actual key)
   ```

### Step 2: Create Products in Stripe (3 minutes)

1. **Go to Products**: https://dashboard.stripe.com/test/products

2. **Create Product 1 - Monthly**:
   - Click **"+ Add product"**
   - Name: `Centra Pro Monthly`
   - Description: `Monthly subscription to Centra Pro`
   - **Pricing**: 
     - Price: `4.99`
     - Currency: `USD`
     - Billing: `Recurring` → `Monthly`
   - Click **"Save product"**
   - **Copy the Price ID** (starts with `price_`, looks like `price_1AbC123...`)

3. **Create Product 2 - Annual**:
   - Click **"+ Add product"** again
   - Name: `Centra Pro Annual`
   - Description: `Annual subscription to Centra Pro - Save 40%`
   - **Pricing**:
     - Price: `35.88`
     - Currency: `USD`
     - Billing: `Recurring` → `Yearly`
   - Click **"Save product"**
   - **Copy the Price ID**

4. **Create Product 3 - Lifetime**:
   - Click **"+ Add product"** again
   - Name: `Centra Pro Lifetime`
   - Description: `One-time payment for lifetime access`
   - **Pricing**:
     - Price: `50.00`
     - Currency: `USD`
     - Billing: `One-time`
   - Click **"Save product"**
   - **Copy the Price ID**

5. **Add Price IDs to `.env` files**:

   **Backend** (`WebBlocker/FocusBackend/.env`):
   ```env
   STRIPE_PRICE_MONTHLY=price_1AbC123... (your actual monthly price ID)
   STRIPE_PRICE_ANNUAL=price_1XyZ789... (your actual annual price ID)
   STRIPE_PRICE_LIFETIME=price_1Def456... (your actual lifetime price ID)
   ```

   **Frontend** - Create `WebBlocker/FocusWebApp/.env`:
   ```env
   VITE_API_URL=http://localhost:5001/api
   VITE_FRONTEND_URL=http://localhost:3000
   VITE_STRIPE_PRICE_MONTHLY=price_1AbC123... (same as backend)
   VITE_STRIPE_PRICE_ANNUAL=price_1XyZ789... (same as backend)
   VITE_STRIPE_PRICE_LIFETIME=price_1Def456... (same as backend)
   ```

### Step 3: Set Up Webhooks for Local Testing (2 minutes)

**Option A: Stripe CLI (Recommended)**

1. **Install Stripe CLI**:
   ```bash
   # macOS
   brew install stripe/stripe-cli/stripe
   
   # Or download from: https://stripe.com/docs/stripe-cli
   ```

2. **Login**:
   ```bash
   stripe login
   ```
   - This will open your browser to authorize

3. **Forward webhooks** (run this in a separate terminal and keep it running):
   ```bash
   stripe listen --forward-to localhost:5001/api/subscription/webhook
   ```

4. **Copy the webhook secret**:
   - The command will output something like: `Ready! Your webhook signing secret is whsec_...`
   - Copy the `whsec_...` value
   - Add it to `WebBlocker/FocusBackend/.env`:
     ```env
     STRIPE_WEBHOOK_SECRET=whsec_... (your actual webhook secret)
     ```

**Option B: Stripe Dashboard (For Production)**

If you're testing on a deployed server, set up webhooks in the Stripe Dashboard instead.

### Step 4: Restart Your Servers

```bash
# Terminal 1: Backend
cd WebBlocker/FocusBackend
npm run dev

# Terminal 2: Frontend  
cd WebBlocker/FocusWebApp
npm run dev

# Terminal 3: Stripe CLI (keep running)
stripe listen --forward-to localhost:5001/api/subscription/webhook
```

### Step 5: Verify Setup

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

---

## Testing the Payment Flow

### Test 1: Monthly Subscription

1. **Open your app**: http://localhost:3000
2. **Log in** to your account
3. **Open subscription modal**:
   - Click "Upgrade to Pro" button (appears when you have 5+ blocked sites)
   - OR go to Settings → Account → "Upgrade to Pro"
   - OR click "Unlock Analytics" on the Analytics tab
4. **Select Monthly Plan** ($4.99/month)
5. **Click "Upgrade to Pro"**
6. **You'll be redirected to Stripe Checkout**
7. **Use test card**:
   - Card: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., `12/34`)
   - CVC: Any 3 digits (e.g., `123`)
   - ZIP: Any 5 digits (e.g., `12345`)
8. **Click "Pay $4.99"**
9. **You'll be redirected back** to dashboard with `?subscription=success`
10. **Verify**:
    - Subscription status shows "Premium" or "Pro"
    - You can now block unlimited sites
    - Check Stripe Dashboard → Customers (should see your email)
    - Check Stripe Dashboard → Subscriptions (should see active subscription)

### Test 2: Annual Subscription

Repeat steps 1-10 above, but select "Annual Plan" ($35.88/year) instead.

### Test 3: Lifetime Plan

Repeat steps 1-10 above, but select "Lifetime Plan" ($50.00 one-time) instead.

### Test 4: Payment Decline

1. Start checkout process
2. Use decline card: `4000 0000 0000 0002`
3. Verify error message appears
4. Subscription status should remain "Free"

### Test 5: Billing Portal

1. After successful subscription, go to Settings
2. Click "Manage Billing" or "Manage Subscription"
3. Verify Stripe Billing Portal opens
4. You can cancel subscription from here

---

## Troubleshooting

### "Stripe is not configured" error
- ✅ Check `STRIPE_SECRET_KEY` is set in backend `.env`
- ✅ Restart backend server after changing `.env`

### "Price ID not found" error
- ✅ Verify Price IDs match between frontend and backend `.env` files
- ✅ Check Price IDs exist in Stripe Dashboard
- ✅ Make sure you're using **test** mode Price IDs (not live)

### Payment succeeds but subscription doesn't update
- ✅ Check Stripe CLI is running: `stripe listen --forward-to localhost:5001/api/subscription/webhook`
- ✅ Check webhook secret matches in `.env`
- ✅ Check backend logs for webhook processing errors
- ✅ Check Stripe Dashboard → Webhooks → View logs for events

### Can't see "Upgrade to Pro" button
- ✅ Make sure you're logged in
- ✅ Try blocking 6 sites (free plan limit is 5)
- ✅ Check browser console for errors

### Webhook not receiving events
- ✅ Make sure Stripe CLI is running
- ✅ Verify webhook secret is correct
- ✅ Check backend server is running on port 5001
- ✅ Check Stripe Dashboard → Webhooks for event logs

---

## Test Cards Reference

| Card Number | Purpose | Expected Result |
|------------|---------|-----------------|
| `4242 4242 4242 4242` | Success | Payment succeeds |
| `4000 0000 0000 0002` | Decline | Payment declined |
| `4000 0025 0000 3155` | 3D Secure | Requires authentication |

Use any future expiry date, any CVC, and any ZIP code.

---

## Quick Checklist

- [ ] Stripe account created
- [ ] Test API key copied to backend `.env`
- [ ] 3 products created (Monthly, Annual, Lifetime)
- [ ] Price IDs added to backend `.env`
- [ ] Price IDs added to frontend `.env`
- [ ] Stripe CLI installed and running
- [ ] Webhook secret copied to backend `.env`
- [ ] Backend server restarted
- [ ] Frontend server restarted
- [ ] Verification script passed
- [ ] Tested monthly subscription
- [ ] Tested annual subscription
- [ ] Tested lifetime plan
- [ ] Tested payment decline
- [ ] Verified subscription status updates

---

## Need Help?

- Check backend logs: Look for errors in terminal running `npm run dev`
- Check Stripe Dashboard: https://dashboard.stripe.com/test
- Check webhook logs: Stripe Dashboard → Webhooks → View logs
- Run verification: `node scripts/verify-stripe-setup.js`

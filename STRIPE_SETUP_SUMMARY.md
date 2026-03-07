# Stripe Payment Setup - Summary

## ✅ What's Been Set Up

The Stripe payment system is fully integrated into Centra. Here's what you need to do to activate it:

## 📋 Setup Checklist

### 1. Stripe Account Setup
- [ ] Create Stripe account at [stripe.com](https://stripe.com)
- [ ] Get test API key from [Dashboard → API Keys](https://dashboard.stripe.com/test/apikeys)

### 2. Create Products
- [ ] Create 3 products in Stripe Dashboard:
  - Monthly Plan ($4.99/month)
  - Annual Plan ($35.88/year)
  - Lifetime Plan ($50.00 one-time)
- [ ] Copy Price IDs (start with `price_`)

### 3. Configure Backend
- [ ] Add Stripe keys to `WebBlocker/FocusBackend/.env`:
  ```env
  STRIPE_SECRET_KEY=sk_test_...
  STRIPE_WEBHOOK_SECRET=whsec_...
  STRIPE_PRICE_MONTHLY=price_...
  STRIPE_PRICE_ANNUAL=price_...
  STRIPE_PRICE_LIFETIME=price_...
  ```

### 4. Configure Frontend
- [ ] Create `WebBlocker/FocusWebApp/.env` file:
  ```env
  VITE_STRIPE_PRICE_MONTHLY=price_...
  VITE_STRIPE_PRICE_ANNUAL=price_...
  VITE_STRIPE_PRICE_LIFETIME=price_...
  ```

### 5. Set Up Webhooks
- [ ] For local: Install Stripe CLI and run:
  ```bash
  stripe listen --forward-to localhost:5001/api/subscription/webhook
  ```
- [ ] Copy webhook secret to backend `.env`

### 6. Verify Setup
- [ ] Run verification script:
  ```bash
  cd WebBlocker/FocusBackend
  node scripts/verify-stripe-setup.js
  ```

### 7. Test Payments
- [ ] Start backend and frontend servers
- [ ] Test checkout with card: `4242 4242 4242 4242`
- [ ] Verify subscription status updates

## 📚 Documentation Files

1. **STRIPE_QUICK_START.md** - Quick 10-minute setup guide
2. **PAYMENT_SETUP.md** - Comprehensive setup and testing documentation
3. **.env.example** files - Template environment variables

## 🧪 Testing

### Test Cards
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0025 0000 3155`

### Test Flow
1. Log into Centra dashboard
2. Go to Settings → Upgrade to Pro
3. Select a plan
4. Complete checkout with test card
5. Verify subscription status updates

## 🔧 Files Created/Updated

- ✅ `PAYMENT_SETUP.md` - Updated with Centra branding and comprehensive guide
- ✅ `STRIPE_QUICK_START.md` - Quick start guide
- ✅ `FocusBackend/.env.example` - Backend environment template
- ✅ `FocusWebApp/.env.example` - Frontend environment template
- ✅ `FocusBackend/scripts/verify-stripe-setup.js` - Setup verification script
- ✅ `FocusBackend/.env` - Added Stripe configuration template

## 🚀 Next Steps

1. Follow the **STRIPE_QUICK_START.md** guide
2. Run the verification script to check your setup
3. Test payments with test cards
4. Once working, switch to live mode for production

## 📞 Support

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Test Cards](https://stripe.com/docs/testing)
- Check backend logs for webhook events
- Check Stripe Dashboard → Webhooks for event logs

# Stripe Quick Setup - Step by Step

## ⚡ Quick Setup (10 minutes)

### Step 1: Get Stripe API Key (2 min)

1. Go to https://stripe.com and sign up (free) or log in
2. Make sure you're in **Test Mode** (toggle in top right)
3. Go to: https://dashboard.stripe.com/test/apikeys
4. Click **"Reveal test key"** next to "Secret key"
5. Copy the key (starts with `sk_test_`)

**Add to `WebBlocker/FocusBackend/.env`:**
```env
STRIPE_SECRET_KEY=sk_test_YOUR_ACTUAL_KEY_HERE
```

### Step 2: Create Products (3 min)

1. Go to: https://dashboard.stripe.com/test/products
2. Click **"+ Add product"** three times:

**Product 1: Monthly**
- Name: `Centra Pro Monthly`
- Price: `4.99` USD
- Billing: `Recurring` → `Monthly`
- Click **Save**
- **Copy the Price ID** (starts with `price_`)

**Product 2: Annual**
- Name: `Centra Pro Annual`
- Price: `35.88` USD
- Billing: `Recurring` → `Yearly`
- Click **Save**
- **Copy the Price ID**

**Product 3: Lifetime**
- Name: `Centra Pro Lifetime`
- Price: `50.00` USD
- Billing: `One-time`
- Click **Save**
- **Copy the Price ID**

### Step 3: Add Price IDs to .env Files

**Backend** (`WebBlocker/FocusBackend/.env`):
```env
STRIPE_PRICE_MONTHLY=price_YOUR_MONTHLY_ID
STRIPE_PRICE_ANNUAL=price_YOUR_ANNUAL_ID
STRIPE_PRICE_LIFETIME=price_YOUR_LIFETIME_ID
```

**Frontend** - Create `WebBlocker/FocusWebApp/.env`:
```env
VITE_API_URL=http://localhost:5001/api
VITE_FRONTEND_URL=http://localhost:3000
VITE_STRIPE_PRICE_MONTHLY=price_YOUR_MONTHLY_ID
VITE_STRIPE_PRICE_ANNUAL=price_YOUR_ANNUAL_ID
VITE_STRIPE_PRICE_LIFETIME=price_YOUR_LIFETIME_ID
```

### Step 4: Set Up Webhooks (2 min)

**Install Stripe CLI:**
```bash
brew install stripe/stripe-cli/stripe
```

**Login:**
```bash
stripe login
```

**Forward webhooks** (run in separate terminal, keep it running):
```bash
stripe listen --forward-to localhost:5001/api/subscription/webhook
```

**Copy the webhook secret** (starts with `whsec_`) and add to `WebBlocker/FocusBackend/.env`:
```env
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET
```

### Step 5: Restart Servers

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

### Step 6: Verify Setup

```bash
cd WebBlocker/FocusBackend
node scripts/verify-stripe-setup.js
```

Should show all ✅ checks passed!

---

## 🧪 Testing Payments

### Test Card: `4242 4242 4242 4242`
- Expiry: Any future date (e.g., `12/34`)
- CVC: Any 3 digits (e.g., `123`)
- ZIP: Any 5 digits (e.g., `12345`)

### Test Flow:
1. Open http://localhost:3000
2. Log in
3. Click "Upgrade to Pro" (or go to Settings)
4. Select a plan (Monthly/Annual/Lifetime)
5. Click "Upgrade to Pro"
6. Use test card above
7. Complete payment
8. Verify subscription status updates to "Pro"

---

## 🐛 Troubleshooting

**"Stripe is not configured" error:**
- Check `.env` files have real values (not placeholders)
- Restart backend after changing `.env`

**"Price ID not found":**
- Verify Price IDs match between frontend and backend `.env`
- Check you're using test mode Price IDs

**Payment succeeds but subscription doesn't update:**
- Make sure Stripe CLI is running
- Check webhook secret is correct
- Check backend logs for errors

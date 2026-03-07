#!/bin/bash

# Quick Stripe Setup Helper Script
# This script helps you set up Stripe for Centra

echo "🚀 Centra Stripe Setup Helper"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if .env files exist
BACKEND_ENV="FocusBackend/.env"
FRONTEND_ENV="FocusWebApp/.env"

echo "📋 Checking configuration files..."
echo ""

# Check backend .env
if [ -f "$BACKEND_ENV" ]; then
    echo -e "${GREEN}✓${NC} Backend .env file exists"
    
    # Check if Stripe keys are configured
    if grep -q "sk_test_your_stripe_secret_key_here\|sk_test_$" "$BACKEND_ENV" 2>/dev/null; then
        if grep -q "sk_test_" "$BACKEND_ENV" && ! grep -q "sk_test_your_stripe_secret_key_here" "$BACKEND_ENV"; then
            echo -e "  ${GREEN}✓${NC} STRIPE_SECRET_KEY is configured"
        else
            echo -e "  ${YELLOW}⚠${NC} STRIPE_SECRET_KEY needs to be configured"
        fi
    fi
    
    if grep -q "whsec_your_webhook_secret_here\|whsec_$" "$BACKEND_ENV" 2>/dev/null; then
        if grep -q "whsec_" "$BACKEND_ENV" && ! grep -q "whsec_your_webhook_secret_here" "$BACKEND_ENV"; then
            echo -e "  ${GREEN}✓${NC} STRIPE_WEBHOOK_SECRET is configured"
        else
            echo -e "  ${YELLOW}⚠${NC} STRIPE_WEBHOOK_SECRET needs to be configured"
        fi
    fi
    
    if grep -q "price_your_monthly_price_id_here\|price_" "$BACKEND_ENV" 2>/dev/null; then
        if grep -q "price_" "$BACKEND_ENV" && ! grep -q "price_your_monthly_price_id_here" "$BACKEND_ENV"; then
            echo -e "  ${GREEN}✓${NC} Stripe Price IDs are configured"
        else
            echo -e "  ${YELLOW}⚠${NC} Stripe Price IDs need to be configured"
        fi
    fi
else
    echo -e "${RED}✗${NC} Backend .env file not found"
fi

echo ""

# Check frontend .env
if [ -f "$FRONTEND_ENV" ]; then
    echo -e "${GREEN}✓${NC} Frontend .env file exists"
    
    if grep -q "price_your_monthly_price_id_here\|price_" "$FRONTEND_ENV" 2>/dev/null; then
        if grep -q "price_" "$FRONTEND_ENV" && ! grep -q "price_your_monthly_price_id_here" "$FRONTEND_ENV"; then
            echo -e "  ${GREEN}✓${NC} Stripe Price IDs are configured"
        else
            echo -e "  ${YELLOW}⚠${NC} Stripe Price IDs need to be configured"
        fi
    fi
else
    echo -e "${RED}✗${NC} Frontend .env file not found"
fi

echo ""
echo "📚 Next Steps:"
echo ""
echo "1. Get Stripe API Key:"
echo "   → Go to: https://dashboard.stripe.com/test/apikeys"
echo "   → Copy your Secret key (starts with sk_test_)"
echo "   → Add to: $BACKEND_ENV"
echo ""
echo "2. Create Products in Stripe:"
echo "   → Go to: https://dashboard.stripe.com/test/products"
echo "   → Create 3 products: Monthly (\$4.99), Annual (\$35.88), Lifetime (\$50.00)"
echo "   → Copy Price IDs (start with price_)"
echo "   → Add to both: $BACKEND_ENV and $FRONTEND_ENV"
echo ""
echo "3. Set up Webhooks:"
echo "   → Install Stripe CLI: brew install stripe/stripe-cli/stripe"
echo "   → Run: stripe listen --forward-to localhost:5001/api/subscription/webhook"
echo "   → Copy webhook secret (starts with whsec_)"
echo "   → Add to: $BACKEND_ENV"
echo ""
echo "4. Verify Setup:"
echo "   → cd FocusBackend"
echo "   → node scripts/verify-stripe-setup.js"
echo ""
echo "5. Test Payment:"
echo "   → Start backend: cd FocusBackend && npm run dev"
echo "   → Start frontend: cd FocusWebApp && npm run dev"
echo "   → Open: http://localhost:3000"
echo "   → Log in and click 'Upgrade to Pro'"
echo "   → Use test card: 4242 4242 4242 4242"
echo ""
echo "📖 Full guide: See STRIPE_SETUP_TEST.md for detailed instructions"
echo ""

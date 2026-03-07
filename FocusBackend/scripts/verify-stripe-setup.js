#!/usr/bin/env node

/**
 * Stripe Setup Verification Script
 * 
 * This script verifies that Stripe is properly configured by:
 * 1. Checking environment variables are set
 * 2. Testing Stripe API connection
 * 3. Verifying products/prices exist
 * 4. Testing webhook endpoint configuration
 * 
 * Usage: node scripts/verify-stripe-setup.js
 */

require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkmark() {
  return `${colors.green}✓${colors.reset}`;
}

function cross() {
  return `${colors.red}✗${colors.reset}`;
}

function warning() {
  return `${colors.yellow}⚠${colors.reset}`;
}

async function verifyStripeSetup() {
  log('\n🔍 Verifying Stripe Setup for Centra\n', 'blue');
  
  let allChecksPassed = true;
  const errors = [];
  const warnings = [];

  // Check 1: Environment Variables
  log('\n1. Checking Environment Variables...', 'blue');
  
  const requiredEnvVars = {
    'STRIPE_SECRET_KEY': process.env.STRIPE_SECRET_KEY,
    'STRIPE_WEBHOOK_SECRET': process.env.STRIPE_WEBHOOK_SECRET,
    'STRIPE_PRICE_MONTHLY': process.env.STRIPE_PRICE_MONTHLY,
    'STRIPE_PRICE_ANNUAL': process.env.STRIPE_PRICE_ANNUAL,
    'STRIPE_PRICE_LIFETIME': process.env.STRIPE_PRICE_LIFETIME,
  };

  for (const [key, value] of Object.entries(requiredEnvVars)) {
    if (!value || value.includes('your_') || value.includes('_here')) {
      log(`   ${cross()} ${key} is not set or contains placeholder`, 'red');
      errors.push(`${key} is missing or contains placeholder value`);
      allChecksPassed = false;
    } else {
      log(`   ${checkmark()} ${key} is set`, 'green');
    }
  }

  // Check 2: Stripe API Connection
  log('\n2. Testing Stripe API Connection...', 'blue');
  
  if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('your_')) {
    log(`   ${cross()} Cannot test API connection - STRIPE_SECRET_KEY not configured`, 'red');
    allChecksPassed = false;
  } else {
    try {
      // Test API connection by retrieving account info
      const account = await stripe.account.retrieve();
      log(`   ${checkmark()} Successfully connected to Stripe API`, 'green');
      log(`   ${warning()} Mode: ${account.livemode ? 'LIVE' : 'TEST'}`, account.livemode ? 'red' : 'yellow');
      
      if (account.livemode) {
        warnings.push('You are using LIVE mode. Make sure this is intentional!');
      }
    } catch (error) {
      log(`   ${cross()} Failed to connect to Stripe API: ${error.message}`, 'red');
      errors.push(`Stripe API connection failed: ${error.message}`);
      allChecksPassed = false;
    }
  }

  // Check 3: Verify Products/Prices Exist
  log('\n3. Verifying Products and Prices...', 'blue');
  
  const priceIds = {
    'Monthly': process.env.STRIPE_PRICE_MONTHLY,
    'Annual': process.env.STRIPE_PRICE_ANNUAL,
    'Lifetime': process.env.STRIPE_PRICE_LIFETIME,
  };

  for (const [planName, priceId] of Object.entries(priceIds)) {
    if (!priceId || priceId.includes('your_') || priceId.includes('_here')) {
      log(`   ${cross()} ${planName} price ID is not configured`, 'red');
      errors.push(`${planName} price ID is missing`);
      allChecksPassed = false;
    } else {
      try {
        const price = await stripe.prices.retrieve(priceId);
        const product = await stripe.products.retrieve(price.product);
        
        log(`   ${checkmark()} ${planName} plan found:`, 'green');
        log(`      Product: ${product.name}`, 'reset');
        log(`      Price: $${(price.unit_amount / 100).toFixed(2)} ${price.currency.toUpperCase()}`, 'reset');
        log(`      Type: ${price.type} (${price.recurring ? `${price.recurring.interval}` : 'one-time'})`, 'reset');
        
        // Verify price matches expected values
        if (planName === 'Monthly' && price.unit_amount !== 499) {
          warnings.push(`Monthly price is $${price.unit_amount / 100}, expected $4.99`);
        }
        if (planName === 'Annual' && price.unit_amount !== 3588) {
          warnings.push(`Annual price is $${price.unit_amount / 100}, expected $35.88`);
        }
        if (planName === 'Lifetime' && price.unit_amount !== 5000) {
          warnings.push(`Lifetime price is $${price.unit_amount / 100}, expected $50.00`);
        }
      } catch (error) {
        if (error.code === 'resource_missing') {
          log(`   ${cross()} ${planName} price ID "${priceId}" not found in Stripe`, 'red');
          errors.push(`${planName} price ID "${priceId}" does not exist in Stripe`);
          allChecksPassed = false;
        } else {
          log(`   ${cross()} Error retrieving ${planName} price: ${error.message}`, 'red');
          errors.push(`Failed to retrieve ${planName} price: ${error.message}`);
          allChecksPassed = false;
        }
      }
    }
  }

  // Check 4: Webhook Configuration
  log('\n4. Checking Webhook Configuration...', 'blue');
  
  if (!process.env.STRIPE_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET.includes('your_')) {
    log(`   ${cross()} STRIPE_WEBHOOK_SECRET is not configured`, 'red');
    log(`   ${warning()} For local testing, run: stripe listen --forward-to localhost:5001/api/subscription/webhook`, 'yellow');
    errors.push('Webhook secret is not configured');
    allChecksPassed = false;
  } else {
    if (process.env.STRIPE_WEBHOOK_SECRET.startsWith('whsec_')) {
      log(`   ${checkmark()} Webhook secret format is correct`, 'green');
    } else {
      log(`   ${warning()} Webhook secret should start with 'whsec_'`, 'yellow');
      warnings.push('Webhook secret format may be incorrect');
    }
  }

  // Summary
  log('\n' + '='.repeat(60), 'blue');
  log('\n📊 Verification Summary\n', 'blue');
  
  if (allChecksPassed && errors.length === 0) {
    log('✅ All checks passed! Stripe is properly configured.', 'green');
  } else {
    log('❌ Some checks failed. Please fix the errors below:\n', 'red');
    
    if (errors.length > 0) {
      log('Errors:', 'red');
      errors.forEach((error, index) => {
        log(`   ${index + 1}. ${error}`, 'red');
      });
    }
  }
  
  if (warnings.length > 0) {
    log('\n⚠️  Warnings:', 'yellow');
    warnings.forEach((warning, index) => {
      log(`   ${index + 1}. ${warning}`, 'yellow');
    });
  }

  log('\n' + '='.repeat(60) + '\n', 'blue');

  // Next Steps
  if (!allChecksPassed) {
    log('📝 Next Steps:', 'blue');
    log('1. Get your Stripe API keys from: https://dashboard.stripe.com/test/apikeys', 'reset');
    log('2. Create products and prices: https://dashboard.stripe.com/test/products', 'reset');
    log('3. Set up webhooks: https://dashboard.stripe.com/test/webhooks', 'reset');
    log('4. For local testing, use Stripe CLI: stripe listen --forward-to localhost:5001/api/subscription/webhook', 'reset');
    log('5. Copy all values to your .env file\n', 'reset');
  }

  process.exit(allChecksPassed ? 0 : 1);
}

// Run verification
verifyStripeSetup().catch((error) => {
  log(`\n${cross()} Fatal error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});

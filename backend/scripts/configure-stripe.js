const { IntegrationSettings } = require('../models');

async function configureStripe() {
  try {
    console.log('Configuring Stripe settings...');
    
    // Check if settings exist
    let settings = await IntegrationSettings.findOne();
    
    if (!settings) {
      console.log('Creating new integration settings...');
      settings = await IntegrationSettings.create({
        stripe_enabled: true,
        payment_gateway: 'stripe',
        payment_api_key: process.env.STRIPE_SECRET_KEY || 'sk_test_your_secret_key_here',
        stripe_publishable_key: process.env.STRIPE_PUBLISHABLE_KEY || 'pk_test_your_publishable_key_here',
        stripe_webhook_secret: process.env.STRIPE_WEBHOOK_SECRET || 'whsec_your_webhook_secret_here'
      });
    } else {
      console.log('Updating existing integration settings...');
      await settings.update({
        stripe_enabled: true,
        payment_gateway: 'stripe',
        payment_api_key: process.env.STRIPE_SECRET_KEY || settings.payment_api_key,
        stripe_publishable_key: process.env.STRIPE_PUBLISHABLE_KEY || settings.stripe_publishable_key,
        stripe_webhook_secret: process.env.STRIPE_WEBHOOK_SECRET || settings.stripe_webhook_secret
      });
    }
    
    console.log('✅ Stripe configuration completed!');
    console.log('📝 Make sure to set these environment variables:');
    console.log('   - STRIPE_SECRET_KEY=sk_test_...');
    console.log('   - STRIPE_PUBLISHABLE_KEY=pk_test_...');
    console.log('   - STRIPE_WEBHOOK_SECRET=whsec_...');
    console.log('');
    console.log('🔗 Get your keys from: https://dashboard.stripe.com/apikeys');
    
  } catch (error) {
    console.error('❌ Error configuring Stripe:', error);
  }
}

// Run if called directly
if (require.main === module) {
  configureStripe().then(() => {
    process.exit(0);
  }).catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
}

module.exports = configureStripe;

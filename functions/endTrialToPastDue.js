// endTrialToPastDue.js
const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET, {
  apiVersion: '2022-11-15',
});

// ⚠️ Update with your subscription ID
const SUBSCRIPTION_ID = 'sub_1S0v6P3KFM9xH4Q6QV6WJYMh';

(async () => {
  try {
    // End trial immediately
    const subscription = await stripe.subscriptions.update(SUBSCRIPTION_ID, {
      trial_end: 'now', // ends trial immediately
      payment_behavior: 'default_incomplete', // marks invoice as incomplete if no payment method
    });

    console.log('✅ Subscription updated:');
    console.log('Status:', subscription.status);
    console.log('Trial ends:', subscription.trial_end);
  } catch (err) {
    console.error('❌ Error updating subscription:', err);
  }
})();

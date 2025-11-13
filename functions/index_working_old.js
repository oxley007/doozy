const express = require('express');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const Stripe = require('stripe');
const nodemailer = require('nodemailer');

// ----------------- Init Firebase Admin -----------------
if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

// ----------------- Subscription Price Map -----------------
const subscriptionPriceMap = {
  'Twice a week Premium': 'price_1RxZOk3KFM9xH4Q63wrGdsXl',
  'Once a week Premium Friday': 'price_1S0nR73KFM9xH4Q68I2lTP8K',
  'Once a week Premium': 'price_1RxZqw3KFM9xH4Q6gwKWhW66',
  'Twice a week Artificial Grass': 'price_1SFLJ63KFM9xH4Q6enZQC1CF',
  'Once a week Artificial Grass': 'price_1S5zLu3KFM9xH4Q6a1TwDMW6',
  'Twice a week': 'price_1S0ngx3KFM9xH4Q6HmDZZtyA',
  'Once a week Friday': 'price_1S0nu53KFM9xH4Q6xSI9t7DT',
  'Once a week': 'price_1S0obu3KFM9xH4Q6Jt0R0eVm',
};

const app = express();

// ----------------- Gmail Setup & Validation -----------------
if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASS) {
  console.error("❌ GMAIL_USER or GMAIL_APP_PASS not set");
  process.exit(1); // Exit container immediately
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASS,
  },
});

transporter.verify((err, success) => {
  if (err) {
    console.error('❌ Gmail SMTP error:', err);
  } else {
    console.log('✅ Gmail SMTP ready');
  }
});

async function sendEmail(to, subject, text) {
  console.log("📨 sendEmail() called with:", { to, subject });
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to,
    subject,
    text,
  };
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent:", info.response);
  } catch (error) {
    console.error("❌ Email error:", error);
  }
}

// ----------------- Retry Helper -----------------
async function retry(fn, retries = 3, delay = 500) {
  let lastError;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw lastError;
}

// ----------------- Root Endpoint -----------------
app.get('/', (req, res) => res.send('Server is up ✅'));

// ----------------- Checkout Session -----------------
app.post('/create-checkout-session', bodyParser.json(), async (req, res) => {
  const { subscriptionName } = req.body;
  if (!subscriptionName) return res.status(400).json({ error: 'Missing subscriptionName' });

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ error: 'Missing Authorization header' });

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();
    if (!userDoc.exists) return res.status(404).json({ error: 'User not found' });

    const userData = userDoc.data();
    if (!userData.stripeCustomerId) return res.status(400).json({ error: 'Stripe customer missing' });

    const priceId = subscriptionPriceMap[subscriptionName];
    if (!priceId) return res.status(400).json({ error: 'Unknown subscription name' });

    const stripe = new Stripe(process.env.STRIPE_SECRET, { apiVersion: '2022-11-15' });

    const session = await stripe.checkout.sessions.create({
      customer: userData.stripeCustomerId,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: 'doozy://payment-success',
      cancel_url: 'doozy://payment-cancel',
    });

    console.log('✅ Checkout session created:', session.id);

    await sendEmail(
      'andrew@4dot6digital.com',
      'Your Doozy Subscription Checkout',
      `Hi ${userData.name || ''}, your subscription checkout session has been created successfully!`
    );

    res.json({ url: session.url });
  } catch (err) {
    console.error('❌ Stripe checkout error:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// ----------------- Delayed Subscription -----------------
app.post('/create-delayed-subscription', bodyParser.json(), async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ error: 'Missing Authorization header' });

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();
    if (!userDoc.exists) return res.status(404).json({ error: 'User not found in Firestore' });

    const userData = userDoc.data();
    const stripe = new Stripe(process.env.STRIPE_SECRET, { apiVersion: '2022-11-15' });

    let stripeCustomerId = userData.stripeCustomerId;
    if (!stripeCustomerId) {
      const customer = await retry(() => stripe.customers.create({
        email: userData.email,
        name: userData.name,
        metadata: { firebaseUID: uid },
      }));
      stripeCustomerId = customer.id;
      await userRef.update({ stripeCustomerId });
    }

    const { subscriptionName, firstPaymentTimestamp } = req.body;
    const priceId = subscriptionPriceMap[subscriptionName];
    if (!priceId) return res.status(400).json({ error: 'Unknown subscription name' });

    let trialEndTimestamp = firstPaymentTimestamp;
    if (trialEndTimestamp > 1e12) trialEndTimestamp = Math.floor(trialEndTimestamp / 1000);

    const subscription = await retry(() => stripe.subscriptions.create({
      customer: stripeCustomerId,
      items: [{ price: priceId }],
      trial_end: trialEndTimestamp,
      default_payment_method: userData.defaultPaymentMethod,
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
    }));

    // 📨 Send confirmation email
    console.log('📨 Sending delayed subscription email...');
    await sendEmail(
      '4dot6app@gmail.com',
      'New Doozy Subscription',
      `Hi, A new Doozy subscription from ${userData.name || ''} (${userData.email || ''}) has been created successfully!`
    );
    console.log('✅ Email sent (delayed subscription)');

    res.json({ subscriptionId: subscription.id, status: subscription.status });
  } catch (err) {
    console.error('❌ Error creating subscription:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// ----------------- Stripe Webhook -----------------
app.post('/webhook', bodyParser.raw({ type: 'application/json' }), async (req, res) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET, { apiVersion: '2022-11-15' });
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('⚠️ Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    const customerEvents = ['customer.subscription.updated', 'invoice.payment_succeeded'];
    if (customerEvents.includes(event.type)) {
      const customerId = event.data.object.customer || event.data.object.id;
      const usersRef = db.collection('users').where('stripeCustomerId', '==', customerId);
      const snapshot = await usersRef.get();

      console.log(`🔄 Stripe event type: ${event.type} for customer: ${customerId}`);
      if (!snapshot.empty) {
        const updateData = {};

        if (event.type === 'customer.subscription.updated') {
          const subscription = event.data.object;
          if (subscription.trial_end) updateData.trialEndTimestamp = subscription.trial_end * 1000;
          if (subscription.status) updateData['subscription.status'] = subscription.status;
          if (subscription.current_period_end)
            updateData.nextInvoiceDate = subscription.current_period_end * 1000;
        } else if (event.type === 'invoice.payment_succeeded') {
          const invoice = event.data.object;
          if (invoice.status_transitions.paid_at)
            updateData['subscription.lastPaymentDate'] = invoice.status_transitions.paid_at * 1000;
          updateData.nextInvoiceDate = invoice.next_payment_attempt
            ? invoice.next_payment_attempt * 1000
            : null;
        }

        await snapshot.docs[0].ref.update(updateData);
        console.log(`✅ Updated Firestore user ${customerId} with data`, updateData);
      }
    }

    res.json({ received: true });
  } catch (err) {
    console.error('❌ Error handling webhook:', err);
    res.status(500).send('Webhook handler failed');
  }
});

// ----------------- Start Server -----------------
const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🔥 Server listening on port ${PORT}`);
});

module.exports = app;

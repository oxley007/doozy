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
  'Twice a week Premium': 'price_1SIzWxKgDQVly6KUljD3SIq8',
  'Once a week Premium Friday': 'price_1SIzWzKgDQVly6KUOJj3HIsO',
  'Once a week Premium': 'price_1SIzX2KgDQVly6KUKH5mb1xA',
  'Twice a week Artificial Grass': 'price_1SIzWnKgDQVly6KUfAfpWHCY',
  'Once a week Artificial Grass': 'price_1SIzWjKgDQVly6KUxvotp3bE',
  'Twice a week': 'price_1SIzWSKgDQVly6KUp6SEVOOQ',
  'Once a week Friday': 'price_1SIzWbKgDQVly6KU6WAzbo3q',
  'Once a week': 'price_1SIzWfKgDQVly6KUUgEO4mas',
  'Once a Week Walk': 'price_1SPWQ1KgDQVly6KUHLSb7yiN',
  'Twice a Week Walk': 'price_1SPWRwKgDQVly6KUlnM6dWG4',
  'Once a Week Walk 2 dogs': 'price_1SPWVsKgDQVly6KUQLgJk7f5',
  'Once a Week Walk 3 dogs': 'price_1SPWXMKgDQVly6KUgVsHF8xs',
  'Twice a Week Walk 2 dogs': 'price_1SPWb3KgDQVly6KU69nMiRbl',
  'Twice a Week Walk 3 dogs': 'price_1SPWdGKgDQVly6KUSEYKdr0K',
};

const ccFeePriceMap = {
  'Once a week Premium': 'price_1SIzX4KgDQVly6KUa0dQYkwb',
  'Once a week Premium Friday': 'price_1SIzX7KgDQVly6KUWEpCcmd7',
  'Twice a week Premium': 'price_1SIzXAKgDQVly6KUZwHfe7y0',
  'Twice a week Artificial Grass': 'price_1SIzXCKgDQVly6KUISpq5gDn',
  'Once a week Artificial Grass': 'price_1SIzXFKgDQVly6KUOoXCPJI6',
  'Once a week': 'price_1SIzXHKgDQVly6KUaxurjexR',
  'Once a week Friday': 'price_1SIzXJKgDQVly6KU9zJOMxRP',
  'Twice a week': 'price_1SIzXLKgDQVly6KUvICvGtjt',
  'Once a Week Walk': 'price_1SIzX4KgDQVly6KUa0dQYkwb',
  'Twice a Week Walk': 'price_1SPWj1KgDQVly6KU0DnNNtCJ',
  'Once a Week Walk 2 dogs': 'price_1SPWjsKgDQVly6KUaZfUPgLe',
  'Once a Week Walk 3 dogs': 'price_1SPWkhKgDQVly6KUNtjXhtbL',
  'Twice a Week Walk 2 dogs': 'price_1SPWlVKgDQVly6KUBDm3Mxsk',
  'Twice a Week Walk 3 dogs': 'price_1SPWm7KgDQVly6KUdisRoP1e',
};

const stripe = new Stripe(process.env.STRIPE_SECRET, { apiVersion: '2022-11-15' });

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

    //const stripe = new Stripe(process.env.STRIPE_SECRET, { apiVersion: '2022-11-15' });

    // Build line items array (plan + CC fee)
    const feePriceId = ccFeePriceMap[subscriptionName];
    const line_items = [{ price: priceId, quantity: 1 }];

    if (feePriceId) {
      line_items.push({ price: feePriceId, quantity: 1 });
    } else {
      console.warn(`⚠️ No CC fee found for subscription name: "${subscriptionName}"`);
    }

    const session = await stripe.checkout.sessions.create({
      customer: userData.stripeCustomerId,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items,
      success_url: 'https://www.4dot6digital.com/payment-success',
      cancel_url: 'https://www.4dot6digital.com/payment-cancel',
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
    const { subscriptionName, firstPaymentTimestamp, name: requestName, email: requestEmail } = req.body;

    //const stripe = new Stripe(process.env.STRIPE_SECRET, { apiVersion: '2022-11-15' });

    // Use request body values if available, fallback to Firestore
    const customerName = requestName || userData.name || "";
    const customerEmail = requestEmail || userData.email || "";

    // Create Stripe customer if missing
    let stripeCustomerId = userData.stripeCustomerId;
    if (!stripeCustomerId) {
      const customer = await retry(() =>
        stripe.customers.create({
          email: customerEmail,
          name: customerName,
          metadata: { firebaseUID: uid },
        })
      );
      stripeCustomerId = customer.id;
      await userRef.update({ stripeCustomerId });
    }

    const priceId = subscriptionPriceMap[subscriptionName];
    if (!priceId) return res.status(400).json({ error: 'Unknown subscription name' });

    // Handle trial timestamp
    let trialEndTimestamp = firstPaymentTimestamp;
    if (trialEndTimestamp > 1e12) trialEndTimestamp = Math.floor(trialEndTimestamp / 1000);

    // Retrieve base price
    const basePrice = await stripe.prices.retrieve(priceId);
    if (!basePrice.unit_amount) return res.status(400).json({ error: 'Invalid base price configuration in Stripe' });

    // Calculate processing fee
    const stripeFeePercent = 0.029;
    const stripeFixedFee = 30;
    const feeAmount = Math.round(basePrice.unit_amount * stripeFeePercent + stripeFixedFee);

    const isTrial = !!trialEndTimestamp && trialEndTimestamp > Math.floor(Date.now() / 1000);

    // Build subscription items
    const subscriptionItems = [{ price: priceId }];

    const feePriceId = ccFeePriceMap[subscriptionName];
    if (feePriceId) {
      subscriptionItems.push({ price: feePriceId });
    } else {
      console.warn(`⚠️ No fee price found for ${subscriptionName}`);
    }

    // Create subscription
    const subscription = await retry(() =>
      stripe.subscriptions.create({
        customer: stripeCustomerId,
        items: subscriptionItems,
        trial_end: trialEndTimestamp,
        payment_behavior: 'default_incomplete',
        collection_method: 'charge_automatically',
        ...(userData.defaultPaymentMethod && {
          default_payment_method: userData.defaultPaymentMethod,
        }),
        expand: ['latest_invoice.payment_intent'],
      })
    );

    await sendEmail(
      'andrew@4dot6digital.com',
      'New Doozy Subscription',
      `Hi, A new Doozy subscription from ${customerName} (${customerEmail}) has been created successfully!`
    );

    res.json({ subscriptionId: subscription.id, status: subscription.status });
  } catch (err) {
    console.error('❌ Error creating subscription:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// ----------------- Stripe Webhook -----------------
app.post('/webhook', bodyParser.raw({ type: 'application/json' }), async (req, res) => {
  //const stripe = new Stripe(process.env.STRIPE_SECRET, { apiVersion: '2022-11-15' });
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
            updateData.nextInvoiceDate = subscription.current_period_end * 1000; // same as before
          if (subscription.cancel_at) updateData.cancelAtTimestamp = subscription.cancel_at * 1000;
        } else if (event.type === 'invoice.payment_succeeded') {
          const invoice = event.data.object;

          if (invoice.status_transitions.paid_at)
            updateData['subscription.lastPaymentDate'] = invoice.status_transitions.paid_at * 1000;

          // NEW: Try next_payment_attempt first, fallback to subscription.current_period_end
          updateData.nextInvoiceDate =
            invoice.next_payment_attempt
              ? invoice.next_payment_attempt * 1000
              : invoice.subscription?.current_period_end
              ? invoice.subscription.current_period_end * 1000
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

// ----------------- Account Deletion Notification -----------------
app.post('/notify-account-deletion', bodyParser.json(), async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing Authorization header' });
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();
    const userData = userDoc.exists ? userDoc.data() : {};

    const userEmail = userData.email || decodedToken.email || "Unknown";
    const userName = userData.name || "Unknown";

    // send email to you
    await sendEmail(
      'andrew@4dot6digital.com',
      '🚨 Doozy User Account Deleted',
      `A user has deleted their account.\n\nName: ${userName}\nEmail: ${userEmail}\nUID: ${uid}. Please remove subscription from Stripe.`
    );

    console.log(`📨 Sent account deletion email for UID: ${uid}`);

    res.json({ success: true });
  } catch (err) {
    console.error('❌ notify-account-deletion error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.use(express.json());

app.post('/create-callback-payment-session', async (req, res) => {
  console.log('✅ hitting create-callback-payment-session');
  console.log('req.body:', req.body);
  try {
    const { amount, bookingIds } = req.body;
    console.log('amount:', amount);
    console.log('bookingIds:', bookingIds);

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    if (!Array.isArray(bookingIds) || !bookingIds.length) {
      return res.status(400).json({ error: 'Invalid booking IDs' });
    }

    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = userDoc.data();

    let stripeCustomerId = userData?.stripeCustomerId;
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: userData.email,
        name: userData.name,
        metadata: { firebaseUID: uid },
      });
      stripeCustomerId = customer.id;
      await userRef.update({ stripeCustomerId });
    }

    // Stripe expects amount in cents
    const amountInCents = Math.round(amount * 100);

    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'nzd',
            product_data: { name: 'Doozy Callback Payment' },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      metadata: { bookingIds: bookingIds.join(',') },
      success_url: 'https://www.4dot6digital.com/payment-success',
      cancel_url: 'https://www.4dot6digital.com/payment-cancel',
    });

    console.log('✅ Stripe session created:', session);

    if (!session.url) {
      return res.status(500).json({ error: 'Stripe session created but no checkout URL returned' });
    }

    return res.json({ url: session.url });

  } catch (err) {
    console.error('❌ Error creating callback payment session:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

app.post('/stripe-webhook', bodyParser.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('❌ Stripe webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Log the event type for visibility
  console.log(`📬 Stripe webhook received: ${event.type}`);

  try {
    const session = event.data.object;
    const bookingIds = session.metadata?.bookingIds?.split(',') || [];

    console.log('📝 Booking IDs from metadata:', bookingIds);
    console.log('💳 Session ID:', session.id);

    if (event.type === 'checkout.session.completed') {
      console.log('✅ Payment succeeded, confirming bookings...');
      for (const id of bookingIds) {
        try {
          await db.collection('bookings').doc(id).update({ confirmed: true });
          console.log(`✅ Booking ${id} confirmed`);
        } catch (err) {
          console.error(`❌ Failed to confirm booking ${id}:`, err);
        }
      }
    }

    if (['checkout.session.expired', 'checkout.session.async_payment_failed'].includes(event.type)) {
      console.log('❌ Payment failed or session expired, marking bookings unconfirmed...');
      for (const id of bookingIds) {
        try {
          await db.collection('bookings').doc(id).update({ confirmed: false });
          console.log(`❌ Booking ${id} marked unconfirmed`);
        } catch (err) {
          console.error(`❌ Failed to mark booking ${id} unconfirmed:`, err);
        }
      }
    }

    res.json({ received: true });
  } catch (err) {
    console.error('❌ Webhook handler error:', err);
    res.status(500).send('Webhook error');
  }
});

// ----------------- Start Server -----------------
const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🔥 Server listening on port ${PORT}`);
});

module.exports = app;

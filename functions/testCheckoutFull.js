// testCheckoutFull.js
const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));

// ----- CONFIG -----
const CLOUD_RUN_BASE =
  'https://createdelayedsubscription-725766869893.australia-southeast1.run.app';
const FIREBASE_ID_TOKEN =
  'eyJhbGciOiJSUzI1NiIsImtpZCI6ImVmMjQ4ZjQyZjc0YWUwZjk0OTIwYWY5YTlhMDEzMTdlZjJkMzVmZTEiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vZG9venktYXBwLTQwZDVjIiwiYXVkIjoiZG9venktYXBwLTQwZDVjIiwiYXV0aF90aW1lIjoxNzU2Njk3NTQwLCJ1c2VyX2lkIjoiVXFJWmcxUEhWQmRtQUFNZ2dkRnVXR3dsaEo1MiIsInN1YiI6IlVxSVpnMVBIVkJkbUFBTWdnZEZ1V0d3bGhKNTIiLCJpYXQiOjE3NTY3NDk0MDYsImV4cCI6MTc1Njc1MzAwNiwiZW1haWwiOiJveGxleTAwNys1NEBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnsiZW1haWwiOlsib3hsZXkwMDcrNTRAZ21haWwuY29tIl19LCJzaWduX2luX3Byb3ZpZGVyIjoicGFzc3dvcmQifX0.BGewWHa8CFOtb_JTUmEEREYXJ1qYR4ujA_Xr9rf4ve03VhmH4rjqaWbY29rh_PWYoKqqW9mFF8GjHf5dKSTwYZj_tnT7wmmlpOxRxYa8DFWrf16oUuF95R_szEMyPPfApqCcP1ZvYVQanqezpkvD_bx7fzyoVyFMV9tWAU4Fg4E5izMPxUmrxqTr0HIRmsguCjcUHSNKv3thmWdaelVm9VwqHf4oAUbvG0HmRNZ4hdDBgjCGYTfHY4Zbp05pGdIxSHqhDIiO5ufNFBBULYuPHw3MwVjLU93HibpYkSDsM5K56Y9WfuoUZ1HhCfr5Y-oHPimeyFa6hwmcfcZ8s7SYCg'; // Get from currentUser.getIdToken(true)
const SUBSCRIPTION_NAME = 'Twice a week Premium'; // Only needed if creating delayed subscription

// ----- HELPERS -----
async function post(path, body = {}) {
  const res = await fetch(`${CLOUD_RUN_BASE}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${FIREBASE_ID_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }
  return { status: res.status, data };
}

// ----- MAIN -----
(async () => {
  try {
    console.log('🚀 Checking/creating Stripe customer...');

    // Step 1: Try to create delayed subscription (will create customer if missing)
    const delayedSubResp = await post('/create-delayed-subscription', {
      subscriptionName: SUBSCRIPTION_NAME,
      firstPaymentTimestamp: Date.now() + 60_000, // 1 min in future
    });

    if (delayedSubResp.status >= 400) {
      console.error(
        '❌ Failed to create/check Stripe customer:',
        delayedSubResp.data,
      );
      return;
    }

    console.log('✅ Stripe customer ensured. Response:', delayedSubResp.data);

    // Step 2: Create checkout session
    console.log('🚀 Creating checkout session...');
    const checkoutResp = await post('/create-checkout-session');

    if (checkoutResp.status >= 400) {
      console.error('❌ Failed to create checkout session:', checkoutResp.data);
      return;
    }

    console.log('✅ Checkout session URL:', checkoutResp.data.url);
  } catch (err) {
    console.error('❌ Test script error:', err);
  }
})();

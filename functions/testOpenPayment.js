// testOpenPayment.js
//const fetch = require('node-fetch'); // npm install node-fetch
const open = require('open'); // npm install open

// 🔑 Replace with your Firebase ID token for the test user
const FIREBASE_ID_TOKEN =
  'eyJhbGciOiJSUzI1NiIsImtpZCI6ImVmMjQ4ZjQyZjc0YWUwZjk0OTIwYWY5YTlhMDEzMTdlZjJkMzVmZTEiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vZG9venktYXBwLTQwZDVjIiwiYXVkIjoiZG9venktYXBwLTQwZDVjIiwiYXV0aF90aW1lIjoxNzU2NzYwNzM0LCJ1c2VyX2lkIjoic2JyUExIek1pS09VUmRNZTlUVks1NEV1MU1uMiIsInN1YiI6InNiclBMSHpNaUtPVVJkTWU5VFZLNTRFdTFNbjIiLCJpYXQiOjE3NTY3NjYyMjgsImV4cCI6MTc1Njc2OTgyOCwiZW1haWwiOiJveGxleTAwNys1NkBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnsiZW1haWwiOlsib3hsZXkwMDcrNTZAZ21haWwuY29tIl19LCJzaWduX2luX3Byb3ZpZGVyIjoicGFzc3dvcmQifX0.jJ8Kuahlv1gH1g1KbWGRR5uaXGt98vV-RMRqGJW29Ks2F64LFOm7z9Z-Brc6WZ_pTfJkLBJqluNDuZkAiXYYMsZUzSSsD-kGfu7BZUHiUxYVkSyHD8WHu_rR8B1vCAQtjH9YWwSsOND5U3riUV9NvSBtULgls9G4U-ZrDYTvODXBtuUBy0dqf2VdRSWSdItuo-aur_Ks21hgQRRW_GmzyK4eITNk5eg5ZX0WxXDiuAtzQLtH1F11Pf_3-bbRpg8yleTKn6t6MPPbzbkK-LSMzgXcVurhXpSgOJCbqPL6QRkizyHC8MqwYps43vzb3kFuYZvPYXFgWbRH1ombkCPSeA';

// 🌐 Replace with your deployed Cloud Run endpoint
const CHECKOUT_SESSION_URL =
  'https://createdelayedsubscription-dsrs2q3g7q-ts.a.run.app/create-checkout-session';

// 🧾 Subscription to test
const TEST_SUBSCRIPTION_NAME = 'Once a week Premium Friday';

async function testOpenPayment() {
  try {
    const response = await fetch(CHECKOUT_SESSION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${FIREBASE_ID_TOKEN}`,
      },
      body: JSON.stringify({ subscriptionName: TEST_SUBSCRIPTION_NAME }),
    });

    const text = await response.text();
    console.log('🔥 Raw response text from server:', text);

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      console.error('❌ Failed to parse JSON response');
      return;
    }

    console.log('✅ Parsed JSON response:', data);

    if (data.url) {
      console.log('\n🌐 Opening Stripe Checkout page in your browser...');
      await open(data.url);
    } else if (data.error) {
      console.error('❌ Checkout session failed:', data.error);
    } else {
      console.error('❌ Unexpected response:', data);
    }
  } catch (err) {
    console.error('❌ Error calling create-checkout-session:', err);
  }
}

testOpenPayment();

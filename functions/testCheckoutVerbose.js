// testCheckoutVerbose.js
const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));

const CLOUD_RUN_URL =
  'https://createdelayedsubscription-725766869893.australia-southeast1.run.app/create-checkout-session';
const FIREBASE_ID_TOKEN =
  'eyJhbGciOiJSUzI1NiIsImtpZCI6ImVmMjQ4ZjQyZjc0YWUwZjk0OTIwYWY5YTlhMDEzMTdlZjJkMzVmZTEiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vZG9venktYXBwLTQwZDVjIiwiYXVkIjoiZG9venktYXBwLTQwZDVjIiwiYXV0aF90aW1lIjoxNzU2Njk3NTQwLCJ1c2VyX2lkIjoiVXFJWmcxUEhWQmRtQUFNZ2dkRnVXR3dsaEo1MiIsInN1YiI6IlVxSVpnMVBIVkJkbUFBTWdnZEZ1V0d3bGhKNTIiLCJpYXQiOjE3NTY3NDk0MDYsImV4cCI6MTc1Njc1MzAwNiwiZW1haWwiOiJveGxleTAwNys1NEBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnsiZW1haWwiOlsib3hsZXkwMDcrNTRAZ21haWwuY29tIl19LCJzaWduX2luX3Byb3ZpZGVyIjoicGFzc3dvcmQifX0.BGewWHa8CFOtb_JTUmEEREYXJ1qYR4ujA_Xr9rf4ve03VhmH4rjqaWbY29rh_PWYoKqqW9mFF8GjHf5dKSTwYZj_tnT7wmmlpOxRxYa8DFWrf16oUuF95R_szEMyPPfApqCcP1ZvYVQanqezpkvD_bx7fzyoVyFMV9tWAU4Fg4E5izMPxUmrxqTr0HIRmsguCjcUHSNKv3thmWdaelVm9VwqHf4oAUbvG0HmRNZ4hdDBgjCGYTfHY4Zbp05pGdIxSHqhDIiO5ufNFBBULYuPHw3MwVjLU93HibpYkSDsM5K56Y9WfuoUZ1HhCfr5Y-oHPimeyFa6hwmcfcZ8s7SYCg'; // replace with a fresh token

(async () => {
  try {
    console.log('🚀 Sending request to Cloud Run...');

    const res = await fetch(CLOUD_RUN_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${FIREBASE_ID_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    const text = await res.text();
    console.log('Status:', res.status);
    console.log('Raw response:', text);

    // Try to parse JSON if possible
    try {
      const data = JSON.parse(text);
      console.log('Parsed response:', data);
    } catch {
      console.log('Response is not JSON.');
    }
  } catch (err) {
    console.error('❌ Fetch error:', err);
  }
})();

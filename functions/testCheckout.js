// testCheckout.js

// Use Node 18+ which has native fetch
// Make sure to run: node testCheckout.js

const CHECKOUT_URL =
  'https://createdelayedsubscription-725766869893.australia-southeast1.run.app/create-checkout-session';

// Replace this with a fresh ID token from your frontend or Firebase Admin SDK
const FIREBASE_ID_TOKEN =
  'eyJhbGciOiJSUzI1NiIsImtpZCI6ImVmMjQ4ZjQyZjc0YWUwZjk0OTIwYWY5YTlhMDEzMTdlZjJkMzVmZTEiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vZG9venktYXBwLTQwZDVjIiwiYXVkIjoiZG9venktYXBwLTQwZDVjIiwiYXV0aF90aW1lIjoxNzU2Njk3NTQwLCJ1c2VyX2lkIjoiVXFJWmcxUEhWQmRtQUFNZ2dkRnVXR3dsaEo1MiIsInN1YiI6IlVxSVpnMVBIVkJkbUFBTWdnZEZ1V0d3bGhKNTIiLCJpYXQiOjE3NTY3NDc4MDAsImV4cCI6MTc1Njc1MTQwMCwiZW1haWwiOiJveGxleTAwNys1NEBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnsiZW1haWwiOlsib3hsZXkwMDcrNTRAZ21haWwuY29tIl19LCJzaWduX2luX3Byb3ZpZGVyIjoicGFzc3dvcmQifX0.AT6WDxcHggjuRyIhZDNo91YhyC-9F3PFH9z2pWFN_EKkRslEXpYt06x4f_r80uBXKQJ8iSt_1K19pobT5upa7lQ8iu3evYBjzQac_fSdGSPeCx1CyRr8cKi0KvuFZHdSH2Y6pOItsVRA5jpcZ3RyR9rWiiLWi4dFaTEQ4FRBmtTEpQBTHJS5euKgwNGJ79rO2fWEedrEx77dl0tKzZAFZfuGdcXwdSNq0bZiqZ8LlGX3K0EmCyViLNivGK7IkRc4k6EqHflAwyakuOLHo_GGxjpceCJMwkLGp08qWdPVG0l5GxYXj-4tXTjkX3KNAmHWzWvdEkCdUEmu9PvtnZHoJA';

(async () => {
  try {
    const res = await fetch(CHECKOUT_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${FIREBASE_ID_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    const data = await res.json();
    console.log('Status:', res.status);
    console.log('Response:', data);
  } catch (err) {
    console.error('Fetch error:', err);
  }
})();

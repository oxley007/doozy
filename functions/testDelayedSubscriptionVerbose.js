// testDelayedSubscriptionSmart.js
const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));
const admin = require('firebase-admin');

// ----------------- Init Firebase Admin -----------------
if (!admin.apps.length)
  admin.initializeApp({
    credential: admin.credential.applicationDefault(), // make sure GOOGLE_APPLICATION_CREDENTIALS is set
  });
const db = admin.firestore();

// ----------------- Config -----------------
const USER_UID = 'UqIZg1PHVBdmAAMggdFuWGwlhJ52'; // replace with your test Firebase UID
const FIREBASE_ID_TOKEN =
  'eyJhbGciOiJSUzI1NiIsImtpZCI6ImVmMjQ4ZjQyZjc0YWUwZjk0OTIwYWY5YTlhMDEzMTdlZjJkMzVmZTEiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vZG9venktYXBwLTQwZDVjIiwiYXVkIjoiZG9venktYXBwLTQwZDVjIiwiYXV0aF90aW1lIjoxNzU2Njk3NTQwLCJ1c2VyX2lkIjoiVXFJWmcxUEhWQmRtQUFNZ2dkRnVXR3dsaEo1MiIsInN1YiI6IlVxSVpnMVBIVkJkbUFBTWdnZEZ1V0d3bGhKNTIiLCJpYXQiOjE3NTY3NDk3NjMsImV4cCI6MTc1Njc1MzM2MywiZW1haWwiOiJveGxleTAwNys1NEBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnsiZW1haWwiOlsib3hsZXkwMDcrNTRAZ21haWwuY29tIl19LCJzaWduX2luX3Byb3ZpZGVyIjoicGFzc3dvcmQifX0.miCvw0k2A2cJJBbPs4x39EVGDq_PSWtlKi0Z5ov545kVqdnoDQ3_hJI21G6rU_boLtd4cMshtWEzgW8J7-ou6AAnPELT71dPyX0uCkRM3WOrvAndcaIUKjyO16bHXUA7RrkNCMp-yayCt7uGyTtriq63Mgkrndecp4GUBbf8GBBVtO08nKOHTOCG_TI0PW6_PmA9oAeFOk46_G89EOXkdgARcZBFUYqZopAr6sh4iwErT3akhEiDxCqMXpY1axpw5uVJxDbXdq9ivWqXvRZJ__Gtq7Y_24gbC1eucx0IlynBxo7eILzFRZ56BnU0LA_KrTO9I1w-PK8GBIqnll4lpw';

const CLOUD_RUN_BASE =
  'https://createdelayedsubscription-725766869893.australia-southeast1.run.app';

// ----------------- Helper -----------------
async function callEndpoint(endpoint, body = {}) {
  console.log(`🚀 Calling ${endpoint}...`);
  const res = await fetch(`${CLOUD_RUN_BASE}/${endpoint}`, {
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
    data = { raw: text };
  }
  console.log('Status:', res.status);
  console.log('Response:', data);
  return data;
}

// ----------------- Main -----------------
(async () => {
  try {
    // 1️⃣ Get user from Firestore
    const userRef = db.collection('users').doc(USER_UID);
    const userDoc = await userRef.get();
    if (!userDoc.exists) throw new Error('User not found in Firestore');
    const userData = userDoc.data();

    // ----------------- New console checks -----------------
    console.log('User data:', userData);
    console.log(
      'ID token UID:',
      (await admin.auth().verifyIdToken(FIREBASE_ID_TOKEN)).uid,
    );

    if (userData?.subscription?.status) {
      console.log(
        'ℹ️ User already has a subscription. Opening checkout/setup intent to update payment method...',
      );
      await callEndpoint('create-checkout-session'); // or 'create-setup-intent' if preferred
    } else {
      console.log(
        'ℹ️ User has no subscription. Creating delayed subscription...',
      );
      await callEndpoint('create-delayed-subscription', {
        subscriptionName: 'Twice a week Premium',
        firstPaymentTimestamp: Math.floor(Date.now() / 1000) + 60, // trial ends in 1 min for test
      });
    }
  } catch (err) {
    console.error('❌ Test script error:', err);
  }
})();

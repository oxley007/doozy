// testUnifiedSubscriptionFlow.js
const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));
const admin = require('firebase-admin');

// ----------------- Init Firebase Admin -----------------
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}
const db = admin.firestore();

// ----------------- Config -----------------
const USER_UID = 'sbrPLHzMiKOURdMe9TVK54Eu1Mn2';
const FIREBASE_ID_TOKEN =
  'eyJhbGciOiJSUzI1NiIsImtpZCI6ImVmMjQ4ZjQyZjc0YWUwZjk0OTIwYWY5YTlhMDEzMTdlZjJkMzVmZTEiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vZG9venktYXBwLTQwZDVjIiwiYXVkIjoiZG9venktYXBwLTQwZDVjIiwiYXV0aF90aW1lIjoxNzU2NzYwNzM0LCJ1c2VyX2lkIjoic2JyUExIek1pS09VUmRNZTlUVks1NEV1MU1uMiIsInN1YiI6InNiclBMSHpNaUtPVVJkTWU5VFZLNTRFdTFNbjIiLCJpYXQiOjE3NTY3NjA5MjUsImV4cCI6MTc1Njc2NDUyNSwiZW1haWwiOiJveGxleTAwNys1NkBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnsiZW1haWwiOlsib3hsZXkwMDcrNTZAZ21haWwuY29tIl19LCJzaWduX2luX3Byb3ZpZGVyIjoicGFzc3dvcmQifX0.Q5x7xdAJzB6I22mHQTYLGnk633qRt2qN8DPNe8L508wMGEeRQErntlXWELSssO0jBbu-ZMS2Dce_3PspQsY4g2CHZaJfeo6eZcKD-bvHdv7jdSWusr5lvPAOgEarpGYJB8TlSledt3C0tWkkIpTQUzMDpg1P_hBrzNbdA0tVSsgRruiwbSBf7o8O1adptZtPiAfWriY22RLP3fImIPoQN7-J3arQ385sk6tNmLn-Om81-OsSC3GH5CTJK703WQehWLH5RVusQjYCtKjlylmgQwatiD9YvGVsjc64BXwjOXUH7oVcRBMji0YepFT8J37_fZQRdGX41AW2Y5z5RHXvyQ';
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
    console.log('User data:', userData);

    // 2️⃣ Verify token UID
    const decoded = await admin.auth().verifyIdToken(FIREBASE_ID_TOKEN);
    console.log('ID token UID:', decoded.uid);

    // 3️⃣ Call unified endpoint
    const resp = await callEndpoint('handle-subscription', {});

    // 4️⃣ Handle response
    if (resp.clientSecret) {
      console.log(
        '💳 Subscription is past_due. Frontend should collect card using clientSecret',
      );
      console.log('Subscription ID:', resp.subscriptionId);
      console.log('Client Secret:', resp.clientSecret);
    } else if (resp.subscriptionId) {
      console.log('✅ Subscription exists or trialing:', resp.subscriptionId);
      console.log('Current status:', resp.subscriptionStatus || 'trialing');
      console.log(
        'ℹ️ Wait for webhook to set status to past_due to collect card',
      );
    } else {
      console.log('ℹ️ Subscription status:', resp.subscriptionStatus);
    }
  } catch (err) {
    console.error('❌ Test script error:', err);
  }
})();

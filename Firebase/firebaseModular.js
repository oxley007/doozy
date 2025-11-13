// firebaseModular.ts
import { Platform } from "react-native";
import { initializeApp, getApps } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";

// --- Firebase config for modular SDK ---
const projectId = "doozy-app-40d5c"; // your Firebase project ID
const firebaseConfig = {
  apiKey: "AIzaSyDT0rMNhGcbyG9sR8qPjicfq6pBC4cLPZk",
  authDomain: `${projectId}.firebaseapp.com`,
  projectId: projectId,
  storageBucket: `${projectId}.appspot.com`,
  messagingSenderId: "725766869893",
  appId: "1:725766869893:ios:0589d9136dbc4256bbaaec",
};

// --- Initialize modular app only once ---
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

// --- Get modular SDK instances ---
const auth = getAuth(app);
const firestore = getFirestore(app);
const functions = getFunctions(app);

// --- Emulator setup ---
if (__DEV__) {
  const host = Platform.OS === "android" ? "10.0.2.2" : "127.0.0.1";
  connectAuthEmulator(auth, `http://${host}:9099`);
  connectFirestoreEmulator(firestore, host, 8080);
  connectFunctionsEmulator(functions, host, 5001);
  console.log("⚡️ Using Modular SDK Emulators (Auth, Firestore, Functions)");
}

export { app, auth, firestore, functions };

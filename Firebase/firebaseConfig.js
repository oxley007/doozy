// firebaseConfig.js
import { initializeApp as initializeFirebaseApp } from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

// ⚠️ Replace with your actual Firebase project values
const firebaseConfig = {
  apiKey: "AIzaSyDT0rMNhGcbyG9sR8qPjicfq6pBC4cLPZk",
  authDomain: "doozy-app-40d5c.firebaseapp.com",
  projectId: "doozy-app-40d5c",
  storageBucket: "doozy-app-40d5c.appspot.com",
  messagingSenderId: "725766869893",
  appId: "1:725766869893:ios:0589d9136dbc4256bbaaec",
};

// Initialize Firebase app
export const app = initializeFirebaseApp(firebaseConfig);

// **Modular exports — drop-in replacement**
// Persistent login is automatic with RNFirebase
export const authInstance = auth();
export const firestoreInstance = firestore();

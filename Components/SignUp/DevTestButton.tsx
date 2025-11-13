// DevTestButton.tsx
import React from "react";
import { Button, Platform } from "react-native";
import { useDispatch } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { setUserDetails, clearUserDetails } from "../../store/store";

// Modular Firebase SDK for dev/test
import { auth, firestore, functions } from "../../Firebase/firebaseModular";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  User,
  getIdToken
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";

const DevTestButton = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();

  if (!__DEV__) return null; // Only show in dev

  const wait = (ms: number) => new Promise(res => setTimeout(res, ms));

  const handleDevSignup = async () => {
    const email = "testuser@example.com";
    const password = "password123";

    try {
      // -------------------- SIGN OUT EXISTING --------------------
      try {
        await signOut(auth);
        console.log("🚪 Signed out existing user");
      } catch (err) {
        console.warn("⚠️ Could not sign out existing user (probably none)", err);
      }

      dispatch(clearUserDetails());

      // -------------------- SIGN IN OR CREATE USER --------------------
      let user: User | null = null;
      const maxAttempts = 5;
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          user = (await signInWithEmailAndPassword(auth, email, password)).user;
          console.log("✅ Signed in test user");
        } catch (err: any) {
          if (err.code === "auth/user-not-found") {
            user = (await createUserWithEmailAndPassword(auth, email, password)).user;
            console.log("✅ Created new test user");
          } else {
            throw err;
          }
        }

        if (auth.currentUser) break;
        console.log(`⏳ Waiting for currentUser... attempt ${attempt}`);
        await wait(300);
      }

      if (!auth.currentUser) throw new Error("No currentUser after retries!");
      const uid = auth.currentUser.uid;

      // -------------------- LOG ID TOKEN --------------------
      const idToken = await getIdToken(auth.currentUser, /* forceRefresh */ true);
      console.log("🔐 ID Token length:", idToken.length);
      console.log("🔑 ID Token preview:", idToken.slice(0, 50) + "...");

      // -------------------- CREATE/UPDATE FIRESTORE PROFILE --------------------
      const dummyProfile = {
        uid,
        name: "Test User",
        email,
        phone: "0000000000",
        dogBreeds: "Labrador",
        numberOfDogs: "1",
        createdAt: new Date().toISOString(),
        subscription: {
          status: "trial",
          plan: "Once a week Premium",
          trialUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
      };

      await setDoc(doc(firestore, "users", uid), dummyProfile);
      console.log("✅ Firestore profile created/updated");

      dispatch(setUserDetails(dummyProfile));

      // -------------------- CALL CLOUD FUNCTION --------------------
      const fn = httpsCallable(functions, "createDelayedSubscription");
      const firstPaymentTimestamp = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60; // +7 days in seconds

      let fnResult;
      for (let attempt = 1; attempt <= 5; attempt++) {
        try {
          fnResult = await fn({
            subscriptionName: "Once a week Premium",
            firstPaymentTimestamp,
          });
          console.log("✅ Function call succeeded:", fnResult.data);
          break;
        } catch (err) {
          console.warn(`⚠️ Function call attempt ${attempt} failed:`, err);
          await wait(500);
        }
      }

      // -------------------- NAVIGATE --------------------
      navigation.navigate("CheckAddressHome");

    } catch (err) {
      console.error("❌ Dev signup failed:", err);
    }
  };

  return <Button title="⚡ Dev: Create Test User" onPress={handleDevSignup} />;
};

export default DevTestButton;

import React, { useState, useEffect } from "react";
import { View, Text as RNText, ActivityIndicator } from "react-native";
import { TextInput, Button, HelperText } from "react-native-paper";
import { styled } from "nativewind";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { RootState, setUserDetails } from '../../store/store';
import { setUser } from "../../store/authSlice";
import { auth, firestore } from "../../Firebase/firebaseConfig";

const generateRandomPassword = (length = 12) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

const StyledView = styled(View);

export default function SignUpForm() {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<AppDispatch>();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dogBreeds, setDogBreeds] = useState("");
  const [numberOfDogs, setNumberOfDogs] = useState<string | null>(null);
  const [emailError, setEmailError] = useState(false);
  const [loading, setLoading] = useState(false);

  const authState = useSelector((state: RootState) => state.auth);
  const plan = useSelector((state: RootState) => state.plan);

  /*
  useEffect(() => {
    if (authState.uid) navigation.navigate("DoozyHome");
  }, [authState.uid]);
  */

  const validateEmail = (value: string) => /\S+@\S+\.\S+/.test(value);

  const handleSubmit = async () => {
    if (!validateEmail(email)) {
      setEmailError(true);
      return;
    }

    let firebaseUser: any = null;
    let userDocRef: any = null;

    try {
      setLoading(true);
      const password = generateRandomPassword();

      // 1️⃣ Create Firebase Auth user
      const userCred = await auth().createUserWithEmailAndPassword(email, password);
      firebaseUser = userCred.user;

      // 2️⃣ Ensure currentUser is available
      let currentUser = auth().currentUser;
      for (let i = 0; i < 5 && !currentUser; i++) {
        console.log(`⏳ Waiting for currentUser... attempt ${i + 1}`);
        await new Promise((res) => setTimeout(res, 300));
        currentUser = auth().currentUser;
      }
      if (!currentUser) throw new Error("No current user after signup");

      // 🔄 Refresh ID token
      const idToken = await currentUser.getIdToken(true);
      console.log("🔥 Firebase ID Token:", idToken);

      // 3️⃣ Prepare trial timestamp
      const TRIAL_DAYS = 28;
      const trialUntil = new Date();
      trialUntil.setDate(trialUntil.getDate() + TRIAL_DAYS);
      trialUntil.setHours(23, 59, 59, 999);
      const trialUntilSeconds = Math.floor(trialUntil.getTime() / 1000);
      console.log("📆 Cloud Run firstPaymentTimestamp:", trialUntilSeconds);

      const timestamp = Math.floor(Date.now() / 1000);
      const cleanEmail = email.trim();
      const cleanName = name.trim();

      // 4️⃣ Create Firestore user doc
      userDocRef = firestore().collection("users").doc(firebaseUser.uid);
      await userDocRef.set({
        uid: firebaseUser.uid,
        email: cleanEmail,
        name: cleanName,
        phone,
        dogBreeds,
        numberOfDogs: numberOfDogs || "",
        createdAt: new Date(),
        subscription: {
          status: "planning",
          plan: plan.selectedPlan,
          paidUntil: null,
          trialUntil,
          planStart: timestamp,
          soilNeutralantDay: null,
        },
      });

      // 5️⃣ Call Cloud Run function
      const cloudRunUrl = "https://create-delayed-subscription-725766869893.australia-southeast1.run.app/create-delayed-subscription";
      const payload = {
        subscriptionName: plan.selectedPlan,
        firstPaymentTimestamp: trialUntilSeconds,
      };
      console.log("📦 Cloud Run payload:", payload);

      const response = await fetch(cloudRunUrl, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const text = await response.text();
        console.warn("Cloud Run call failed:", response.status, text);
        throw new Error(`Cloud Run function failed: ${response.status}`);
      }

      const data = await response.json();
      console.log("⚡️ Cloud Run response:", data);

      // 6️⃣ Update Redux
      const userData = {
        uid: firebaseUser.uid,
        email: cleanEmail,
        name: cleanName,
        phone,
        dogBreeds,
        numberOfDogs: numberOfDogs || "",
        subscription: {
          status: "planning",
          plan: plan.selectedPlan,
          paidUntil: null,
          trialUntil,
          planStart: timestamp,
          soilNeutralantDay: null,
        },
      };
      dispatch(setUserDetails(userData));
      dispatch(setUser({ uid: firebaseUser.uid, email: cleanEmail, profile: userData }));

      // 7️⃣ Navigate to next screen
      navigation.navigate("CheckAddressHome");

    } catch (err: any) {
      console.error("Signup error:", err);
      if (userDocRef) await userDocRef.delete().catch(() => {});
      if (firebaseUser) await firebaseUser.delete().catch(() => {});
      alert("Signup failed: " + (err.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  const dozzyHomeGo = () => navigation.navigate("DoozyHome");

  return (
    <StyledView className="flex-1 p-4 bg-white" style={{ borderRadius: 5, padding: 20, marginBottom: 40, backgroundColor: '#eeeeee' }}>
      <View style={{ paddingTop: 20, paddingBottom: 20 }}>
        <RNText style={{ fontFamily: 'Inter 24pt Bold', fontSize: 24, color: '#195E4B' }}>Dog Owner Form</RNText>
        <RNText style={{ fontFamily: 'Inter 24pt Bold', fontSize: 22, color: '#999999', lineHeight: 24 }}>Please enter your dog-tails (details) below.</RNText>
      </View>

      <View className="mb-4">
        <RNText style={{ fontFamily: 'Inter 24pt Bold', fontSize: 14, color: '#999999', marginBottom: 8 }}>Your Name</RNText>
        <TextInput value={name} onChangeText={setName} mode="outlined" placeholder="Jane Smith" placeholderTextColor="#888888" style={{ backgroundColor: '#cccccc' }} />
      </View>

      <View className="mb-4">
        <RNText style={{ fontFamily: 'Inter 24pt Bold', fontSize: 14, color: '#999999', marginBottom: 8, marginTop: 10 }}>Email</RNText>
        <TextInput
          value={email}
          onChangeText={(text) => { setEmail(text); setEmailError(false); }}
          mode="outlined"
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder="jane@doozy.co.nz"
          placeholderTextColor="#888888"
          style={{ backgroundColor: '#cccccc' }}
        />
        {emailError && <HelperText type="error" visible={emailError}>Please enter a valid email</HelperText>}
      </View>

      <View className="mb-4">
        <RNText style={{ fontFamily: 'Inter 24pt Bold', fontSize: 14, color: '#999999', marginBottom: 8, marginTop: 10 }}>Phone</RNText>
        <TextInput value={phone} onChangeText={setPhone} mode="outlined" keyboardType="phone-pad" placeholder="022 555 1234" placeholderTextColor="#888888" style={{ backgroundColor: '#cccccc' }} />
      </View>

      <View className="mb-4">
        <RNText style={{ fontFamily: 'Inter 24pt Bold', fontSize: 14, color: '#999999', marginBottom: 8, marginTop: 10 }}>Dog Breed(s)</RNText>
        <TextInput value={dogBreeds} onChangeText={setDogBreeds} mode="outlined" placeholder="Dalmation" placeholderTextColor="#888888" style={{ backgroundColor: '#cccccc' }} />
      </View>

      <View className="mb-4">
        <RNText style={{ fontFamily: 'Inter 24pt Bold', fontSize: 14, color: '#999999', marginBottom: 8, marginTop: 10 }}>Number of dogs</RNText>
        <TextInput value={numberOfDogs} onChangeText={setNumberOfDogs} mode="outlined" placeholder="101" placeholderTextColor="#888888" style={{ backgroundColor: '#cccccc' }} />
      </View>

      <Button
        mode="contained"
        onPress={handleSubmit}
        disabled={loading}
        style={{ paddingVertical: 12, borderRadius: 6, marginTop: 25, backgroundColor: loading ? '#999999' : '#195E4B' }}
        labelStyle={{ fontSize: 16, fontWeight: '800' }}
      >
        {loading ? <ActivityIndicator color="#fff" /> : "Sign up & Continue"}
      </Button>

      <Button
        mode="contained"
        onPress={dozzyHomeGo}
        disabled={loading}
        style={{ paddingVertical: 12, borderRadius: 6, marginTop: 25, backgroundColor: loading ? '#999999' : '#195E4B' }}
        labelStyle={{ fontSize: 16, fontWeight: '800' }}
      >
        Doozy Home
      </Button>
    </StyledView>
  );
}

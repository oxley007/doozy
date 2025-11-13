import 'react-native-get-random-values';

import React, { useState, useEffect } from "react";
import { View, Text as RNText, ActivityIndicator, TouchableOpacity, Alert } from "react-native";
import { TextInput, Button, HelperText } from "react-native-paper";
import { styled } from "nativewind";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { RootState, setUserDetails } from '../../store/store';
import { setUser } from "../../store/authSlice";


import fonts from '../../assets/fonts/fonts.js';

// ✅ RNFirebase imports
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const generateRandomPassword = (length = 12) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

const StyledView = styled(View);

export default function SignUpForm() {
  const user = useSelector((state: RootState) => state.user);
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dogBreeds, setDogBreeds] = useState("");
  const [numberOfDogs, setNumberOfDogs] = useState<string | null>(null);
  const [emailError, setEmailError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [numberOfDogsError, setNumberOfDogsError] = useState("");

  useEffect(() => {
    if (user && Object.keys(user).length > 0) {
      setName(user.name || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
      setDogBreeds(user.dogBreeds || "");
      setNumberOfDogs(user.numberOfDogs ? user.numberOfDogs.toString() : null);
    }
  }, [user]);

  const plan = useSelector((state: RootState) => state.plan);

  const baseWalkPrice = plan.selectedPlan === "Once a Week Walk" ? 34.90 : 29.90;
  const discountedPrice = (baseWalkPrice * 0.8).toFixed(2); // example 20% discount for extra dogs

  const validateEmail = (value: string) => /\S+@\S+\.\S+/.test(value);

  const handleSubmit = async () => {
    if (!validateEmail(email)) {
      setEmailError(true);
      return;
    }

    setLoading(true);

    try {
      const password = generateRandomPassword();
      //Alert.alert('Step 1', 'Before createUserWithEmailAndPassword');

      // 1️⃣ Create Firebase Auth user (RNFirebase)
      //const userCred = await auth().createUserWithEmailAndPassword(email, password);
      let firebaseUser = auth().currentUser;
      if (!firebaseUser) {
        // No user logged in, create a new account
        const password = generateRandomPassword();
        const userCred = await auth().createUserWithEmailAndPassword(email, password);
        firebaseUser = userCred.user;
      } else {
        // User is already logged in
        console.log("User already logged in:", firebaseUser.uid);
      }

      //Alert.alert('Step 2', 'User created successfully');
      //const firebaseUser = userCred.user;
      //Alert.alert("get here 3");
      // 2️⃣ Prepare trial timestamp
      const TRIAL_DAYS = 28;
      const trialUntil = new Date();
      trialUntil.setDate(trialUntil.getDate() + TRIAL_DAYS);
      trialUntil.setHours(23, 59, 59, 999);
      //Alert.alert("get here 4");

      const timestamp = Math.floor(Date.now() / 1000);
      const cleanEmail = email.trim();
      const cleanName = name.trim();
       //Alert.alert('Step 3', 'Before Firestore write');

       const numDogsInt = parseInt(numberOfDogs || '1', 10);
       let adjustedPlanName = plan.selectedPlan;

       if (
         (plan.selectedPlan === "Once a Week Walk" || plan.selectedPlan === "Twice a Week Walk") &&
         numDogsInt > 1
       ) {
         adjustedPlanName = `${plan.selectedPlan} ${numDogsInt} ${numDogsInt === 1 ? "dog" : "dogs"}`;
       }

      // 3️⃣ Create Firestore user doc (RNFirebase)
      await firestore()
        .collection('users')
        .doc(firebaseUser.uid)
        .set({
          uid: firebaseUser.uid,
          email: cleanEmail,
          name: cleanName,
          phone,
          dogBreeds,
          numberOfDogs: numberOfDogs || "",
          createdAt: new Date(),
          role: "user",
          subscription: {
            status: "planning",
            plan: adjustedPlanName,
            paidUntil: null,
            lastPaymentDate: null,
            nextInvoiceDate: null,
            trialUntil,
            planStart: timestamp,
            soilNeutralantDay: null,
            dateOverrideOne: [{
              override: 0,
              date: null,
              originalDate: null,
              overrideIcons: 0,
              overrideCancel: 0,
              icons: {
                doo: 0,
                deod: 0,
                soil: 0,
                fert: 0,
                aer: 0,
                seed: 0,
                repair: 0,
              }
            }],
            dateOverrideTwo: [{
              override: 0,
              date: null,
              originalDate: null,
              overrideIcons: 0,
              overrideCancel: 0,
              icons: {
                doo: 0,
                deod: 0,
                soil: 0,
                fert: 0,
                aer: 0,
                seed: 0,
                repair: 0,
              }
            }],
            dateOverrideThree: [{
              override: 0,
              date: null,
              originalDate: null,
              overrideIcons: 0,
              overrideCancel: 0,
              icons: {
                doo: 0,
                deod: 0,
                soil: 0,
                fert: 0,
                aer: 0,
                seed: 0,
                repair: 0,
              }
            }],
            dateOverrideFour: [{
              override: 0,
              date: null,
              originalDate: null,
              overrideIcons: 0,
              overrideCancel: 0,
              icons: {
                doo: 0,
                deod: 0,
                soil: 0,
                fert: 0,
                aer: 0,
                seed: 0,
                repair: 0,
              }
            }],
            dateOverrideFive: [{
              override: 0,
              date: null,
              originalDate: null,
              overrideIcons: 0,
              overrideCancel: 0,
              icons: {
                doo: 0,
                deod: 0,
                soil: 0,
                fert: 0,
                aer: 0,
                seed: 0,
                repair: 0,
              }
            }],
            dateOverrideSix: [{
              override: 0,
              date: null,
              originalDate: null,
              overrideIcons: 0,
              overrideCancel: 0,
              icons: {
                doo: 0,
                deod: 0,
                soil: 0,
                fert: 0,
                aer: 0,
                seed: 0,
                repair: 0,
              }
            }],
          },
        });

      //Alert.alert('Step 4', 'Firestore write complete — before Redux dispatch');
      // 4️⃣ Update Redux
      const userData = {
        uid: firebaseUser.uid,
        email: cleanEmail,
        name: cleanName,
        phone,
        dogBreeds,
        numberOfDogs: numberOfDogs || "",
        role: "user",
        subscription: {
          status: "planning",
          plan: adjustedPlanName,
          paidUntil: null,
          lastPaymentDate: null,
          nextInvoiceDate: null,
          trialUntil,
          planStart: timestamp,
          soilNeutralantDay: null,
          dateOverrideOne: [{
            override: 0,
            date: null,
            originalDate: null,
            overrideIcons: 0,
            overrideCancel: 0,
            icons: {
              doo: 0,
              deod: 0,
              soil: 0,
              fert: 0,
              aer: 0,
              seed: 0,
              repair: 0,
            }
          }],
          dateOverrideTwo: [{
            override: 0,
            date: null,
            originalDate: null,
            overrideIcons: 0,
            overrideCancel: 0,
            icons: {
              doo: 0,
              deod: 0,
              soil: 0,
              fert: 0,
              aer: 0,
              seed: 0,
              repair: 0,
            }
          }],
          dateOverrideThree: [{
            override: 0,
            date: null,
            originalDate: null,
            overrideIcons: 0,
            overrideCancel: 0,
            icons: {
              doo: 0,
              deod: 0,
              soil: 0,
              fert: 0,
              aer: 0,
              seed: 0,
              repair: 0,
            }
          }],
          dateOverrideFour: [{
            override: 0,
            date: null,
            originalDate: null,
            overrideIcons: 0,
            overrideCancel: 0,
            icons: {
              doo: 0,
              deod: 0,
              soil: 0,
              fert: 0,
              aer: 0,
              seed: 0,
              repair: 0,
            }
          }],
          dateOverrideFive: [{
            override: 0,
            date: null,
            originalDate: null,
            overrideIcons: 0,
            overrideCancel: 0,
            icons: {
              doo: 0,
              deod: 0,
              soil: 0,
              fert: 0,
              aer: 0,
              seed: 0,
              repair: 0,
            }
          }],
          dateOverrideSix: [{
            override: 0,
            date: null,
            originalDate: null,
            overrideIcons: 0,
            overrideCancel: 0,
            icons: {
              doo: 0,
              deod: 0,
              soil: 0,
              fert: 0,
              aer: 0,
              seed: 0,
              repair: 0,
            }
          }],
        },
      };

      //Alert.alert("get here 7");

      dispatch(setUserDetails(userData));
      //Alert.alert("get here 8");
      dispatch(setUser({ uid: firebaseUser.uid, email: cleanEmail, profile: userData }));
      //Alert.alert("get here 9");

      // 5️⃣ Navigate
      //Alert.alert('Step 5', 'Before navigation');
      navigation.navigate("CheckAddressHome");
      //Alert.alert("get here 10");

    } catch (err: any) {
      console.log("🔥 Signup error caught:", err);

      /*
      if (typeof crypto === 'undefined') {
        console.warn("⚠️ crypto is undefined — react-native-get-random-values might not be imported");
      } else if (typeof crypto.getRandomValues !== 'function') {
        console.warn("⚠️ crypto.getRandomValues not found — polyfill may not be working");
      } else {
        console.log("✅ crypto.getRandomValues is available and working");
        const testArray = new Uint8Array(4);
        crypto.getRandomValues(testArray);
        console.log("Sample random values:", testArray);
      }
      */

      // Safe error string
      const errorMsg = err?.message || err?.code || JSON.stringify(err, Object.getOwnPropertyNames(err), 2) || "Unknown error";
      console.error("Signup error (full):", errorMsg);

      // Use RN Alert instead of global alert()
      Alert.alert("Signup Failed", errorMsg);
    } finally {
      setLoading(false);
    }
  };


  /*
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
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      firebaseUser = userCred.user;

      // 2️⃣ Prepare trial timestamp
      const TRIAL_DAYS = 28;
      const trialUntil = new Date();
      trialUntil.setDate(trialUntil.getDate() + TRIAL_DAYS);
      trialUntil.setHours(23, 59, 59, 999);
      const trialUntilSeconds = Math.floor(trialUntil.getTime() / 1000);

      const timestamp = Math.floor(Date.now() / 1000);
      const cleanEmail = email.trim();
      const cleanName = name.trim();

      // 3️⃣ Create Firestore user doc
      userDocRef = doc(firestore, "users", firebaseUser.uid);
      await setDoc(userDocRef, {
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
          lastPaymentDate: null,
          nextInvoiceDate: null,
          trialUntil,
          planStart: timestamp,
          soilNeutralantDay: null,
          dateOverrideOne: [{ override: 0, date: null }],
          dateOverrideTwo: [{ override: 0, date: null }],
          dateOverrideThree: [{ override: 0, date: null }],
          dateOverrideFour: [{ override: 0, date: null }],
          dateOverrideFive: [{ override: 0, date: null }],
          dateOverrideSix: [{ override: 0, date: null }],
        },
      });



      /*
      🚫 Stripe subscription creation disabled for now.
      Uncomment when ready to activate Stripe on signup.
      Moved to AddressChecker.tsx

      // 4️⃣ Call Cloud Run function (same as before)
      const idToken = await firebaseUser.getIdToken(true);
      const cloudRunUrl = "https://create-delayed-subscription-725766869893.australia-southeast1.run.app/create-delayed-subscription";
      const payload = { subscriptionName: plan.selectedPlan, firstPaymentTimestamp: trialUntilSeconds };
      const response = await fetch(cloudRunUrl, {
        method: "POST",
        headers: { "Authorization": `Bearer ${idToken}`, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(`Cloud Run function failed: ${response.status}`);


      // 5️⃣ Update Redux
      const userData = { uid: firebaseUser.uid, email: cleanEmail, name: cleanName, phone, dogBreeds, numberOfDogs: numberOfDogs || "", subscription: { status: "planning", plan: plan.selectedPlan, paidUntil: null, lastPaymentDate: null, nextInvoiceDate: null, trialUntil, planStart: timestamp, soilNeutralantDay: null, dateOverrideOne: [{ override: 0, date: null }], dateOverrideTwo: [{ override: 0, date: null }], dateOverrideThree: [{ override: 0, date: null }], dateOverrideFour: [{ override: 0, date: null }], dateOverrideFive: [{ override: 0, date: null }], dateOverrideSix: [{ override: 0, date: null }] } };
      dispatch(setUserDetails(userData));
      dispatch(setUser({ uid: firebaseUser.uid, email: cleanEmail, profile: userData }));

      // 6️⃣ Navigate
      navigation.navigate("CheckAddressHome");

    } catch (err) {
      console.error("Signup error:", err);
      if (userDocRef) await setDoc(userDocRef, {}).catch(() => {});
      if (firebaseUser) await firebaseUser.delete().catch(() => {});
      alert("Signup failed: " + (err.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };
  */

  const dozzyHomeGo = () => navigation.navigate("DoozyHome");

  return (
    <StyledView className="flex-1 p-4 bg-white" style={{ borderRadius: 5, padding: 20, marginBottom: 40, backgroundColor: '#eeeeee' }}>
      <View style={{ paddingTop: 20, paddingBottom: 20 }}>
        <RNText style={{ fontFamily: fonts.bold, fontSize: 24, color: '#195E4B' }}>Dog Owner Form</RNText>
        <RNText style={{ fontFamily: fonts.bold, fontSize: 22, color: '#999999', lineHeight: 24 }}>Please enter your dog-tails (details) below.</RNText>
      </View>

      <View className="mb-4">
        <RNText style={{ fontFamily: fonts.bold, fontSize: 14, color: '#999999', marginBottom: 8 }}>
          Your Name
        </RNText>
        <TextInput
          value={name}
          onChangeText={setName}
          mode="outlined"
          placeholder="Jane Smith"
          placeholderTextColor="#888888"
          style={{ color: "#333333", backgroundColor: "#ccc" }}
          theme={{
            colors: {
              text: "#333333",
              placeholder: "#888888",
              primary: "#195E4B", // outline color when focused
              surface: "#ccc", // <-- this sets the background
            },
          }}
          contentStyle={{ color: '#333333' }}
        />
      </View>

      <View className="mb-4">
        <RNText style={{ fontFamily: fonts.bold, fontSize: 14, color: '#999999', marginBottom: 8, marginTop: 10 }}>
          Email
        </RNText>
        <TextInput
          value={email}
          onChangeText={(text) => { setEmail(text); setEmailError(false); }}
          mode="outlined"
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder="jane@doozy.co.nz"
          placeholderTextColor="#888888"
          style={{ color: "#333333", backgroundColor: "#ccc" }}
          theme={{
            colors: {
              text: "#333333",
              placeholder: "#888888",
              primary: "#195E4B",
              surface: "#ccc", // <-- this sets the background
            },
          }}
          contentStyle={{ color: '#333333' }}
        />
        {emailError && <HelperText type="error" visible={emailError}>Please enter a valid email</HelperText>}
      </View>

      <View className="mb-4">
        <RNText style={{ fontFamily: fonts.bold, fontSize: 14, color: '#999999', marginBottom: 8, marginTop: 10 }}>
          Phone
        </RNText>
        <TextInput
          value={phone}
          onChangeText={setPhone}
          mode="outlined"
          keyboardType="phone-pad"
          placeholder="022 555 1234"
          placeholderTextColor="#888888"
          style={{ color: "#333333", backgroundColor: "#ccc" }}
          theme={{
            colors: {
              text: "#333333",
              placeholder: "#fff",
              primary: "#195E4B",
              surface: "#ccc", // <-- this sets the background
            },
          }}
          contentStyle={{ color: '#333333' }}
        />
      </View>

      <View className="mb-4">
        <RNText style={{ fontFamily: fonts.bold, fontSize: 14, color: '#999999', marginBottom: 8, marginTop: 10 }}>
          Dog Breed(s)
        </RNText>
        <TextInput
          value={dogBreeds}
          onChangeText={setDogBreeds}
          mode="outlined"
          placeholder="Dalmation"
          placeholderTextColor="#888888"
          style={{ color: "#333333", backgroundColor: "#ccc" }}
          theme={{
            colors: {
              text: "#333333",
              placeholder: "#888888",
              primary: "#195E4B",
              surface: "#ccc", // <-- this sets the background
            },
          }}
          contentStyle={{ color: '#333333' }}
        />
      </View>

      <View className="mb-4">
        <RNText style={{ fontFamily: fonts.bold, fontSize: 14, color: '#999999', marginBottom: 8 }}>
          Number of Dogs
        </RNText>
        <TextInput
          value={numberOfDogs}
          mode="outlined"
          placeholder="1"
          keyboardType="numeric"
          onChangeText={(value) => {
            const numericValue = value.replace(/[^0-9]/g, '');
            setNumberOfDogs(numericValue);

            const numDogs = parseInt(numericValue || '0', 10);

            // Max 3 dogs for all plans
            if (numDogs > 3) {
              setNumberOfDogsError('Maximum dogs serviced is 3 at one household.');
            } else {
              setNumberOfDogsError('');
            }
          }}
          style={{ color: "#333333", backgroundColor: "#ccc" }}
          theme={{
            colors: { text: "#333333", placeholder: "#888888", primary: "#195E4B", surface: "#ccc" },
          }}
        />
        {numberOfDogsError ? (
          <RNText style={{ color: 'red', marginBottom: 10, fontFamily: fonts.medium }}>
            {numberOfDogsError}
          </RNText>
        ) : null}

        {/* Show extra-dog text only for specific plans */}
        {numberOfDogs && parseInt(numberOfDogs, 10) > 1 &&
         (plan.selectedPlan === "Once a Week Walk" || plan.selectedPlan === "Twice a Week Walk") && (
          <RNText style={{ fontFamily: fonts.medium, fontSize: 14, color: '#555555', marginTop: 6 }}>
            We love walking multiple dogs, but we only do one at a time. For each extra dog, a separate 30min walk will be arranged at just ${discountedPrice} each (instead of ${baseWalkPrice} each) — making it easy and fair!
          </RNText>
        )}
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 20 }}>
        <TouchableOpacity
          onPress={() => setAcceptedTerms(!acceptedTerms)}
          style={{
            width: 26,
            height: 26,
            borderWidth: 1.5,
            borderColor: '#195E4B',
            borderRadius: 4,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: acceptedTerms ? '#195E4B' : '#fff',
          }}
        >
          {acceptedTerms && (
            <RNText style={{ color: '#fff', fontSize: 18 }}>✓</RNText>
          )}
        </TouchableOpacity>

        <RNText style={{ marginLeft: 8 }}>
          I agree to the{' '}
          <RNText
            style={{ color: 'blue' }}
            onPress={() =>
              navigation.navigate('Terms', { from: 'SignUpScreen' })
            }
          >
            Terms & Conditions
          </RNText>
        </RNText>
      </View>

      <Button
        mode="contained"
        textColor="#FFFFFF"     // text color
        onPress={handleSubmit}
        disabled={loading || !acceptedTerms} // disabled if loading or T&C not accepted
        style={{
          paddingVertical: 12,
          borderRadius: 6,
          marginTop: 25,
          backgroundColor: loading || !acceptedTerms ? '#999999' : '#195E4B', // greyed out if disabled
        }}
        labelStyle={{ fontSize: 16, fontWeight: '800' }}
      >
        {loading ? <ActivityIndicator color="#fff" /> : "Sign up & Continue"}
      </Button>

    </StyledView>
  );
}

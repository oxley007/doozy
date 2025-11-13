import React, { useMemo, useState, useEffect } from "react";
import { View, Text as RNText, Alert, Linking, ActivityIndicator } from "react-native";
import { useSelector } from "react-redux";
import { styled } from "nativewind";
import { Button } from "react-native-paper";
import InAppBrowser from "react-native-inappbrowser-reborn";
import auth from "@react-native-firebase/auth";
import useUserSubscriptionListener from "../../hooks/useUserSubscriptionListener";
import { useStripeRedirectHandler } from '../../hooks/useStripeRedirectHandler';
import { RootState } from "../../store/store";

import fonts from '../../assets/fonts/fonts.js';

const StyledView = styled(View);

export default function PaymentRequiredBox() {
  useUserSubscriptionListener();
  useStripeRedirectHandler();

  const user = useSelector((state: RootState) => state.user);
  const [firebaseUser, setFirebaseUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged((user) => {
      setFirebaseUser(user);
      setAuthChecked(true);
    });
    return () => unsubscribe();
  }, []);

  const showPaymentBox = useMemo(() => {
    const status = user?.subscription?.status;
    const triggerStatuses = ["past_due", "canceled", "incomplete", "incomplete_expired", "unpaid"];
    return status ? triggerStatuses.includes(status) : false;
  }, [user]);


  const lastPaymentLabel = useMemo(() => {
    if (!user?.subscription?.lastPaymentDate) return null;
    return `Most recent payment completed on ${new Date(
      user.subscription.lastPaymentDate
    ).toLocaleDateString("en-NZ", { weekday: "long", day: "numeric", month: "long" })}`;
  }, [user]);

  const handleAddPayment = async () => {
    if (!firebaseUser) {
      Alert.alert("Error", "Firebase not initialized. Please try again.");
      return;
    }

    setLoading(true); // ✅ start loading

    try {
      const idToken = await firebaseUser.getIdToken(true);
      if (!idToken) throw new Error("Failed to get Firebase ID token");
      console.log("✅ Firebase ID token (first 20 chars):", idToken.slice(0, 20) + "...");

      const subscriptionPlan = user.subscription?.plan;
      if (!subscriptionPlan) throw new Error("No subscription plan found for user");

      const res = await fetch(
        "https://create-delayed-subscription-725766869893.australia-southeast1.run.app/create-checkout-session",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${idToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ subscriptionName: subscriptionPlan }),
        }
      );

      const text = await res.text();
      const data = (() => { try { return JSON.parse(text); } catch { return { raw: text }; } })();
      if (!data.url) throw new Error("No checkout URL returned from backend");

      if (await InAppBrowser.isAvailable()) {
        await InAppBrowser.open(data.url, {
          dismissButtonStyle: "close",
          preferredBarTintColor: "#195E4B",
          preferredControlTintColor: "white",
          readerMode: false,
          animated: true,
          modalPresentationStyle: "fullScreen",
        });
      } else {
        Linking.openURL(data.url);
      }
    } catch (err) {
        console.error("Firebase token error:", err);
        Alert.alert("Error", err.message || JSON.stringify(err));
    } finally {
        setLoading(false); // ✅ stop loading
    }
  };

  if (!authChecked) return <ActivityIndicator />; // wait for Firebase
  if (!showPaymentBox) return null;

  return (
    <StyledView style={{ borderRadius: 8, backgroundColor: "#ffeaea", padding: 20, marginBottom: 40 }}>
      <RNText style={{ fontFamily: fonts.bold, fontSize: 20, color: "#b71c1c", marginBottom: 12 }}>Payment Required</RNText>
      <RNText style={{ fontFamily: fonts.medium, fontSize: 16, color: "#444444", marginBottom: 16 }}>
        Thanks for completing your first month with Doozy! Please enable automatic monthly payments.
      </RNText>
      <RNText style={{ fontFamily: fonts.regular, fontSize: 10, color: "#444444", marginBottom: 16 }}>
        Please note a small processing fee is added to cover card transaction costs.
      </RNText>

      <Button
        mode="contained"
        onPress={handleAddPayment}
        style={{ backgroundColor: "#195E4B", borderRadius: 8, paddingVertical: 6 }}
        labelStyle={{ fontSize: 16, fontWeight: "bold", color: "white" }}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="white" /> : "Add Payment Details"}
      </Button>
    </StyledView>
  );
}

import React, { useState } from "react";
import {
  View,
  Text as RNText,
  TextInput,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
} from "react-native";
import { Button } from "react-native-paper";
import { useDispatch } from "react-redux";
import { useNavigation, useRoute } from "@react-navigation/native";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import { setUserDetails, setSelectedPlan } from "../../store/store";
import { setBookings } from "../../store/bookingSlice";

export default function LoginScreen() {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const route = useRoute<any>();
  const returnScreen = route.params?.returnScreen || "Home";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  // ---------------- LOGIN ----------------
  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const userCred = await auth().signInWithEmailAndPassword(email, password);
      const uid = userCred.user.uid;

      // Get user document
      const userSnap = await firestore().collection("users").doc(uid).get();
      if (!userSnap.exists) {
        setError("No user data found in Firestore.");
        setLoading(false);
        return;
      }

      const userData = userSnap.data() || {};

      // Update Redux with user details
      dispatch(setUserDetails({ uid, ...userData }));

      // Update Redux with subscription plan
      if (userData?.subscription?.plan) {
        dispatch(setSelectedPlan(userData.subscription.plan));
      }

      // ✅ Update Redux with bookings exactly as in Firebase
      const firebaseBookings = Array.isArray(userData.booking) ? userData.booking : [];
      dispatch(setBookings(firebaseBookings));

      // Reset navigation stack
      navigation.reset({
        index: 0,
        routes: [{ name: "DoozyHome" }],
      });
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Failed to login.");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- FORGOT PASSWORD ----------------
  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert(
        "Missing Email",
        "Please enter your email before requesting password reset."
      );
      return;
    }

    try {
      await auth().sendPasswordResetEmail(email); // ✅ RN Firebase method
      Alert.alert(
        "Email Sent",
        `A password reset email has been sent to ${email}. Please check your inbox and spam folder.`
      );
      setResetSent(true);
    } catch (err: any) {
      console.error("Forgot password error:", err);
      Alert.alert("Error", err.message || "Failed to send reset email.");
    }
  };

  return (
    <ScrollView style={{ marginBottom: 40, minHeight: "100%" }}>
      <View style={styles.container}>
        <View style={{ justifyContent: "center", alignItems: "center" }}>
          <Image
            source={require("../../assets/images/Doozy_dog_logo.png")}
            style={{ width: 225, height: 225 }}
            resizeMode="contain"
          />
        </View>

        <RNText style={styles.title}>Login to Doozy</RNText>

        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
        />

        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />

        {error && <RNText style={styles.error}>{error}</RNText>}

        <Button
          mode="contained"
          onPress={handleLogin}
          loading={loading}
          disabled={loading}
          style={styles.button}
        >
          Login
        </Button>

        <View style={styles.resetBox}>
          <RNText style={styles.resetTitle}>Reset Password</RNText>
          <RNText style={styles.resetDescription}>
            If you’ve forgotten your password, click below:
          </RNText>
          <Button
            mode="contained"
            onPress={handleForgotPassword}
            buttonColor="#195E4B"   // background color
            textColor="#FFFFFF"     // text color
            style={styles.resetButton}
            labelStyle={styles.resetButtonLabel}
          >
            Forgot Password
          </Button>

          {resetSent && (
            <RNText style={styles.success}>
              Forgot password email has been sent to {email}. If you don’t see it,
              please check your spam/junk folder.
            </RNText>
          )}
        </View>

        <Button
          mode="text"
          buttonColor="#195E4B"   // background color
          textColor="#FFFFFF"     // text color
          onPress={() => navigation.navigate(returnScreen)}
          labelStyle={{
            fontSize: 16,
            textDecorationLine: "underline",
          }}
          style={{ marginBottom: 20 }}
        >
          Back
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E9FCDA",
    justifyContent: "center",
    padding: 20,
    minHeight: "100%",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 30,
    textAlign: "center",
    color: "#195E4B",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    backgroundColor: "white",
  },
  button: {
    backgroundColor: "#195E4B",
    paddingVertical: 12,
    borderRadius: 8,
  },
  error: {
    color: "red",
    marginBottom: 15,
    textAlign: "center",
  },
  resetBox: {
    borderRadius: 8,
    backgroundColor: "#eeeeee",
    padding: 20,
    marginTop: 30,
    marginBottom: 40,
  },
  resetTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#195E4B",
    paddingBottom: 10,
  },
  resetDescription: {
    fontSize: 16,
    color: "#555555",
  },
  resetButton: {
    paddingVertical: 12,
    borderRadius: 6,
    marginTop: 25,
  },
  resetButtonLabel: {
    fontSize: 16,
    fontWeight: "800",
    color: "#fff",
  },
  success: {
    color: "green",
    marginTop: 12,
    textAlign: "center",
  },
});

import React, { useState } from "react";
import { Alert, View, Text, ActivityIndicator } from "react-native";
import { Button } from "react-native-paper";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import { useDispatch } from "react-redux";
import { clearUser } from "../../store/authSlice";
import { useNavigation } from "@react-navigation/native";

const cloudRunUrl = "https://create-delayed-subscription-725766869893.australia-southeast1.run.app/notify-account-deletion";

const DeleteAccount = () => {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();

  const handleDelete = async () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to permanently delete your account? This action will stop your subscription and cannot be undone. Your final bill will occur at the end of your 28-day billing cycle.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
              const user = auth().currentUser;
              if (!user) throw new Error("No user logged in");

              // 1️⃣ Notify backend (send email or trigger Stripe cancellation)
              try {
                const idToken = await user.getIdToken();
                await fetch(cloudRunUrl, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${idToken}`,
                  },
                  body: JSON.stringify({ uid: user.uid, email: user.email }),
                });
              } catch (notifyErr) {
                console.log("Failed to notify backend:", notifyErr);
                // Continue anyway — this shouldn't block account deletion
              }

              // 2️⃣ Delete user data from Firestore
              await firestore().collection("users").doc(user.uid).delete().catch(() => {
                console.log("No user document found to delete");
              });

              // 3️⃣ Delete user authentication record
              await user.delete();

              // 4️⃣ Clear Redux and navigate home
              dispatch(clearUser());
              navigation.reset({
                index: 0,
                routes: [{ name: "Home" }],
              });

              Alert.alert("Account Deleted", "Your account has been permanently deleted.");
            } catch (err: any) {
              console.error("Delete account error:", err);
              if (err.code === "auth/requires-recent-login") {
                Alert.alert(
                  "Reauthentication Required",
                  "Please log out and log back in, then try deleting your account again."
                );
              } else {
                Alert.alert("Error", err.message || "Failed to delete account.");
              }
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={{ padding: 0 }}>
      <Text style={{ fontSize: 16, marginBottom: 15 }}>
        You can permanently delete your account and all associated data below.{"\n\n"}
        Note: if you want to cancel your subscription and keep your account, press 'Email Support' above and we can stop your subscription manually.
      </Text>
      <Button
        mode="contained"
        onPress={handleDelete}
        disabled={loading}
        buttonColor="#d9534f"
      >
        {loading ? <ActivityIndicator color="#fff" /> : "Delete My Account"}
      </Button>
    </View>
  );
};

export default DeleteAccount;

import React from "react";
import { TouchableOpacity, Text, Linking, Alert, StyleSheet, Platform } from "react-native";

interface EmailButtonProps {
  email: string;
  subject: string;
  label?: string; // optional button label
  body?: string;  // optional email body
}

export default function EmailButton({ email, subject, label, body }: EmailButtonProps) {

  const handlePress = async () => {
    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}${
      body ? `&body=${encodeURIComponent(body)}` : ""
    }`;

    try {
      if (Platform.OS === "ios") {
        const supported = await Linking.canOpenURL(mailtoUrl);
        if (!supported) {
          Alert.alert("Error", "No email app installed.");
          return;
        }
      }
      await Linking.openURL(mailtoUrl);
    } catch (error) {
      Alert.alert("Error", "Could not open email app.");
      console.error("Error opening email app:", error);
    }
  };

  return (
    <TouchableOpacity style={styles.button} onPress={handlePress}>
      <Text style={styles.buttonText}>{label || "Email Update Request"}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#195E4B",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 10,
    width: "100%", // full width button
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});

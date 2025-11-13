import React, { useState } from "react";
import {
  View,
  Text as RNText,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import firestore from "@react-native-firebase/firestore";
import { useRoute } from "@react-navigation/native";
import BottomMenu from "../Menus/BottomMenu";
import AdminBottomMenu from "../Menus/AdminBottomMenu";
import fonts from "../../assets/fonts/fonts.js";

export default function AddPickupCount({ navigation }: any) {
  const route = useRoute<any>();
  const { userId } = route.params;

  const [newCount, setNewCount] = useState("");

  const addPickup = async () => {
    if (!userId) {
      Alert.alert("❌ No user selected");
      return;
    }

    if (newCount === "") {
      Alert.alert("❌ Enter a count first");
      return;
    }

    try {
      await firestore()
        .collection("users")
        .doc(userId)
        .collection("pickups")
        .add({
          date: firestore.FieldValue.serverTimestamp(),
          count: parseInt(newCount, 10),
        });
      Alert.alert("✅ Success", `Saved ${newCount} doo's collected`);
      setNewCount("");
      navigation.navigate("AdminHome"); // optional: navigate back
    } catch (err: any) {
      console.error("Error saving pickup:", err);
      Alert.alert("❌ Error saving pickup", err.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#E9FCDA" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={80}
    >
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 100 }}>
        <View style={{ justifyContent: "center", alignItems: "center", marginBottom: 60 }}>
          <RNText style={styles.title}>Add Dog Doo Count</RNText>
          <RNText style={styles.subtitle}>
            Add Dog Doo Count to output to user
          </RNText>
        </View>

        <View style={styles.container}>
          <TextInput
            style={styles.input}
            placeholder="Number of doo's collected"
            keyboardType="numeric"
            value={newCount}
            onChangeText={setNewCount}
          />

          <TouchableOpacity style={styles.button} onPress={addPickup}>
            <RNText style={styles.buttonText}>Save Count</RNText>
          </TouchableOpacity>
        </View>

        <View style={{ paddingBottom: 180 }} />
      </ScrollView>

      <AdminBottomMenu />
      <BottomMenu />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#eee", borderRadius: 8 },
  title: { fontFamily: fonts.bold, fontSize: 28, color: "#195E4B", textAlign: "center", marginBottom: 12 },
  subtitle: { fontFamily: fonts.bold, fontSize: 22, color: "#999", textAlign: "center", marginBottom: 20 },
  input: { borderWidth: 1, borderColor: "#aaa", padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 16, backgroundColor: "#fff" },
  button: { backgroundColor: "#195E4B", padding: 15, borderRadius: 8, alignItems: "center" },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});

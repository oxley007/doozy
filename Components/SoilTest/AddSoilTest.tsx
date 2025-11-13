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

export default function AddSoilTest({ navigation }: any) {
  const route = useRoute<any>();
  const { userId } = route.params;

  const [ph, setPh] = useState("");
  const [nitrogen, setNitrogen] = useState("");
  const [phosphorus, setPhosphorus] = useState("");
  const [potassium, setPotassium] = useState("");

  const saveTest = async () => {
    try {
      await firestore()
        .collection("users")
        .doc(userId)
        .collection("soilTests")
        .add({
          date: firestore.FieldValue.serverTimestamp(),
          ph: parseFloat(ph),
          nitrogen: parseFloat(nitrogen),
          phosphorus: parseFloat(phosphorus),
          potassium: parseFloat(potassium),
        });
      Alert.alert("✅ Success", "Soil test saved");
      navigation.navigate("AdminHome");
    } catch (err: any) {
      Alert.alert("❌ Error", err.message);
      console.log(err.message);
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
          <RNText style={styles.title}>Add Soil Test</RNText>
          <RNText style={styles.subtitle}>
            Add test results to output to user
          </RNText>
        </View>

        <View style={styles.container}>
          {[
            { value: ph, setter: setPh, placeholder: "pH (e.g. 6.5)" },
            { value: nitrogen, setter: setNitrogen, placeholder: "Nitrogen (0–4)" },
            { value: phosphorus, setter: setPhosphorus, placeholder: "Phosphorus (0–4)" },
            { value: potassium, setter: setPotassium, placeholder: "Potassium (0–4)" },
          ].map((field, idx) => (
            <TextInput
              key={idx}
              style={styles.input}
              placeholder={field.placeholder}
              keyboardType="numeric"
              value={field.value}
              onChangeText={field.setter}
              multiline={false} // numeric fields don’t need multiline
            />
          ))}

          <TouchableOpacity style={styles.button} onPress={saveTest}>
            <RNText style={styles.buttonText}>Save Test</RNText>
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
  title: { fontFamily: fonts.bold, fontSize: 32, color: "#195E4B" },
  subtitle: { fontFamily: fonts.bold, fontSize: 28, color: "#999", lineHeight: 28, textAlign: "center" },
  input: {
    borderWidth: 1,
    borderColor: "#aaa",
    padding: 12,
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#195E4B",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});

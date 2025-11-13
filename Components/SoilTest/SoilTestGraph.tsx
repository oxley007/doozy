import React, { useEffect, useState } from "react";
import { View, Text as RNText, TextInput, Button, StyleSheet, ScrollView, Dimensions, KeyboardAvoidingView, TouchableOpacity } from "react-native";
import { LineChart } from "react-native-chart-kit";
import firestore from "@react-native-firebase/firestore";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import fonts from "../../assets/fonts/fonts.js";
import { useNavigation } from "@react-navigation/native";

interface SoilTestGraphProps {
  userId: string;
}

interface SoilTest {
  id: string;
  date: any;
  ph: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
}

const LegendItem = ({ color, label, note }: { color: string; label: string; note: string }) => (
  <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
    <View style={{ width: 16, height: 16, backgroundColor: color, borderRadius: 4, marginRight: 8 }} />
    <RNText style={{ fontFamily: fonts.medium, fontSize: 14, color: "#333" }}>
      {label} – <RNText style={{ fontFamily: fonts.regular, color: "#666" }}>{note}</RNText>
    </RNText>
  </View>
);

export default function SoilTestGraph({ userId }: SoilTestGraphProps) {
  const navigation = useNavigation();
  const [soilData, setSoilData] = useState<SoilTest[]>([]);
  const [newTest, setNewTest] = useState({ ph: "", nitrogen: "", phosphorus: "", potassium: "" });
  const user = useSelector((state: RootState) => state.user);

  // Firestore listener: last 12 tests, chronological order
  useEffect(() => {
    if (!userId) return; // avoid null doc paths

    const unsubscribe = firestore()
      .collection("users")
      .doc(userId)
      .collection("soilTests")
      .orderBy("date", "desc")
      .limit(12)
      .onSnapshot(
        (snap) => {
          if (!snap || snap.empty) {
            setSoilData([]);
            return;
          }

          const data: SoilTest[] = snap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as SoilTest[];
          setSoilData(data.reverse()); // chronological order
        },
        (error) => {
          console.error("Firestore listener error:", error);
        }
      );

    return () => unsubscribe();
  }, [userId]);


  // Add new test (admin only)
  const addNewTest = async () => {
    const { ph, nitrogen, phosphorus, potassium } = newTest;
    if ([ph, nitrogen, phosphorus, potassium].some((v) => v === "")) {
      console.log("Missing field(s), not saving:", newTest);
      return;
    }

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
      console.log("Saved soil test:", newTest);

      setNewTest({ ph: "", nitrogen: "", phosphorus: "", potassium: "" });
    } catch (err) {
      console.error("Error saving test:", err);
    }
  };

  // Graph data
  const labels = soilData.length
    ? soilData.map((d) => d.date?.toDate?.().toLocaleDateString("en-NZ", { month: "short", day: "numeric" }) || "-")
    : ["No data"];

  const datasets = [
    { data: soilData.map((d) => d.ph ?? 0), color: () => "#195E4B", strokeWidth: 2, label: "pH" },
    { data: soilData.map((d) => d.nitrogen ?? 0), color: () => "#f39c12", strokeWidth: 2, label: "Nitrogen" },
    { data: soilData.map((d) => d.phosphorus ?? 0), color: () => "#2980b9", strokeWidth: 2, label: "Phosphorus" },
    { data: soilData.map((d) => d.potassium ?? 0), color: () => "#c0392b", strokeWidth: 2, label: "Potassium" },
  ];

  const chartWidth = Math.min(Dimensions.get("window").width - 40, 350);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={100} // adjust if you have a header
    >

      <RNText style={{ fontFamily: fonts.bold, fontSize: 22, color: "#195E4B", marginBottom: 12 }}>
        Soil Test Results
      </RNText>

      {soilData.length === 0 ? (
        <RNText style={{ fontFamily: fonts.medium, fontSize: 16, color: "#999" }}>
          No test results yet.
        </RNText>
      ) : (
        <LineChart
          data={{ labels, datasets }}
          width={chartWidth}
          height={220}
          yAxisSuffix=""
          chartConfig={{
            backgroundColor: "#eee",
            backgroundGradientFrom: "#eee",
            backgroundGradientTo: "#eee",
            decimalPlaces: 1,
            color: (opacity = 1) => `rgba(25, 94, 75, ${opacity})`,
            labelColor: () => "#555",
            style: { borderRadius: 8 },
          }}
          bezier
          style={{ borderRadius: 8 }}
        />
      )}

      {/* 🔑 Legend / Colour Key */}
      <View style={{ marginTop: 16 }}>
        <LegendItem color="#195E4B" label="pH" note="Ideal level 6.0–7.0" />
        <LegendItem color="#f39c12" label="Nitrogen (N)" note="Ideal level 2" />
        <LegendItem color="#2980b9" label="Phosphorus (P)" note="Ideal level 2–3" />
        <LegendItem color="#c0392b" label="Potassium (K)" note="Ideal level 3–4" />
      </View>

      <TouchableOpacity
        onPress={() => {
          if (!userId) {
            Alert.alert("No user selected");
            return;
          }
          navigation.navigate("SoilInfo", { userId });
        }}
      >
      <RNText style={{ textDecorationLine: "underline", color: "#195E4B", paddingTop: 20 }}>
        Learn more about Soil treatment
      </RNText>
      </TouchableOpacity>

      {user.isAdmin && (
        <View style={{ marginTop: 20 }}>
          <TouchableOpacity
            style={{ marginTop: 10, padding: 8, backgroundColor: "#195E4B", borderRadius: 6 }}
            onPress={() => {
              if (!userId) {
                Alert.alert("No user selected");
                return;
              }
              navigation.navigate("AddSoilTest", { userId });
            }}
          >
            <RNText style={{ color: "#fff", textAlign: "center" }}>Add Soil Test</RNText>
          </TouchableOpacity>

        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  input: {
    borderBottomWidth: 1,
    borderColor: "#195E4B",
    marginBottom: 10,
    fontSize: 16,
    paddingVertical: 6,
  },
});

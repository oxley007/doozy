import React, { useEffect, useState } from "react";
import { View, Text as RNText, ScrollView, Dimensions, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import firestore from "@react-native-firebase/firestore";
import { LineChart } from "react-native-chart-kit";
import fonts from "../../assets/fonts/fonts.js";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { useNavigation } from "@react-navigation/native";
import { TouchableOpacity, Alert } from "react-native"; // make sure to import these

interface PickupGraphProps {
  userId: string;
}

interface Pickup {
  id: string;
  date: any;
  count: number;
}

export default function PickupGraph({ userId }: PickupGraphProps) {
  const user = useSelector((state: RootState) => state.user);
  const navigation = useNavigation<any>();
  const [pickups, setPickups] = useState<Pickup[]>([]);

  // Firestore listener: last 12 pickups, chronological
  useEffect(() => {
    if (!userId) return;

    const unsubscribe = firestore()
      .collection("users")
      .doc(userId)
      .collection("pickups")
      .orderBy("date", "desc")
      .limit(12)
      .onSnapshot(
        (snap) => {
          if (!snap || snap.empty) {
            setPickups([]);
            return;
          }
          const data: Pickup[] = snap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Pickup[];
          setPickups(data.reverse());
        },
        (error) => console.error("Firestore listener error:", error)
      );

    return () => unsubscribe();
  }, [userId]);

  const labels = pickups.length
    ? ["Start", ...pickups.map(d =>
        d.date?.toDate?.().toLocaleDateString("en-NZ", { month: "short", day: "numeric" }) || "-"
      )]
    : ["No data"];

  const dataValues = pickups.length ? [0, ...pickups.map(d => d.count ?? 0)] : [];
  const chartWidth = Math.min(Dimensions.get("window").width - 40, 350);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={100} // adjust if you have a header
    >
      <RNText style={{ fontFamily: fonts.bold, fontSize: 22, color: "#195E4B", marginBottom: 12 }}>
        Dog Doo Pickup Count!
      </RNText>
      <RNText style={{ fontFamily: fonts.bold, fontSize: 16, color: "#999", marginBottom: 12 }}>
        How many poos? Count each doo!
      </RNText>

      <ScrollView>
        {pickups.length === 0 ? (
          <RNText style={styles.noData}>No pickups recorded yet.</RNText>
        ) : (
          <LineChart
            data={{ labels, datasets: [{ data: dataValues, color: () => "#195E4B", strokeWidth: 2 }] }}
            width={chartWidth}
            height={220}
            yAxisSuffix=""
            chartConfig={{
              backgroundColor: "#eee",
              backgroundGradientFrom: "#eee",
              backgroundGradientTo: "#eee",
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(25, 94, 75, ${opacity})`,
              labelColor: () => "#555",
              style: { borderRadius: 8 },
            }}
            bezier
            style={{ borderRadius: 8 }}
          />
        )}
      </ScrollView>

      {user.isAdmin && (
        <View style={{ marginTop: 20 }}>
          <TouchableOpacity
            style={{ marginTop: 10, padding: 8, backgroundColor: "#195E4B", borderRadius: 6 }}
            onPress={() => {
              if (!userId) {
                Alert.alert("No user selected");
                return;
              }
              navigation.navigate("AddPickupCount", { userId });
            }}
          >
            <RNText style={{ color: "#fff", textAlign: "center" }}>Add Doo Count</RNText>
          </TouchableOpacity>

        </View>
      )}

    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: fonts.bold, fontSize: 28, color: "#195E4B", marginBottom: 12, textAlign: "center" },
  noData: { fontFamily: fonts.medium, fontSize: 16, color: "#999", marginTop: 0 },
});

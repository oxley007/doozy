// components/EditOverrides.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text as RNText,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRoute } from "@react-navigation/native";
import firestore from "@react-native-firebase/firestore";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import BottomMenu from "../Menus/BottomMenu";
import AdminBottomMenu from "../Menus/AdminBottomMenu";
import fonts from "../../assets/fonts/fonts";

type OverrideIcons = {
  doo: number;
  deod: number;
  soilNeutraliser: number;
  fert: number;
  aer: number;
  seed: number;
  repair: number;
};

type Override = {
  override: number;
  date: number | null;
  originalDate: number | null;
  overrideCancel: number;
  overrideIcons: number;
  icons: OverrideIcons;
};

type Subscription = {
  [key: string]: any;
};

const ICONS = [
  { key: "doo", label: "Doo pickup", icon: "delete-circle" },
  { key: "deod", label: "Deodorising spray", icon: "spray" },
  { key: "soilNeutraliser", label: "Soil Neutraliser", icon: "leaf" },
  { key: "fert", label: "Fertiliser", icon: "grass" },
  { key: "aer", label: "Lawn Aeration", icon: "circle-slice-8" },
  { key: "seed", label: "Test Soil", icon: "flask-outline" },
  { key: "repair", label: "Repair bare spots", icon: "tools" },
];

const OVERRIDE_KEYS = [
  "dateOverrideOne",
  "dateOverrideTwo",
  "dateOverrideThree",
  "dateOverrideFour",
  "dateOverrideFive",
  "dateOverrideSix",
];

// Utility: normalize date to 11:59:59 NZT
function endOfDayNZ(date: Date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export default function EditOverrides() {
  const route = useRoute<any>();
  const { userId } = route.params;
  const [overrides, setOverrides] = useState<Override[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<any | null>(null);

  const [showPicker, setShowPicker] = useState<{
    index: number | null;
    type: "date" | "original" | null;
  }>({ index: null, type: null });

  // Load subscription overrides
  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
      try {
        const doc = await firestore().collection("users").doc(userId).get();
        const data = doc.data()?.subscription;
        setSubscription(data);

        const loadedOverrides: Override[] = OVERRIDE_KEYS.map((key) => {
          return data?.[key]?.[0] || {
            override: 0,
            date: null,
            originalDate: null,
            overrideCancel: 0,
            overrideIcons: 0,
            icons: {
              doo: 0,
              deod: 0,
              soilNeutraliser: 0,
              fert: 0,
              aer: 0,
              seed: 0,
              repair: 0,
            },
          };
        });

        setOverrides(loadedOverrides);
      } catch (err) {
        console.log(err);
        Alert.alert("❌ Error", "Failed to load overrides");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const toggleOverride = (index: number) => {
    const newOverrides = [...overrides];
    newOverrides[index].override = newOverrides[index].override ? 0 : 1;
    setOverrides(newOverrides);
  };

  const toggleCancel = (index: number) => {
    const newOverrides = [...overrides];
    newOverrides[index].overrideCancel = newOverrides[index].overrideCancel ? 0 : 1;
    setOverrides(newOverrides);
  };

  const toggleIcons = (index: number) => {
    const newOverrides = [...overrides];
    newOverrides[index].overrideIcons = newOverrides[index].overrideIcons ? 0 : 1;
    setOverrides(newOverrides);
  };

  const toggleIconOption = (overrideIndex: number, iconKey: keyof OverrideIcons) => {
    const newOverrides = [...overrides];
    newOverrides[overrideIndex].icons[iconKey] = newOverrides[overrideIndex].icons[iconKey]
      ? 0
      : 1;
    setOverrides(newOverrides);
  };

  const setOverrideDate = (index: number, date: Date) => {
    const newOverrides = [...overrides];
    newOverrides[index].date = Math.floor(endOfDayNZ(date).getTime() / 1000);
    setOverrides(newOverrides);
  };

  const setOriginalDate = (index: number, date: Date) => {
    const newOverrides = [...overrides];
    newOverrides[index].originalDate = Math.floor(endOfDayNZ(date).getTime() / 1000);
    setOverrides(newOverrides);
  };

  const saveOverrides = async () => {
    const updateObj: any = {};
    OVERRIDE_KEYS.forEach((key, idx) => {
      updateObj[key] = [overrides[idx]];
    });

    try {
      await firestore().collection("users").doc(userId).update({
        subscription: { ...subscription, ...updateObj },
      });
      Alert.alert("✅ Success", "Overrides updated");
    } catch (err: any) {
      console.log(err);
      Alert.alert("❌ Error", err.message);
    }
  };

  if (loading) return <RNText style={{ padding: 20 }}>Loading...</RNText>;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#E9FCDA" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={80}
    >
      <ScrollView style={{ padding: 20, marginTop: 60 }}>
        {/* Heading */}
        <View style={{ justifyContent: "center", alignItems: "center", marginBottom: 30 }}>
          <RNText style={{ fontFamily: fonts.bold, fontSize: 32, color: "#195E4B" }}>
            Override Service Dates!
          </RNText>
          <RNText
            style={{
              fontFamily: fonts.bold,
              fontSize: 28,
              color: "#999999",
              lineHeight: 28,
              textAlign: "center",
            }}
          >
            Edit customers service dates.
          </RNText>
        </View>

        {overrides.map((o, idx) => (
          <View key={idx} style={styles.overrideCard}>
            <RNText style={styles.overrideTitle}>Override {idx + 1}</RNText>

            {/* Override checkbox */}
            <TouchableOpacity onPress={() => toggleOverride(idx)} style={styles.checkboxRow}>
              <Icon
                name={o.override ? "checkbox-marked" : "checkbox-blank-outline"}
                size={18}
                color="#195E4B"
                style={{ marginRight: 8 }}
              />
              <RNText style={styles.checkboxLabel}>Override</RNText>
            </TouchableOpacity>

            {/* Override Date */}
            <TouchableOpacity
              style={styles.row}
              onPress={() => setShowPicker({ index: idx, type: "date" })}
            >
              <RNText style={styles.rowLabel}>Override Date</RNText>
              <RNText style={styles.dateDisplay}>
                {o.date ? new Date(o.date * 1000).toISOString().slice(0, 10) : "Select date"}
              </RNText>
            </TouchableOpacity>

            {/* Original Date */}
            <TouchableOpacity
              style={styles.row}
              onPress={() => setShowPicker({ index: idx, type: "original" })}
            >
              <RNText style={styles.rowLabel}>Original Date</RNText>
              <RNText style={styles.dateDisplay}>
                {o.originalDate
                  ? new Date(o.originalDate * 1000).toISOString().slice(0, 10)
                  : "Select date"}
              </RNText>
            </TouchableOpacity>

            {/* Cancel Override */}
            <TouchableOpacity onPress={() => toggleCancel(idx)} style={styles.checkboxRow}>
              <Icon
                name={o.overrideCancel ? "checkbox-marked" : "checkbox-blank-outline"}
                size={18}
                color="#C00"
                style={{ marginRight: 8 }}
              />
              <RNText style={styles.checkboxLabel}>Cancel Service</RNText>
            </TouchableOpacity>

            {/* Override Icons */}
            <TouchableOpacity onPress={() => toggleIcons(idx)} style={styles.checkboxRow}>
              <Icon
                name={o.overrideIcons ? "checkbox-marked" : "checkbox-blank-outline"}
                size={18}
                color="#195E4B"
                style={{ marginRight: 8 }}
              />
              <RNText style={styles.checkboxLabel}>Override Icons</RNText>
            </TouchableOpacity>

            {o.overrideIcons === 1 && (
              <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 6 }}>
                {ICONS.map((icon) => (
                  <TouchableOpacity
                    key={icon.key}
                    onPress={() => toggleIconOption(idx, icon.key as keyof OverrideIcons)}
                    style={styles.iconOption}
                  >
                    <Icon
                      name={icon.icon}
                      size={18}
                      color={o.icons[icon.key as keyof OverrideIcons] ? "#195E4B" : "#999"}
                      style={{ marginRight: 4 }}
                    />
                    <RNText style={{ fontSize: 12 }}>{icon.label}</RNText>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        ))}

        <TouchableOpacity style={styles.saveButton} onPress={saveOverrides}>
          <RNText style={styles.saveButtonText}>Save Overrides</RNText>
        </TouchableOpacity>

        <View style={{ paddingBottom: 200 }} />
      </ScrollView>

      {/* Native Date Picker */}
      {showPicker.index !== null && (
        <View
            style={{
              position: "absolute",
              top: "40%",
              left: 0,
              right: 0,
              backgroundColor: "#fff",
              borderRadius: 10,
              elevation: 10, // Android shadow
              zIndex: 9999, // 👈 very high
            }}
          >
          <DateTimePicker
            value={
              new Date(
                (showPicker.type === "date"
                  ? overrides[showPicker.index!].date
                  : overrides[showPicker.index!].originalDate) * 1000 || Date.now()
              )
            }
            mode="date"
            display={Platform.OS === "ios" ? "inline" : "default"}
            onChange={(event, selectedDate) => {
              if (selectedDate) {
                if (showPicker.type === "date") setOverrideDate(showPicker.index!, selectedDate);
                else setOriginalDate(showPicker.index!, selectedDate);
              }
              setShowPicker({ index: null, type: null });
            }}
          />
        </View>
      )}

      <AdminBottomMenu />
      <BottomMenu />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  overrideCard: {
    borderRadius: 8,
    padding: 16,
    backgroundColor: "#eee",
    marginBottom: 20,
    elevation: 1,
  },
  overrideTitle: { fontFamily: fonts.bold, fontSize: 18, color: "#195E4B", marginBottom: 12 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    justifyContent: "space-between",
  },
  rowLabel: { fontFamily: fonts.medium, fontSize: 14, color: "#333" },
  dateDisplay: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: "#195E4B",
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
    borderRadius: 6,
  },
  checkboxRow: { flexDirection: "row", alignItems: "center", marginVertical: 4 },
  checkboxLabel: { fontFamily: fonts.medium, fontSize: 14, color: "#333" },
  iconOption: { flexDirection: "row", alignItems: "center", marginRight: 12, marginBottom: 6 },
  saveButton: {
    backgroundColor: "#195E4B",
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    alignItems: "center",
  },
  saveButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});

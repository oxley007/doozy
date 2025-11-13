// screens/AddUserServiceNotes.tsx
import React, { useState, useCallback } from "react";
import {
  View,
  Text as RNText,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import firestore from "@react-native-firebase/firestore";
import { useRoute } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import BottomMenu from "../Menus/BottomMenu";
import AdminBottomMenu from "../Menus/AdminBottomMenu";
import fonts from "../../assets/fonts/fonts";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const SERVICE_OPTIONS = [
  "Doo pickup",
  "Deodorising spray",
  "pH Test",
  "Nitrogen Test",
  "Phosphorus Test",
  "Potassium Test",
  "Soil Neutraliser",
  "Garden Lime",
  "Fertiliser",
  "Lawn Aeration",
  "Overseeding",
  "Repair bare spots",
];

const SERVICE_COLORS = [
  "#195E4B",
  "#2E8B57",
  "#1E90FF",
  "#FF8C00",
  "#FFD700",
  "#8A2BE2",
  "#FF1493",
  "#20B2AA",
  "#DC143C",
  "#6A5ACD",
  "#00CED1",
  "#FF4500",
];

// Memoized service button
const ServiceButton = React.memo(
  ({ service, color, active, onPress }: any) => (
    <TouchableOpacity
      style={[styles.serviceButton, { backgroundColor: color, borderColor: color, borderWidth: active ? 3 : 0 }]}
      onPress={onPress}
    >
      <View style={styles.serviceButtonContent}>
        <Icon name="plus" size={18} color="#fff" style={styles.serviceIcon} />
        <RNText style={styles.serviceText}>{service}</RNText>
      </View>
    </TouchableOpacity>
  )
);

export default function AddUserServiceNotes({ navigation }: any) {
  const route = useRoute<any>();
  const { userId } = route.params;

  const user = useSelector((state: RootState) => state.user);

  const [notes, setNotes] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [adminNotes, setAdminNotes] = useState("");
  const [timeAtHouse, setTimeAtHouse] = useState("");
  const [timeLeavingHouse, setTimeLeavingHouse] = useState("");

  const toggleService = useCallback(
    (service: string) => {
      setSelected((prev) =>
        prev.includes(service) ? prev.filter((s) => s !== service) : [...prev, service]
      );
    },
    [setSelected]
  );

  const saveNotes = async () => {
    try {
      await firestore()
        .collection("users")
        .doc(userId)
        .collection("serviceNotes")
        .add({
          date: firestore.FieldValue.serverTimestamp(),
          addedBy: user?.name || "Unknown",
          notes,
          services: selected,
          adminNotes,
          timeAtHouse,
          timeLeavingHouse,
        });
      Alert.alert("✅ Success", "Service notes saved");
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
    >
      <ScrollView style={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <RNText style={styles.title}>Add Service Notes</RNText>

        <TextInput
          style={styles.notesInput}
          placeholder="Write notes about the service..."
          multiline
          value={notes}
          onChangeText={setNotes}
        />

        <RNText style={styles.sectionTitle}>What was serviced?</RNText>

        {SERVICE_OPTIONS.map((service, index) => {
          const color = SERVICE_COLORS[index % SERVICE_COLORS.length];
          const active = selected.includes(service);
          return (
            <ServiceButton
              key={service}
              service={service}
              color={color}
              active={active}
              onPress={() => toggleService(service)}
            />
          );
        })}

        {user.isAdmin && (
          <>
            <RNText style={styles.sectionTitle}>Admin Notes</RNText>
            <TextInput
              style={styles.notesInput}
              placeholder="Private admin notes..."
              multiline
              value={adminNotes}
              onChangeText={setAdminNotes}
            />

            <RNText style={styles.sectionTitle}>Time at House</RNText>
            <TextInput
              style={styles.notesInput}
              placeholder="e.g. 10:15am"
              value={timeAtHouse}
              onChangeText={setTimeAtHouse}
            />

            <RNText style={styles.sectionTitle}>Time Leaving House</RNText>
            <TextInput
              style={styles.notesInput}
              placeholder="e.g. 10:40am"
              value={timeLeavingHouse}
              onChangeText={setTimeLeavingHouse}
            />
          </>
        )}

        <TouchableOpacity style={styles.saveButton} onPress={saveNotes}>
          <RNText style={styles.saveButtonText}>Save Notes</RNText>
        </TouchableOpacity>

        <View style={{ paddingBottom: 350 }} />
      </ScrollView>

      <AdminBottomMenu />
      <BottomMenu />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    padding: 20,
    paddingTop: 100,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 28,
    color: "#195E4B",
    marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: fonts.bold,
    fontSize: 20,
    marginVertical: 12,
    color: "#195E4B",
  },
  notesInput: {
    borderWidth: 1,
    borderColor: "#aaa",
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#eee",
    minHeight: 100,
    textAlignVertical: "top",
  },
  serviceButton: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  serviceButtonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  serviceIcon: {
    marginRight: 8,
  },
  serviceText: {
    color: "#fff",
    fontFamily: fonts.medium,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: "#195E4B",
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

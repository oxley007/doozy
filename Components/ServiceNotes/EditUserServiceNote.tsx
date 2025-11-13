// screens/EditUserServiceNote.tsx
import React, { useEffect, useState, useCallback } from "react";
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
import BottomMenu from "../Menus/BottomMenu";
import AdminBottomMenu from "../Menus/AdminBottomMenu";
import fonts from "../../assets/fonts/fonts";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";

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
      style={[styles.serviceButton, { backgroundColor: color, borderColor: '#999', borderWidth: active ? 3 : 0 }]}
      onPress={onPress}
    >
      <View style={styles.serviceButtonContent}>
        <Icon name="plus" size={18} color="#fff" style={styles.serviceIcon} />
        <RNText style={styles.serviceText}>{service}</RNText>
      </View>
    </TouchableOpacity>
  )
);

export default function EditUserServiceNote({ navigation }: any) {
  const route = useRoute<any>();
  const { userId, noteId } = route.params;
  const user = useSelector((state: RootState) => state.user);

  const [notes, setNotes] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [adminNotes, setAdminNotes] = useState("");
  const [timeAtHouse, setTimeAtHouse] = useState("");
  const [timeLeavingHouse, setTimeLeavingHouse] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId || !noteId) return;
    const docRef = firestore()
      .collection("users")
      .doc(userId)
      .collection("serviceNotes")
      .doc(noteId);

    docRef
      .get()
      .then((doc) => {
        if (doc.exists) {
          const data = doc.data();
          setNotes(data?.notes || "");
          setSelected(data?.services || []);
          setAdminNotes(data?.adminNotes || "");
          setTimeAtHouse(data?.timeAtHouse || "");
          setTimeLeavingHouse(data?.timeLeavingHouse || "");
        } else {
          Alert.alert("❌ Error", "Note not found");
          navigation.navigate("AdminHome");
        }
      })
      .catch((err) => {
        console.log(err);
        Alert.alert("❌ Error", "Failed to load note");
        navigation.navigate("AdminHome");
      })
      .finally(() => setLoading(false));
  }, [userId, noteId]);

  const toggleService = useCallback(
    (service: string) => {
      setSelected((prev) =>
        prev.includes(service) ? prev.filter((s) => s !== service) : [...prev, service]
      );
    },
    [setSelected]
  );

  const saveNote = async () => {
    if (!user.isAdmin) return; // safety check
    try {
      await firestore()
        .collection("users")
        .doc(userId)
        .collection("serviceNotes")
        .doc(noteId)
        .update({
          notes,
          services: selected,
          adminNotes,
          timeAtHouse,
          timeLeavingHouse,
          lastEdited: firestore.FieldValue.serverTimestamp(),
        });
      Alert.alert("✅ Success", "Service note updated");
      navigation.navigate("AdminHome");
    } catch (err: any) {
      Alert.alert("❌ Error", err.message);
      console.log(err.message);
    }
  };

  if (loading) return <RNText style={{ padding: 20 }}>Loading...</RNText>;

  return (
    <View style={{ flex: 1, backgroundColor: "#E9FCDA" }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={80}
      >
        <ScrollView style={styles.scrollContainer} keyboardShouldPersistTaps="handled">
          <RNText style={styles.title}>Edit Service Note</RNText>

          <TextInput
            style={styles.notesInput}
            placeholder="Edit notes about the service..."
            multiline
            value={notes}
            onChangeText={setNotes}
          />

          <RNText style={styles.sectionLabel}>What was serviced?</RNText>

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
              <RNText style={styles.sectionLabel}>Admin Notes</RNText>
              <TextInput
                style={styles.notesInput}
                placeholder="Private admin notes..."
                multiline
                value={adminNotes}
                onChangeText={setAdminNotes}
              />

              <RNText style={styles.sectionLabel}>Time at House</RNText>
              <TextInput
                style={styles.notesInput}
                placeholder="e.g. 10:15am"
                value={timeAtHouse}
                onChangeText={setTimeAtHouse}
              />

              <RNText style={styles.sectionLabel}>Time Leaving House</RNText>
              <TextInput
                style={styles.notesInput}
                placeholder="e.g. 10:40am"
                value={timeLeavingHouse}
                onChangeText={setTimeLeavingHouse}
              />
            </>
          )}

          <TouchableOpacity style={styles.saveButton} onPress={saveNote}>
            <RNText style={styles.saveButtonText}>Save Changes</RNText>
          </TouchableOpacity>

          <View style={{ paddingBottom: 350 }} />
        </ScrollView>

        <AdminBottomMenu />
        <BottomMenu />
      </KeyboardAvoidingView>
    </View>
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
  sectionLabel: {
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
    minHeight: 60,
    maxHeight: 200,
    textAlignVertical: "top",
    marginBottom: 12,
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
  saveButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});

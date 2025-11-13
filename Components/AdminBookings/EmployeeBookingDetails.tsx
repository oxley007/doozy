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
import AvailabilityEditor from "./AvailabilityEditor";

export default function EmployeeBookingDetails() {
  const route = useRoute<any>();

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
            Booking Details!
          </RNText>
          <RNText
            style={{
              fontFamily: fonts.bold,
              fontSize: 24,
              color: "#999999",
              lineHeight: 24,
              textAlign: "center",
              paddingTop: 10,
            }}
          >
            Add or Edit your booking availability.
          </RNText>
        </View>
        <AvailabilityEditor />
        </ScrollView>
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

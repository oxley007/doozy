import React, { useState } from "react";
import {
  View,
  Text as RNText,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import firestore from "@react-native-firebase/firestore";
import EmailButton from "../DoozyAccount/EmailButton";
import fonts from "../../assets/fonts/fonts.js";
import { useNavigation } from "@react-navigation/native";

type UserType = {
  uid: string;
  name?: string;
  phone?: string;
  email?: string;
  dogBreeds?: string;
  numberOfDogs?: string;
  address?: { formattedAddress?: string };
  extraDetails?: {
    dogNames?: string;
    specialInstruct?: string;
    homeNotes?: string;
    accessYard?: string;
  };
  subscription?: { plan?: string; status?: string };
  [key: string]: any;
};

type Props = {
  user: UserType;
  onUserUpdate?: (updatedUser: Partial<UserType>) => void;
};

export default function CustomerDetailsCardAdmin({ user, onUserUpdate }: Props) {
  const navigation = useNavigation();
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState("");

  const getFieldValue = (fieldKey: string): string => {
    try {
      let value: any;

      if (fieldKey.startsWith("address.")) {
        value = user.address?.[fieldKey.split(".")[1]];
      } else if (fieldKey.startsWith("extraDetails.")) {
        value = user.extraDetails?.[fieldKey.split(".")[1]];
      } else if (fieldKey.startsWith("subscription.")) {
        value = user.subscription?.[fieldKey.split(".")[1]];
      } else {
        value = user[fieldKey];
      }

      // Handle Firebase Timestamp
      if (value && typeof value === "object" && "toDate" in value) {
        value = (value as any).toDate(); // converts to JS Date
      }

      // Only format as date if it's a Date object
      if (value instanceof Date) {
        return value.toLocaleDateString("en-NZ", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
      }

      return typeof value === "string" || typeof value === "number" ? String(value) : "";
    } catch {
      return "";
    }
  };

  const handleSave = async (fieldKey: string) => {
    if (!user?.uid) return;

    let valueToSave: any = tempValue;

    // Convert planStart or trialUntil to number
    if (fieldKey === "subscription.planStart" || fieldKey === "subscription.trialUntil") {
      valueToSave = Number(tempValue); // make sure it's a number
      if (isNaN(valueToSave)) {
        console.warn("Invalid number for timestamp:", tempValue);
        return;
      }
    }

    let updateObj: Partial<UserType> = { [fieldKey]: valueToSave };
    let mergedUser: UserType = { ...user };

    if (fieldKey.startsWith("address.")) {
      const key = fieldKey.split(".")[1];
      updateObj = { address: { ...user.address, [key]: valueToSave } };
      mergedUser = { ...user, address: { ...user.address, [key]: valueToSave } };
    } else if (fieldKey.startsWith("extraDetails.")) {
      const key = fieldKey.split(".")[1];
      updateObj = { extraDetails: { ...user.extraDetails, [key]: valueToSave } };
      mergedUser = { ...user, extraDetails: { ...user.extraDetails, [key]: valueToSave } };
    } else if (fieldKey.startsWith("subscription.")) {
      const key = fieldKey.split(".")[1];
      updateObj = { subscription: { ...user.subscription, [key]: valueToSave } };
      mergedUser = { ...user, subscription: { ...user.subscription, [key]: valueToSave } };
    } else {
      mergedUser = { ...user, [fieldKey]: valueToSave };
    }

    try {
      await firestore().collection("users").doc(user.uid).update(updateObj);
      if (onUserUpdate) onUserUpdate(mergedUser);
      setEditingField(null);
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const renderRow = (
    label: string,
    fieldKey: string,
    readOnly = false,
    formatAsDate = false
  ) => {
    // Get raw value from user object
    let rawValue: any;
    if (fieldKey.startsWith("address.")) {
      rawValue = user.address?.[fieldKey.split(".")[1]];
    } else if (fieldKey.startsWith("extraDetails.")) {
      rawValue = user.extraDetails?.[fieldKey.split(".")[1]];
    } else if (fieldKey.startsWith("subscription.")) {
      rawValue = user.subscription?.[fieldKey.split(".")[1]];
    } else {
      rawValue = user[fieldKey];
    }

    // Determine display value
    let displayValue: string;
    if (readOnly && formatAsDate && rawValue !== undefined && rawValue !== null) {
      if (typeof rawValue === "object" && "toDate" in rawValue) {
        // Firebase Timestamp
        displayValue = rawValue.toDate().toLocaleDateString("en-NZ", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
      } else if (typeof rawValue === "number") {
        const date =
          rawValue < 9999999999 ? new Date(rawValue * 1000) : new Date(rawValue);
        displayValue = date.toLocaleDateString("en-NZ", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
      } else {
        displayValue = String(rawValue);
      }
    } else {
      displayValue = rawValue !== undefined && rawValue !== null ? String(rawValue) : "";
    }

    const isEditing = editingField === fieldKey;

    return (
      <View style={styles.row} key={fieldKey + (readOnly ? "-readonly" : "-edit")}>
        <RNText style={styles.title}>{label}</RNText>

        {isEditing && !readOnly ? (
          <View style={styles.editRow}>
            <TextInput
              style={styles.input}
              value={tempValue} // raw numeric value
              onChangeText={setTempValue}
              autoFocus
              blurOnSubmit
              keyboardType="numeric"
            />
            <TouchableOpacity onPress={() => handleSave(fieldKey)}>
              <Icon name="check" size={22} color="#195E4B" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.displayRow}>
            <RNText style={styles.info}>{displayValue || "-"}</RNText>
            {!readOnly && (
              <TouchableOpacity
                onPress={() => {
                  setEditingField(fieldKey);
                  setTempValue(
                    rawValue !== undefined && rawValue !== null ? String(rawValue) : ""
                  );
                }}
              >
                <Icon name="pencil" size={20} color="#195E4B" />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    >

        <View style={styles.card}>
          <View style={{ paddingVertical: 10 }}>
            {renderRow("Name", "name")}
            {renderRow("Phone", "phone")}
            {renderRow("Email", "email")}
            {renderRow("Dog Breeds", "dogBreeds")}
            {renderRow("Number of Dogs", "numberOfDogs")}
            {renderRow("Current Address", "address.formattedAddress")}
            {renderRow("Yard Access", "extraDetails.accessYard")}
            {renderRow("Dog Name(s)", "extraDetails.dogNames")}
            {renderRow("Dog Allergies / Notes", "extraDetails.specialInstruct")}
            {renderRow("Home Access Notes", "extraDetails.homeNotes")}
            {renderRow("Status", "subscription.status")}
            {renderRow("Trial Until", "subscription.trialUntil", true, true)}
            {/* read-only: User ID */}
            {renderRow("User ID", "uid", true)}

            {/* read-only: Current Plan */}
            {renderRow("Current Plan", "subscription.plan", true)}
            {renderRow("Plan Start Date", "subscription.planStart", true, true)}
            {renderRow("Edit Plan Start Date", "subscription.planStart", false)}

          </View>
        </View>

    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 8,
    padding: 15,
    backgroundColor: "#fff",
    marginBottom: 30,
    elevation: 1,
  },
  row: { marginBottom: 12 },
  title: { fontFamily: fonts.bold, fontSize: 18, color: "#195E4B" },
  info: { fontFamily: fonts.Medium, fontSize: 16, color: "#333" },
  displayRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  editRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  input: {
    borderBottomWidth: 1,
    borderColor: "#195E4B",
    flex: 1,
    marginRight: 8,
    fontSize: 16,
    paddingVertical: 4,
  },
});

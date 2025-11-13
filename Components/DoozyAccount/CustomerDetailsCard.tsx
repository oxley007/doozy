import React, { useState } from "react";
import { View, Text as RNText, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { styled } from "nativewind";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../store/store";
import { setUserDetails } from "../../store/store";
import firestore from "@react-native-firebase/firestore"; // ✅ RNFirebase
import EmailButton from './EmailButton';
import fonts from '../../assets/fonts/fonts.js';

const StyledView = styled(View);

export default function CustomerDetailsCard() {
  const user = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();

  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState("");

  const editableFields = ["name", "dogBreeds", "numberOfDogs", "dogNames"];

  const handleSave = async (fieldKey: keyof typeof user) => {
    if (!user?.uid) return;

    let updateObj: Partial<typeof user> = { [fieldKey]: tempValue };

    // handle nested address
    if (fieldKey === "address") {
      updateObj = {
        address: { ...user.address, formattedAddress: tempValue },
      };
    }

    // handle nested extraDetails
    if (["dogNames", "specialInstruct", "homeNotes", "accessYard"].includes(fieldKey)) {
      updateObj = {
        extraDetails: { ...user.extraDetails, [fieldKey]: tempValue },
      };
    }

    try {
      await firestore().collection('users').doc(user.uid).update(updateObj); // ✅ RNFirebase
      dispatch(setUserDetails(updateObj));
      setEditingField(null);
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const renderRow = (label: string, value: string, fieldKey: string) => {
    const isEditing = editingField === fieldKey;
    const isEditable = editableFields.includes(fieldKey);

    return (
      <View style={styles.row} key={fieldKey}>
        <RNText style={styles.title}>{label}</RNText>
        {isEditing ? (
          <View style={styles.editRow}>
            <TextInput
              style={styles.input}
              value={tempValue}
              onChangeText={setTempValue}
              autoFocus
            />
            <TouchableOpacity onPress={() => handleSave(fieldKey as keyof typeof user)}>
              <Icon name="check" size={22} color="#195E4B" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.displayRow}>
            <RNText style={styles.info}>{value || "-"}</RNText>
            {isEditable && (
              <TouchableOpacity
                onPress={() => {
                  setEditingField(fieldKey);
                  setTempValue(value || "");
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
    <StyledView style={styles.card} className="flex-1 p-4 bg-white">
      <View style={{ paddingVertical: 20 }}>
        {renderRow("Name", user?.name, "name")}
        {renderRow("Phone*", user?.phone, "phone")}
        {renderRow("Email*", user?.email, "email")}
        {renderRow("Dog Breeds", user?.dogBreeds, "dogBreeds")}
        {renderRow("Number of Dogs", user?.numberOfDogs, "numberOfDogs")}
        {renderRow("Current Address*", user?.address?.formattedAddress, "address")}
        {renderRow("Yard Access*", user?.extraDetails?.accessYard, "accessYard")}
        {renderRow("Dog Name(s)", user?.extraDetails?.dogNames, "dogNames")}
        {renderRow("Dog Allergies / Notes*", user?.extraDetails?.specialInstruct, "specialInstruct")}
        {renderRow("Home Access Notes*", user?.extraDetails?.homeNotes, "homeNotes")}
        {renderRow("User ID", user?.uid || "-", "uid")}
        {renderRow("Current Plan*", user?.subscription?.plan || "-", "currentPlan")}
      </View>

      <View style={{ justifyContent: 'center', alignItems: 'center', marginBottom: 40 }}>
        <RNText style={{ fontFamily: fonts.Medium, fontSize: 15, color: '#999999', lineHeight: 14 }}>
          * Not all details can be updated in the app. For any information marked with * please press 'Email Update Request' so we can update our internal records.
        </RNText>
      </View>

      <EmailButton
        email="andrew@4dot6digital.com"
        subject="Update My Details"
        label="Email Update Request"
        body={`Hi Doozy Team,

I (User ID: ${user.uid}) would like to update my details as follows:

[Insert details here]

Thanks,
[Your Name]`}
      />
    </StyledView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 5,
    elevation: 0,
    shadowColor: "transparent",
    padding: 20,
    marginBottom: 40,
    backgroundColor: "#eeeeee",
  },
  row: {
    marginBottom: 12,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 20,
    color: "#195E4B",
  },
  info: {
    fontFamily: fonts.Medium,
    fontSize: 18,
    color: "#999999",
  },
  displayRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  editRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    borderBottomWidth: 1,
    borderColor: "#195E4B",
    flex: 1,
    marginRight: 8,
    fontSize: 18,
    paddingVertical: 2,
  },
});

import React, { useEffect, useState } from "react";
import { View, Text as RNText, Image, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import fonts from "../../assets/fonts/fonts.js";
import firestore from "@react-native-firebase/firestore";

export default function MeetEmployeeScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { employeeId } = route.params || {};

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!employeeId) return;

    const docRef = firestore().collection("settings").doc(`bookingRules_${employeeId}`);

    docRef.get().then((doc) => {
      if (doc.exists) {
        setEmployee(doc.data());
      }
      setLoading(false);
    });
  }, [employeeId]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#195E4B" />
        <RNText style={{ marginTop: 10 }}>Loading profile...</RNText>
      </View>
    );
  }

  if (!employee) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <RNText>No employee profile found.</RNText>
      </View>
    );
  }

  const profileImgSrc = employee.profilePic
    ? { uri: employee.profilePic }
    : require("../../assets/images/default.png");

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Back button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <MaterialIcons name="arrow-back" size={28} color="#195E4B" />
        <RNText style={styles.backText}>Back</RNText>
      </TouchableOpacity>

      <Image source={profileImgSrc} style={styles.avatar} />

      <RNText style={styles.heading}>Meet {employee.name}!</RNText>

      {employee.favouriteBreeds && (
        <RNText style={styles.subHeading}>
          Favourite Dog Breeds: {employee.favouriteBreeds}
        </RNText>
      )}

      {employee.favouritePlace && (
        <RNText style={styles.subHeading}>
          Favourite place to walk and meet dogs: {employee.favouritePlace}
        </RNText>
      )}

      <RNText style={styles.bio}>{employee.description || "No description available."}</RNText>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: "center",
    paddingTop: 60,
    backgroundColor: "#E9FCDA",
    minHeight: "100%",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginBottom: 20,
  },
  backText: {
    fontFamily: fonts.medium,
    fontSize: 16,
    color: "#195E4B",
    marginLeft: 5,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
  },
  heading: {
    fontFamily: fonts.bold,
    fontSize: 28,
    marginBottom: 10,
    color: "#195E4B",
    textAlign: "center",
  },
  subHeading: {
    fontFamily: fonts.medium,
    fontSize: 16,
    marginBottom: 5,
    color: "#555",
    textAlign: "center",
  },
  bio: {
    fontFamily: fonts.medium,
    fontSize: 14,
    lineHeight: 20,
    color: "#333",
    marginTop: 15,
    textAlign: "center",
  },
});

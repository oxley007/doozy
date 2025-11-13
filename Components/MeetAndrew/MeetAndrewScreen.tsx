import React from "react";
import { View, Text as RNText, Image, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import fonts from "../../assets/fonts/fonts.js";

export default function MeetAndrewScreen() {
  const navigation = useNavigation<any>();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Back button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <MaterialIcons name="arrow-back" size={28} color="#195E4B" />
        <RNText style={styles.backText}>Back</RNText>
      </TouchableOpacity>

      <Image
        source={require("../../assets/images/andrew.jpg")}
        style={styles.avatar}
      />
      <RNText style={styles.heading}>Meet Andrew!</RNText>
      <RNText style={styles.subHeading}>
        Favourite Dog Breeds: Labrador, Staffies, Pugs
      </RNText>
      <RNText style={styles.subHeading}>
        Favourite place to walk and meet dogs: Cornwallis Beach
      </RNText>
      <RNText style={styles.bio}>
        Andrew is a dog-crazy, people-person who has lived with dogs his whole life, ranging from Australian Terriers to Labradors. His current 'Best Mate' is a 5-year-old Labrador called Murphy.
        Andrew has experience in lawn care and is happy to pass on any advice you might want, from preventing lawn burn from dog urine to keeping your grass green in summer. He is always friendly and sure to fall in love with your dog!
      </RNText>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, alignItems: "center", paddingTop: 60,
  backgroundColor: '#E9FCDA', minHeight: '100%' },
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
    marginLeft: 5
  },
  avatar: { width: 120, height: 120, borderRadius: 60, marginBottom: 20 },
  heading: { fontFamily: fonts.bold, fontSize: 28, marginBottom: 10, color: "#195E4B", textAlign: "center" },
  subHeading: { fontFamily: fonts.medium, fontSize: 16, marginBottom: 5, color: "#555", textAlign: "center" },
  bio: { fontFamily: fonts.medium, fontSize: 14, lineHeight: 20, color: "#333", marginTop: 15, textAlign: "center" },
});

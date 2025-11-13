import React from "react";
import { View, Text as RNText, TouchableOpacity, StyleSheet } from "react-native";
import fonts from "../../assets/fonts/fonts";
import { useNavigation } from "@react-navigation/native";

export default function LawnSaverCard() {
  const navigation = useNavigation<any>();

  const handlePress = () => {
    navigation.navigate("LawnSaverRoutine"); // make sure this screen is registered in your navigator
  };

  return (
    <View style={styles.card}>
      <RNText style={styles.title}>Watering to Protect Your Lawn from Dog Wee</RNText>
      <RNText style={styles.paragraph}>
        Dog urine can burn your grass, especially in the morning. Learn a simple 2-step routine to keep your lawn green and healthy every day.
      </RNText>
      <TouchableOpacity style={styles.button} onPress={handlePress}>
        <RNText style={styles.buttonText}>Read More</RNText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    //padding: 20,
    borderRadius: 12,
    marginVertical: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 20,
    color: "#195E4B",
    marginBottom: 10,
  },
  paragraph: {
    fontFamily: fonts.regular,
    fontSize: 16,
    color: "#333",
    marginBottom: 16,
    lineHeight: 22,
  },
  button: {
    backgroundColor: "#195E4B",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontFamily: fonts.medium,
    fontSize: 16,
  },
});

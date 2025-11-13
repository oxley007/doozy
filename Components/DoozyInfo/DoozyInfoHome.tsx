import React, { useEffect } from "react";
import { View, Text as RNText, ScrollView, StyleSheet, Image } from "react-native";
import { Button } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { styled } from "nativewind";
import { RootState } from "../../store/store";
import auth from "@react-native-firebase/auth"; // ✅ correct import for RNFirebase

import BottomMenu from "../Menus/BottomMenu";
import DisplayInfoDetails from "./DisplayInfoDetails";
import DisplayCancelDetails from "./DisplayCancelDetails";
import DisplayCancelService from "./DisplayCancelService";
import DeleteAccount from './DeleteAccount';
import FAQAccordion from "../Plan/FAQAccordion";
import WhatsIncludeAndWhy from "../Plan/WhatsIncludeAndWhy";
import { useLogout } from "../DoozyHome/useLogout";
import fonts from "../../assets/fonts/fonts.js";

const StyledView = styled(View);

export default function DoozyInfoHome() {
  const navigation = useNavigation<any>();
  const user = useSelector((state: RootState) => state.user);
  const logout = useLogout();

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        console.log("User is logged in:", firebaseUser.uid);
      } else {
        console.log("User not logged in");
      }
    });

    return unsubscribe; // ✅ cleanup
  }, []);

  const backToCheckAddress = () => navigation.navigate("CheckAddressHome");
  const backConfirmedDetails = () => navigation.navigate("DetailsConfirmed");

  const seeReduxText = () => {
    console.log("Full Redux state:", user);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#E9FCDA', minHeight: '100%' }}>
      <ScrollView style={{ padding: 20 }}>
        <View style={{ justifyContent: "center", alignItems: "center" }}>
          <Image
            source={require("../../assets/images/Doozy_dog_logo.png")}
            style={{ width: 325, height: 325 }}
            resizeMode="contain"
          />
        </View>

        <View
          style={{ justifyContent: "center", alignItems: "center", marginBottom: 60 }}
        >
          <RNText
            style={{
              fontFamily: fonts.bold,
              fontSize: 32,
              color: "#195E4B",
            }}
          >
            Doozy Info.
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
            Contact and Support.
          </RNText>
        </View>

        <DisplayInfoDetails />
        <DisplayCancelService />
        <DisplayCancelDetails />
        <FAQAccordion />
        <WhatsIncludeAndWhy />
        <RNText
          style={{ color: "blue" }}
          onPress={() => navigation.navigate("Terms", { from: "DoozyInfoHome" })}
        >
          Terms & Conditions
        </RNText>

        <StyledView style={{ borderRadius: 5, padding: 20, marginBottom: 40, backgroundColor: "#eeeeee", marginTop: 40 }}>
          <DeleteAccount />
        </StyledView>

        <View style={{ marginBottom: 120 }} />
      </ScrollView>

      <BottomMenu />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  regular: {
    fontFamily: "InterRegular",
    fontSize: 18,
    marginBottom: 12,
  },
  medium: {
    fontFamily: "InterMedium",
    fontSize: 18,
    marginBottom: 12,
  },
  bold: {
    fontFamily: "InterBold",
    fontSize: 18,
  },
});

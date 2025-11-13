import React, { useState } from "react";
import { View, Text as RNText, Image, TouchableOpacity } from "react-native";
import { List, Card, Button } from "react-native-paper";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import fonts from "../../assets/fonts/fonts";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";

export default function OneOffDogWalkAccordion() {
  const navigation = useNavigation<any>();
    const [expanded, setExpanded] = useState(false);

    // Get user info from Redux
    const user = useSelector((state: RootState) => state.user);

    const handleBookNow = () => {
        if (user.address?.formattedAddress) {
          // User already has an address, skip to BookingSignUpHome
          navigation.navigate("BookingSignUpHome");
        } else {
          // No address yet, go to BookingAddressHome
          navigation.navigate("BookingAddressHome");
        }
      };

  return (
    <View style={{ marginVertical: 10 }}>
      <TouchableOpacity
        onPress={() => setExpanded(!expanded)}
        style={{
          backgroundColor: expanded ? "#12802B" : "#195E4B",
          borderRadius: 12,
          height: 140,
          justifyContent: "center",
          alignItems: "center",
          padding: 10,
        }}
      >
        <MaterialIcons
          name="directions-walk"
          size={48}
          color="#fff"
          style={{ marginBottom: 8 }}
        />
        <RNText
          style={{
            fontFamily: fonts.bold,
            fontSize: 22,
            color: "#fff",
            textAlign: "center",
          }}
        >
          One-Off Dog Walk
        </RNText>

        <MaterialIcons
          name={expanded ? "expand-less" : "expand-more"}
          size={36}
          color="#fff"
          style={{ position: "absolute", top: 10, right: 10 }}
        />
      </TouchableOpacity>

      {expanded && (
        <View
          style={{
            borderRadius: 5,
            elevation: 0,
            shadowColor: "transparent",
            padding: 20,
            marginBottom: 40,
            backgroundColor: "#eeeeee",
          }}
        >
          <View
            style={{
              position: "relative",
              backgroundColor: "#154D7C",
              borderTopLeftRadius: 3,
              borderBottomRightRadius: 3,
              alignSelf: "flex-start",
              padding: 10,
              marginBottom: 10,
            }}
          >
            <RNText style={{ fontWeight: "bold", color: "#fff", fontSize: 12 }}>
              ONE-OFF SERVICE — 30 MIN WALK
            </RNText>
          </View>

          <RNText
            style={{
              fontFamily: fonts.bold,
              fontSize: 28,
              color: "#195E4B",
              marginBottom: 10,
            }}
          >
            One-Time Dog Walk
          </RNText>

          <RNText
            style={{
              fontFamily: fonts.medium,
              fontSize: 18,
              color: "#777",
              marginBottom: 20,
              lineHeight: 26,
            }}
          >
            Need your pup walked while you’re busy or away for the day?
            We’ll take your furry friend for a refreshing 30-minute stroll —
            a perfect mix of exercise, sniffing, and tail-wagging happiness.
          </RNText>

          <RNText
            style={{
              fontFamily: fonts.bold,
              fontSize: 28,
              color: "#195E4B",
              marginBottom: 15,
            }}
          >
            What’s included
          </RNText>

          {[
            "30-minute on-leash walk around your local neighbourhood",
            "Pick-up and drop-off from your home included",
            "Fresh water break and poop pickup during the walk",
            "Real-time updates via the Doozy app",
            "Friendly, dog-loving local service — guaranteed smiles",
          ].map((feature, index) => (
            <View
              key={index}
              style={{ flexDirection: "row", alignItems: "flex-start", marginBottom: 6 }}
            >
              <MaterialIcons
                name="check"
                size={18}
                color="#195E4B"
                style={{ marginRight: 6, marginTop: 2 }}
              />
              <RNText
                style={{
                  fontFamily: fonts.medium,
                  fontSize: 15,
                  color: "#555",
                  flexShrink: 1,
                }}
              >
                {feature}
              </RNText>
            </View>
          ))}

          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 25,
              marginBottom: 10,
            }}
            onPress={() => navigation.navigate("MeetAndrewScreen")}
          >
            <Image
              source={require("../../assets/images/andrew.jpg")}
              style={{ width: 50, height: 50, borderRadius: 25, marginRight: 10 }}
            />
            <RNText
              style={{
                flex: 1,
                flexShrink: 1,
                fontFamily: fonts.medium,
                fontSize: 15,
                color: "#195E4B",
              }}
            >
              You’ll be walked by{" "}
              <RNText style={{ fontWeight: "bold" }}>Andrew</RNText> — read more in{" "}
              <RNText style={{ textDecorationLine: "underline" }}>his profile</RNText>.
            </RNText>
          </TouchableOpacity>

          <Card.Actions>
            <Button
              mode="contained"
              buttonColor="#195E4B"
              textColor="#FFFFFF"
              style={{ width: "100%", borderRadius: 5, marginTop: 20 }}
              labelStyle={{ fontFamily: fonts.medium, fontSize: 16 }}
              onPress={handleBookNow}
            >
              Book a Walk
            </Button>
          </Card.Actions>
        </View>
      )}
    </View>
  );
}

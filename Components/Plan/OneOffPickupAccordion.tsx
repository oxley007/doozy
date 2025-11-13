import React, { useState } from "react";
import { View, Text as RNText, Image, TouchableOpacity } from "react-native";
import { Card, Button } from "react-native-paper";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import fonts from "../../assets/fonts/fonts";

export default function OneOffPickupAccordion() {
  const navigation = useNavigation<any>();
  const [expanded, setExpanded] = useState(false);

  const handleBookNow = () => {
    navigation.navigate("BookingAddressHome");
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
          name="cleaning-services"
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
          Doo Pickup — One-Off
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
            elevation: 0, // Android
            shadowColor: "transparent", // iOS
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0,
            shadowRadius: 0,
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
              ONE-OFF CLEAN — SCOOP ONLY
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
            One-Time Doo Pickup
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
            Perfect for when you just need a single clean-up — no commitments, no fuss.
            We’ll scoop every bit of “doo” and leave your yard spotless and fresh.
          </RNText>

          <RNText
            style={{
              fontFamily: fonts.bold,
              fontSize: 28,
              color: "#195E4B",
              marginBottom: 15,
            }}
          >
            Get an instant quote!
          </RNText>

          {[
            "Full backyard poop pickup — all areas included",
            "No contract — one-time payment only",
            "We can service even if you’re not home (dog-safe access)",
            "Friendly local service — satisfaction guaranteed",
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

          <Card.Actions>
            <Button
              mode="contained"
              buttonColor="#195E4B"
              textColor="#FFFFFF"
              style={{ width: "100%", borderRadius: 5, marginTop: 20 }}
              labelStyle={{ fontFamily: fonts.medium, fontSize: 16 }}
              onPress={handleBookNow}
            >
              Get a Quote
            </Button>
          </Card.Actions>
        </View>
      )}
    </View>
  );
}

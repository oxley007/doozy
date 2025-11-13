import React, { useState } from "react";
import { View, Text as RNText, ScrollView, TouchableOpacity, Image } from "react-native";
import { Button, Card, List } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { styled } from "nativewind";
import { useDispatch } from "react-redux";
import { setSelectedPlan } from "../../store/store";
import LawnInfo from "./LawnInfo";
import fonts from "../../assets/fonts/fonts.js";

const StyledView = styled(View);

export default function PlanScreen() {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();

  const [expanded, setExpanded] = useState<string | null>(null);

  const toggleExpand = (area: string) => {
    setExpanded(expanded === area ? null : area);
  };

  const handleSelectPlan = (plan: string) => {
    dispatch(setSelectedPlan(plan));
    navigation.navigate("SignUpScreen");
  };

  const planGroups = {
    "Premium Doo Pickup": [
      "Twice a week Premium",
      "Once a week Premium Friday",
      "Once a week Premium",
    ],
    "Artificial Grass Doo & Clean": [
      "Twice a week Artificial Grass",
      "Once a week Artificial Grass",
    ],
    "Standard Doo Pickup": ["Twice a week", "Once a week Friday", "Once a week"],
  };

  const planDetails = [
    {
      title: "Twice a week Premium",
      desc: "We scoop, freshen and protect your lawn — Mondays & Fridays.",
      priceVisit: "$16.99 per visit",
      priceWeek: "$33.98/week, billed monthly",
      features: [
        "2 'doo' pickups per week with pet-safedeodorising spray (Mon & Fri)",
        "$33.98/week, billed monthly",
        "Keep your lawn fresh with our weekly pet-friendly deodorizing spray.",
        "Monthly pet-safe soil neutralizer treatment to improve soil structure and neutralize salts from dog urine, promoting soil health and keeping your grass fresh.",
        "No upfront payment!",
        "Billed after your first month — risk-free!",
        "Then automatically billed each month — no manual bank transfers!",

      ],
      featuresDesc: [
        "We pick up the “doo” and freshen & protect your lawn — Mondays & Fridays.",
        "Included is monthly soil neutralizer to improve soil structure and combat dog urine salts, paired with a weekly pet-safe deodorizing spray to keep your grass fresh.",
        "Perfect timing before and after the weekend mess!",
        "Cancel anytime. No commitments.",
      ],
    },
    {
      title: "Once a week Premium Friday",
      desc: "We scoop, freshen and protect your lawn — Fridays before the weekend!.",
      priceVisit: "$22.99 per visit",
      priceWeek: "$22.99/week, billed monthly",
      features: [
        "Friday 'doo' pickup before the weekend with pet-safedeodorising spray",
        "$22.99/week, billed monthly",
        "Keep your lawn fresh with our weekly pet-friendly deodorizing spray.",
        "Monthly pet-safe soil neutralizer treatment to improve soil structure and neutralize salts from dog urine, promoting soil health and keeping your grass fresh.",
        "No upfront payment!",
        "Billed after your first month — risk-free!",
        "Then automatically billed each month — no manual bank transfers!",
        "No upfront payment!",
      ],
      featuresDesc: [
        "We pick up the “doo” and freshen & protect your lawn — Friday before the weekend!",
        "Included is monthly soil neutralizer to improve soil structure and combat dog urine salts, paired with a weekly pet-safe deodorizing spray to keep your grass fresh.",
        "Perfect timing before the weekend!",
        "Cancel anytime. No commitments.",
      ],
    },
    {
        title: "Once a week Premium",
        desc: "Scoop, freshen and protect — your lawn stays happy and green. Visits on Wednesday",
        priceVisit: "$18.99 per visit",
        priceWeek: "$18.99/week, billed monthly",
        features: [
          "1 'doo' pickup per week with pet-safe deodorising spray (Weds)",
          "$18.99/week, billed monthly",
          "Keep your lawn fresh with our weekly pet-friendly deodorizing spray.",
          "Monthly pet-safe soil neutralizer treatment to improve soil structure and neutralize salts from dog urine, promoting soil health and keeping your grass fresh.",
          "No upfront payment!",
          "Billed after your first month — risk-free!",
          "Then automatically billed each month — no manual bank transfers!",
          "No upfront payment!",
        ],
        featuresDesc: [
          "We pick up the “doo” and freshen & protect your lawn — every Wednesday.",
          "Included is monthly soil neutralizer to improve soil structure and combat dog urine salts, paired with a weekly pet-safe deodorizing spray to keep your grass fresh.",
          "Midweek freshness to keep your yard clean and mess-free.",
          "Cancel anytime. No commitments.",
        ],
      },
      {
        title: "Twice a week Artificial Grass",
        desc: "We scoop twice a week, and freshen and clean your artificial grass once a week!",
        priceVisit: "$15.99 per visit",
        priceWeek: "$31.98/week, billed monthly",
        features: [
          "2 'doo' pickups per week with pet-safe",
          "$31.98/week, billed monthly",
          "deodorising spray",
          "Weekly clean & deodorising treatment to prevent smells and keep your artificial grass green.",
          "No upfront payment!",
          "Billed after your first month — risk-free!",
          "Then automatically billed each month — no manual bank transfers!",
        ],
        featuresDesc: [
          "We pick up the “doo” twice a week (Mondays & Fridays), and freshen & clean your artificial grass once a week!",
          "Also included is weekly deodorising treatment to prevent smells, improve hygiene, and keep your artificial grass green.",
          "Freshness to keep your artificial grass clean and mess-free.",
          "Cancel anytime. No commitments.",
        ],
      },
      {
        title: "Once a week Artificial Grass",
        desc: "We scoop, freshen, and clean your artificial grass — once a week!",
        priceVisit: "$24.99 per visit",
        priceWeek: "$24.99/week, billed monthly",
        features: [
          "1 'doo' pickup per week with pet-safe",
          "$24.99/week, billed monthly",
          "deodorising spray",
          "Weekly clean & deodorising treatment to prevent smells and keep your artificial grass green.",
          "No upfront payment!",
          "Billed after your first month — risk-free!",
          "Then automatically billed each month — no manual bank transfers!",

        ],
        featuresDesc: [
          "We pick up the “doo” and freshen & clean your artificial grass — once a week!",
          "Also included is weekly deodorising treatment to prevent smells, improve hygiene, and keep your artificial grass green.",
          "Freshness to keep your artificial grass clean and mess-free.",
          "Cancel anytime. No commitments.",
        ],
      },
      {
        title: "Twice a week",
        desc: "We pick up the doo twice a week — Mondays & Fridays, hassle-free.",
        priceVisit: "$11.99 per pickup",
        priceWeek: "$23.98/week, billed monthly",
        features: [
          "2 'doo' pickups each week (Mon & Fri)",
          "$23.98/week, billed monthly",
          "No deodorising",
          "No upfront payment!",
          "Billed after your first month — risk-free!",
          "Then automatically billed each month — no manual bank transfers!",
        ],
        featuresDesc: [
          "We pick up the “doo” twice a week — Mondays and Fridays",
          "Perfect timing before and after the weekend mess!",
          "Cancel anytime. No commitments.",
        ],
      },
      {
        title: "Once a week Friday",
        desc: "Weekly doo pickup — keeping your yard clean with zero fuss before the weekend!",
        priceVisit: "$16.99 per pickup",
        priceWeek: "$16.99/week, billed monthly",
        features: [
          "1 'doo' pickup each week (Friday)",
          "$16.99/week, billed monthly",
          "No deodorising",
          "No upfront payment!",
          "Billed after your first month — risk-free!",
          "Then automatically billed each month — no manual bank transfers!",
        ],
        featuresDesc: [
          "We pick up the “doo” once a week — every Friday before the weekend!",
          "Perfect timing before the weekend!",
          "Cancel anytime. No commitments.",
        ],
      },
      {
        title: "Once a week",
        desc: "Weekly doo pickup — keeping your yard clean with zero fuss. Visits on Wednesday",
        priceVisit: "$13.99 per pickup",
        priceWeek: "$13.99/week, billed monthly",
        features: [
          "1 'doo' pickup each week (Weds)",
          "$13.99/week, billed monthly",
          "No deodorising",
          "No upfront payment!",
          "Billed after your first month — risk-free!",
          "Then automatically billed each month — no manual bank transfers!",

        ],
        featuresDesc: [
          "We pick up the “doo” once a week — every Wednesday.",
          "Early or midweek freshness to keep your yard clean and mess-free.",
          "Cancel anytime. No commitments.",
        ],
      },
  ];

  // Helper to get plan details by title
  const getPlanDetails = (title: string) => {
    return planDetails.find((plan) => plan.title === title) || planDetails[0];
  };

  // Helper to render banners
  const renderBanner = (plan: string) => {
    if (
      plan === "Twice a week Premium" ||
      plan === "Once a week Premium" ||
      plan === "Once a week Premium Friday"
    )
      return (
        <View
          style={{
            position: "relative",
            backgroundColor: "yellow",
            borderTopLeftRadius: 3,
            borderBottomRightRadius: 3,
            alignSelf: "flex-start",
            padding: 10,
            marginBottom: 10,
          }}
        >
          <RNText style={{ fontWeight: "bold", color: "#195E4B", fontSize: 12 }}>
            PREMIUM - SCOOP, FRESHEN & PROTECT
          </RNText>
        </View>
      );

    if (plan === "Twice a week Artificial Grass" || plan === "Once a week Artificial Grass")
      return (
        <View
          style={{
            position: "relative",
            backgroundColor: "#A5D6A7",
            borderTopLeftRadius: 3,
            borderBottomRightRadius: 3,
            alignSelf: "flex-start",
            padding: 10,
            marginBottom: 10,
          }}
        >
          <RNText style={{ fontWeight: "bold", color: "#195E4B", fontSize: 12 }}>
            ASTRO - SCOOP, FRESHEN & CLEAN
          </RNText>
        </View>
      );

    if (plan === "Twice a week" || plan === "Once a week" || plan === "Once a week Friday")
      return (
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
          <RNText style={{ fontWeight: "bold", color: "#eee", fontSize: 12 }}>
            ESSENTIAL - SCOOP ONLY
          </RNText>
        </View>
      );

    return null;
  };

  return (
    <ScrollView className="flex-1 bg-gray-100 p-4">
      <View style={{ paddingTop: 20, paddingBottom: 40 }}>
        <RNText style={{ fontFamily: fonts.bold, fontSize: 24, color: "#195E4B" }}>
          Dog-doo Subscriptions
        </RNText>
      </View>

      <List.Section style={{ padding: 0 }}>
        {Object.entries(planGroups).map(([groupTitle, plans]) => {
          const isExpanded = expanded === groupTitle;

          let iconName = "pets";
          if (groupTitle.includes("Premium")) iconName = "star";
          if (groupTitle.includes("Artificial Grass")) iconName = "eco";
          if (groupTitle.includes("Standard")) iconName = "grass";

          return (
            <View key={groupTitle} style={{ marginVertical: 10 }}>
              <TouchableOpacity
                onPress={() => toggleExpand(groupTitle)}
                style={{
                  backgroundColor: isExpanded ? "#42A5F5" : "#0D47A1",
                  borderRadius: 12,
                  height: 140,
                  justifyContent: "center",
                  alignItems: "center",
                  padding: 10,
                }}
              >
                <MaterialIcons
                  name={iconName}
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
                  {groupTitle}
                </RNText>
                <MaterialIcons
                  name={isExpanded ? "expand-less" : "expand-more"}
                  size={36}
                  color="#fff"
                  style={{ position: "absolute", top: 10, right: 10 }}
                />
              </TouchableOpacity>

              {isExpanded && (
                <View style={{ paddingTop: 20 }}>
                  {plans.map((plan) => {
                    const details = getPlanDetails(plan);

                    return (
                      <Card
                        key={plan}
                        style={{
                          borderRadius: 5,
                          elevation: 0,
                          shadowColor: "transparent",
                          padding: 20,
                          marginBottom: 40,
                          backgroundColor: "#eeeeee", // keep card background
                          borderWidth: details.features[0]?.includes("Premium") ? 2 : 0,
                          borderColor: "#195E4B",
                        }}
                      >
                        {renderBanner(plan)}

                        <RNText
                          style={{
                            fontFamily: fonts.bold,
                            fontSize: 32,
                            color: "#195E4B",
                            marginBottom: 10,
                          }}
                        >
                          {details.title}
                        </RNText>
                        <RNText
                          style={{
                            fontFamily: fonts.medium,
                            fontSize: 24,
                            color: "#999999",
                            paddingBottom: 30,
                          }}
                        >
                          {details.desc}
                        </RNText>
                        <RNText
                          style={{
                            fontFamily: fonts.medium,
                            fontSize: 32,
                            color: "#195E4B",
                            marginBottom: 10,
                          }}
                        >
                          {details.priceVisit}
                        </RNText>

                        {details.features.map((feature, index) => (
                          <View
                            key={index}
                            style={{
                              flexDirection: "row",
                              alignItems: "flex-start",
                              marginBottom: 4,
                            }}
                          >
                            <MaterialIcons
                              name="check"
                              size={15}
                              color="#195E4B"
                              style={{ marginRight: 6, marginTop: 2 }}
                            />
                            <RNText
                              style={{
                                fontFamily: fonts.medium,
                                fontSize: 15,
                                color: "#777777",
                              }}
                            >
                              {feature}
                            </RNText>
                          </View>
                        ))}

                        {details.featuresDesc.map((desc, index) => (
                          <RNText
                            key={index}
                            style={{
                              fontFamily: fonts.medium,
                              fontSize: 14,
                              color: "#555",
                              marginTop: 6,
                            }}
                          >
                            {desc}
                          </RNText>
                        ))}

                        <Card.Actions>
                          <Button
                            mode="contained"
                            buttonColor="#195E4B"
                            textColor="#FFFFFF"
                            style={{ width: "100%", borderRadius: 5, marginTop: 20 }}
                            labelStyle={{ fontFamily: fonts.medium }}
                            onPress={() => handleSelectPlan(plan)}
                          >
                            Choose & Continue
                          </Button>
                        </Card.Actions>
                      </Card>
                    );
                  })}
                </View>
              )}
            </View>
          );
        })}
      </List.Section>
    </ScrollView>
  );
}

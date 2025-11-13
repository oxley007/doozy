import React, { useState } from "react";
import { View, Text as RNText, ScrollView, TouchableOpacity, Image } from "react-native";
import { Button, Card, List } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { styled } from "nativewind";
import { useDispatch } from "react-redux";
import { setSelectedPlan } from "../../store/store";
import fonts from "../../assets/fonts/fonts.js";

const StyledView = styled(View);

export default function DogWalkPlanScreen() {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const [expanded, setExpanded] = useState<string | null>(null);

  const toggleExpand = (group: string) => {
    setExpanded(expanded === group ? null : group);
  };

  const handleSelectPlan = (plan: string) => {
    dispatch(setSelectedPlan(plan));
    navigation.navigate("SignUpScreen");
  };

  const planGroups = {
    "Dog Walking Plans": ["Once a Week Walk", "Twice a Week Walk"],
  };

  const planDetails = [
    {
      title: "Once a Week Walk",
      desc: "One 30-minute walk per week — every Wednesday.",
      priceVisit: "$34.90 per walk",
      priceWeek: "$34.90/week",
      features: [
        "1 x 30-minute dog walk per week (Wednesday)",
        "Safe, friendly, local dog walking service",
        "Option to track your dog’s walk in real time",
        "No upfront payment",
        "Billed monthly — automatic and hassle-free",
      ],
      featuresDesc: [
        "Perfect for busy weekdays — your dog gets a midweek adventure!",
        "Walks are tailored to your dog’s energy and needs.",
        "Cancel anytime. No commitments.",
      ],
    },
    {
      title: "Twice a Week Walk",
      desc: "Two 30-minute walks per week — Mondays & Fridays.",
      priceVisit: "$29.90 per walk",
      priceWeek: "$59.80/week",
      features: [
        "2 x 30-minute dog walks per week (Monday & Friday)",
        "Safe, friendly, local dog walking service",
        "Option to track your dog’s walk in real time",
        "No upfront payment",
        "Billed monthly — automatic and hassle-free",
      ],
      featuresDesc: [
        "Great for high-energy dogs — walks before and after the workweek!",
        "Walks are tailored to your dog’s energy and needs.",
        "Cancel anytime. No commitments.",
      ],
    },
  ];

  const getPlanDetails = (title: string) =>
    planDetails.find((plan) => plan.title === title) || planDetails[0];

  const renderBanner = (plan: string) => (
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
        DOG WALKING - SAFE & FUN
      </RNText>
    </View>
  );

  return (
    <ScrollView className="flex-1 bg-gray-100 p-4">
      <View style={{ paddingTop: 20, paddingBottom: 40 }}>
        <RNText style={{ fontFamily: fonts.bold, fontSize: 31, color: '#195E4B' }}>
          Subscription Options
        </RNText>
        <RNText
          style={{
            fontFamily: fonts.bold,
            fontSize: 18,
            color: "#999",
            lineHeight: 24,
            marginTop: 10,
            backgroundColor: 'yellow',
            fontWeight: 'bold'
          }}
        >
          Save up to 70% when you subscribe to our services!
        </RNText>
        <RNText
          style={{
            fontFamily: fonts.bold,
            fontSize: 18,
            color: "#999",
            lineHeight: 24,
            marginTop: 10,
          }}
        >
          We’re dog lovers delivering friendly, local service you can trust — choose the option that suits you.
        </RNText>
      </View>

      <View style={{ paddingTop: 20, paddingBottom: 40 }}>
        <RNText style={{ fontFamily: fonts.bold, fontSize: 24, color: "#195E4B" }}>
          Dog Walking Subscriptions
        </RNText>
        <RNText
          style={{
            fontFamily: fonts.bold,
            fontSize: 18,
            color: "#999",
            lineHeight: 24,
            marginTop: 10,
          }}
        >
          Convenient, regular walks for your furry friend!
        </RNText>
      </View>

      <List.Section style={{ padding: 0 }}>
        {Object.entries(planGroups).map(([groupTitle, plans]) => {
          const isExpanded = expanded === groupTitle;

          let iconName = "pets"; // Default icon
          if (groupTitle.includes("Premium")) iconName = "star";
          if (groupTitle.includes("Artificial Grass")) iconName = "eco";
          if (groupTitle.includes("Standard")) iconName = "grass";

          return (
            <View key={groupTitle} style={{ marginVertical: 10 }}>
              <TouchableOpacity
                onPress={() => toggleExpand(groupTitle)}
                style={{
                  backgroundColor: isExpanded ? "#D69E1F" : "#F4C430",
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
                          backgroundColor: "#eeeeee",
                          borderWidth: 0,
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

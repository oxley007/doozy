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

export default function CombinedPlanAccordion() {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const [expanded, setExpanded] = useState<string | null>(null);

  const toggleExpand = (group: string) => setExpanded(expanded === group ? null : group);

  const handleSelectPlan = (plan: string) => {
    dispatch(setSelectedPlan(plan));
    navigation.navigate("SignUpScreen");
  };

  // Original planGroups for ordering
  const planGroups = {
    "Premium Doo + Walk": [
      "Twice a week Premium",
      "Once a week Premium Friday",
      "Once a week Premium",
    ],
    "Artificial Grass + Walk": [
      "Twice a week Artificial Grass",
      "Once a week Artificial Grass",
    ],
    "Standard Doo + Walk": ["Twice a week", "Once a week Friday", "Once a week doo removal"],
  };

  // ----- Doo Pickup Plans -----
  const dooPlans: any = {
    "Twice a week Premium": { priceWeek: 33.98, priceVisit: 16.99, features: ["2 'doo' pickups per week (Mon & Fri)"], featuresDesc: ["We pick up the “doo” and freshen & protect your lawn — Mondays & Fridays."] },
    /*"Once a week Premium Friday": { priceWeek: 22.99, priceVisit: 22.99, features: ["1 'doo' pickup each week (Friday)"], featuresDesc: ["We pick up the “doo” and freshen & protect your lawn — Friday before the weekend!"] },*/
    "Once a week Premium": { priceWeek: 18.99, priceVisit: 18.99, features: ["1 'doo' pickup per week (Weds)"], featuresDesc: ["We pick up the “doo” and freshen & protect your lawn — every Wednesday."] },
    "Twice a week Artificial Grass": { priceWeek: 31.98, priceVisit: 15.99, features: ["2 'doo' pickups per week"], featuresDesc: ["We pick up the “doo” twice a week, and freshen & clean your artificial grass once a week!"] },
    "Once a week Artificial Grass": { priceWeek: 24.99, priceVisit: 24.99, features: ["1 'doo' pickup per week"], featuresDesc: ["We pick up the “doo” and freshen & clean your artificial grass — once a week!"] },
    "Twice a week": { priceWeek: 23.98, priceVisit: 11.99, features: ["2 'doo' pickups each week (Mon & Fri)"], featuresDesc: ["We pick up the “doo” twice a week — Mondays and Fridays"] },
    /*"Once a week Friday": { priceWeek: 16.99, priceVisit: 16.99, features: ["1 'doo' pickup each week (Friday)"], featuresDesc: ["We pick up the “doo” once a week — every Friday before the weekend!"] },*/
    "Once a week doo removal": { priceWeek: 13.99, priceVisit: 13.99, features: ["1 'doo' pickup each week (Weds)"], featuresDesc: ["We pick up the “doo” in your yard once a week — every Wednesday."] },
  };

  // ----- Dog Walk Plans -----
  const walkPlans: any = {
    "Once a Week Walk": {
      title: "Walk",
      priceWeek: 34.90,
      priceVisit: 34.90,
      features: ["1 x 30-minute dog walk per week (Wednesday)"],
      featuresDesc: ["And your pup gets a 30min 1-on-1 walk. Perfect for busy weekdays — your dog gets a midweek adventure!"]
    },
    "Twice a Week Walk": {
      title: "Walk",
      priceWeek: 59.80,
      priceVisit: 29.90,
      features: ["2 x 30-minute dog walks per week (Monday & Friday)"],
      featuresDesc: ["Great for high-energy dogs — walks before and after the workweek!"]
    },
  };

  const getWalkForDoo = (dooTitle: string) => dooTitle.includes("Twice") ? walkPlans["Twice a Week Walk"] : walkPlans["Once a Week Walk"];

  const renderBanner = (title: string) => {
    const banners = [];
    if (title.includes("Premium")) banners.push({ text: "PREMIUM - SCOOP, FRESHEN & PROTECT", bg: "yellow", color: "#195E4B" });
    if (title.includes("Artificial Grass")) banners.push({ text: "ASTRO - SCOOP, FRESHEN & CLEAN", bg: "#A5D6A7", color: "#195E4B" });
    if (title.includes("Walk")) banners.push({ text: "DOG WALKING - SAFE & FUN", bg: "#154D7C", color: "#fff" });

    return banners.map((b, i) => (
      <View key={i} style={{ position: "relative", backgroundColor: b.bg, borderTopLeftRadius: 3, borderBottomRightRadius: 3, alignSelf: "flex-start", padding: 10, marginBottom: 10 }}>
        <RNText style={{ fontWeight: "bold", color: b.color, fontSize: 12 }}>{b.text}</RNText>
      </View>
    ));
  };

  return (
    <ScrollView className="flex-1 bg-gray-100 p-4">
      <View style={{ paddingTop: 20, paddingBottom: 40 }}>
        <RNText style={{ fontFamily: fonts.bold, fontSize: 24, color: "#195E4B" }}>
          Combined Subscription
        </RNText>
        <RNText style={{ fontFamily: fonts.bold, fontSize: 18, color: "#999", marginTop: 10 }}>
          Save up to 70% when you subscribe to both our walk and dog-doo removal services!
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
                  backgroundColor: isExpanded ? "#FF7043" : "#F44336",
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
                  {plans.map((dooTitle) => {
                    const walk = getWalkForDoo(dooTitle);
                    const doo = dooPlans[dooTitle];
                    if (!doo) return null;

                    const combinedTitle = `${dooTitle} & ${walk.title}`;
                    const priceVisit = `$${(doo.priceVisit + walk.priceVisit).toFixed(2)} per visit`;
                    const priceWeek = `$${(doo.priceWeek + walk.priceWeek).toFixed(2)}/week, billed monthly`;
                    const features = [...doo.features, ...walk.features];
                    const featuresDesc = [...doo.featuresDesc, ...walk.featuresDesc];

                    return (
                      <Card
                        key={combinedTitle}
                        style={{
                          borderRadius: 5,
                          elevation: 0,
                          shadowColor: "transparent",
                          padding: 20,
                          marginBottom: 40,
                          backgroundColor: "#eeeeee",
                        }}
                      >
                        {renderBanner(combinedTitle)}

                        <RNText
                          style={{
                            fontFamily: fonts.bold,
                            fontSize: 32,
                            color: "#195E4B",
                            marginBottom: 10,
                          }}
                        >
                          {combinedTitle}
                        </RNText>
                        <RNText
                          style={{
                            fontFamily: fonts.medium,
                            fontSize: 24,
                            color: "#999999",
                            paddingBottom: 10,
                          }}
                        >
                          {featuresDesc.join(" ")}
                        </RNText>

                        <RNText
                          style={{
                            fontFamily: fonts.medium,
                            fontSize: 28,
                            color: "#195E4B",
                            marginBottom: 10,
                          }}
                        >
                          {priceVisit}
                        </RNText>
                        <RNText
                          style={{
                            fontFamily: fonts.medium,
                            fontSize: 28,
                            color: "#195E4B",
                            marginBottom: 10,
                          }}
                        >
                          {priceWeek}
                        </RNText>

                        {features.map((feature, i) => (
                          <View
                            key={i}
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

                        <Card.Actions>
                          <Button
                            mode="contained"
                            buttonColor="#195E4B"
                            textColor="#FFFFFF"
                            style={{ width: "100%", borderRadius: 5, marginTop: 20 }}
                            labelStyle={{ fontFamily: fonts.medium }}
                            onPress={() => handleSelectPlan(combinedTitle)}
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

import React, { useState } from "react";
import { View, Text as RNText, ScrollView } from "react-native";
import { Button, Card, List } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { styled } from "nativewind";
import { useDispatch } from "react-redux";
import { setSelectedPlan } from "../../store/store";
import store from "../../store/store";
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
    console.log(`Selected plan: ${plan}`);
    dispatch(setSelectedPlan(plan));
    console.log("Full Redux state:", store.getState());
    navigation.navigate("SignUpScreen");
  };

  // --- Group plans by area ---
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
    "Standard Doo Pickup": [
      "Twice a week",
      "Once a week Friday",
      "Once a week",
    ],
  };

  return (
    <ScrollView className="flex-1 bg-gray-100 p-4">
      <View style={{ paddingTop: 60, paddingBottom: 40 }}>
        <RNText style={{ fontFamily: fonts.bold, fontSize: 24, color: "#195E4B" }}>
          Subscription Options..
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
          We’re dog lovers delivering friendly, local service you can trust — choose
          the option that suits you.
        </RNText>
      </View>

      {/* --- Accordion Groups --- */}
      <List.Section>
        {Object.entries(planGroups).map(([groupTitle, plans]) => (
          <List.Accordion
            key={groupTitle}
            title={groupTitle}
            expanded={expanded === groupTitle}
            onPress={() => toggleExpand(groupTitle)}
            titleStyle={{
              fontFamily: fonts.bold,
              fontSize: 22,
              color: "#195E4B",
            }}
            style={{
              backgroundColor: "#E6F0EC",
              borderRadius: 8,
              marginBottom: 10,
            }}
            right={(props) => (
              <MaterialIcons
                name={expanded === groupTitle ? "expand-less" : "expand-more"}
                size={28}
                color="#195E4B"
              />
            )}
          >
            {/* --- Render full cards inside each accordion --- */}
            {plans.map((plan) => (
              <Card
                key={plan}
                style={{
                  borderRadius: 5,
                  elevation: 0,
                  padding: 20,
                  marginBottom: 30,
                  backgroundColor: "#eeeeee",
                }}
              >
                {/* ✅ Keep your full plan card UI here */}
                <RNText
                  style={{
                    fontFamily: fonts.bold,
                    fontSize: 28,
                    color: "#195E4B",
                    marginBottom: 8,
                  }}
                >
                  {plan}
                </RNText>

                {/* --- Insert your existing detailed per-plan logic here --- */}
                {/* You can paste your existing large card content exactly as-is here */}

                <LawnInfo from={"planScreen"} plan={plan} />

                <Button
                  mode="contained"
                  buttonColor="#195E4B"
                  textColor="#FFFFFF"
                  style={{
                    width: "100%",
                    borderRadius: 5,
                    marginTop: 10,
                  }}
                  labelStyle={{ fontFamily: fonts.medium }}
                  onPress={() => handleSelectPlan(plan)}
                >
                  Choose & Continue
                </Button>
              </Card>
            ))}
          </List.Accordion>
        ))}
      </List.Section>
    </ScrollView>
  );
}

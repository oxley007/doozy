import React from "react";
import { Text as RNText, View, StyleSheet } from "react-native";
import { Button, Card } from "react-native-paper";
import { useNavigation} from "@react-navigation/native";
import { styled } from "nativewind";
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useDispatch } from 'react-redux';
import { setSelectedPlan } from '../../store/store';
import store from "../../store/store";
import fonts from '../../assets/fonts/fonts.js';

const StyledView = styled(View);

export default function LawnInfo({ from, plan }: { from: string; plan: string }) {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();

  const [expandedPlan, setExpandedPlan] = React.useState<string | null>(null);

  const toggleExpand = (plan: string) => {
    setExpandedPlan(expandedPlan === plan ? null : plan);
  };

  const plans = [
    "Twice a week Premium",
    "Once a week Premium Friday",
    "Once a week Premium",
    "Once a week Artificial Grass",
    "Twice a week Artificial Grass",
    "Twice a week",
    "Once a week Friday",
    "Once a week"
  ];

  return (
    <View>
      {(plan === "Twice a week Premium" || plan === "Once a week Premium Friday" || plan === "Once a week Premium") && (
        <View style={{ marginTop: 20 }}>
          <RNText
            style={{
              fontFamily: fonts.bold,
              fontSize: 16,
              color: '#195E4B',
              textDecorationLine: 'underline',
            }}
            onPress={() => toggleExpand(plan)}
          >
            {expandedPlan === plan ? "- Hide Lawn Maintenance & Repair Info" : "+ More info about Lawn Maintenance & Repair"}
          </RNText>

          {expandedPlan === plan && (
            <View style={{ marginTop: 10, padding: 10, backgroundColor: '#f9f9f9', borderRadius: 5 }}>
              <RNText style={{ fontFamily: fonts.bold, fontSize: 16, marginBottom: 8 }}>
                <MaterialIcons name="build" size={15} color="#195E4B" /> Initial Visit – Burnt Spot Repair
              </RNText>

              <RNText style={{ fontSize: 13 }}><MaterialIcons name="check" size={13} color="#195E4B" /> Remove dead grass and debris</RNText>
              <RNText style={{ fontSize: 13 }}><MaterialIcons name="check" size={13} color="#195E4B" /> Apply lime to reduce soil acidity</RNText>
              <RNText style={{ fontSize: 13 }}><MaterialIcons name="check" size={13} color="#195E4B" /> Apply gypsum on heavy clay soils to break up compaction and reduce urine pooling</RNText>
              <RNText style={{ fontSize: 13 }}><MaterialIcons name="check" size={13} color="#195E4B" /> Add topsoil to level the area and improve soil structure</RNText>
              <RNText style={{ fontSize: 13 }}><MaterialIcons name="check" size={13} color="#195E4B" /> Reseed with durable ryegrass</RNText>
              <RNText style={{ fontSize: 13 }}><MaterialIcons name="check" size={13} color="#195E4B" /> Apply starter fertiliser to help new grass establish</RNText>
              <RNText style={{ fontSize: 13 }}><MaterialIcons name="check" size={13} color="#195E4B" /> Free hire of a hose timer (waters at 8am & 5pm for 5 minutes daily during the first 2 weeks)</RNText>

              <RNText style={{ fontFamily: fonts.bold, fontSize: 16, marginBottom: 8, marginTop: 12 }}>
                <MaterialIcons name="construction" size={15} color="#195E4B" /> Ongoing Repair & Maintenance
              </RNText>
              <RNText style={{ fontSize: 14, marginBottom: 6 }}><MaterialIcons name="wb-sunny" size={15} color="#195E4B" /> Summer (Dec–Feb)</RNText>
              {plan === "Twice a week Premium" &&
                <RNText style={{ fontSize: 13 }}><MaterialIcons name="check" size={13} color="#195E4B" /> Dog waste removal twice weekly</RNText>
              }
              {(plan === "Once a week Premium Friday" || plan === "Once a week Premium") &&
                <RNText style={{ fontSize: 13 }}><MaterialIcons name="check" size={13} color="#195E4B" /> Dog waste removal weekly</RNText>
              }
              <RNText style={{ fontSize: 13 }}><MaterialIcons name="check" size={13} color="#195E4B" /> Montly Application of soil neutraliser (lime & gypsum) to balance urine.</RNText>
              <RNText style={{ fontSize: 13 }}><MaterialIcons name="check" size={13} color="#195E4B" /> Deodoriser spray twice weekly</RNText>
              <RNText style={{ fontSize: 13 }}><MaterialIcons name="check" size={13} color="#195E4B" /> Repair burnt spots as needed</RNText>

              <RNText style={{ fontSize: 14, marginBottom: 6, marginTop: 8 }}><MaterialIcons name="eco" size={15} color="#195E4B" /> Autumn (Mar–May)</RNText>
              <RNText style={{ fontSize: 13 }}><MaterialIcons name="check" size={13} color="#195E4B" /> Dog waste removal twice weekly</RNText>
              <RNText style={{ fontSize: 13 }}><MaterialIcons name="check" size={13} color="#195E4B" /> Montly Application of soil neutraliser (lime & gypsum) to balance urine.</RNText>
              <RNText style={{ fontSize: 13 }}><MaterialIcons name="check" size={13} color="#195E4B" /> Aerate lawn (Once)</RNText>
              <RNText style={{ fontSize: 13 }}><MaterialIcons name="check" size={13} color="#195E4B" /> Overseed to thicken grass</RNText>
              <RNText style={{ fontSize: 13, marginBottom: 8 }}><MaterialIcons name="check" size={13} color="#195E4B" /> Apply autumn fertiliser</RNText>

              <RNText style={{ fontSize: 14, marginBottom: 6, marginTop: 6 }}><MaterialIcons name="ac-unit" size={15} color="#195E4B" /> Winter (Jun–Aug)</RNText>
              <RNText style={{ fontSize: 13 }}><MaterialIcons name="check" size={13} color="#195E4B" /> Dog waste removal twice weekly</RNText>
              <RNText style={{ fontSize: 13 }}><MaterialIcons name="check" size={13} color="#195E4B" /> Montly Application of soil neutraliser (lime & gypsum) to balance urine.</RNText>
              <RNText style={{ fontSize: 13 }}><MaterialIcons name="check" size={13} color="#195E4B" /> Patch bare spots where needed</RNText>

              <RNText style={{ fontSize: 14, marginBottom: 6, marginTop: 6 }}><MaterialIcons name="local-florist" size={15} color="#195E4B" /> Spring (Sep–Nov)</RNText>
              <RNText style={{ fontSize: 13 }}><MaterialIcons name="check" size={13} color="#195E4B" /> Dog waste removal twice weekly</RNText>
              <RNText style={{ fontSize: 13 }}><MaterialIcons name="check" size={13} color="#195E4B" /> Montly Application of soil neutraliser (lime & gypsum) to balance urine.</RNText>
              <RNText style={{ fontSize: 13 }}><MaterialIcons name="check" size={13} color="#195E4B" /> Aerate lawn (once)</RNText>
              <RNText style={{ fontSize: 13 }}><MaterialIcons name="check" size={13} color="#195E4B" /> Overseed weak areas</RNText>
              <RNText style={{ fontSize: 13 }}><MaterialIcons name="check" size={13} color="#195E4B" /> Apply spring fertiliser</RNText>
              <RNText style={{ fontSize: 13, marginBottom: 8, marginTop: 6 }}><MaterialIcons name="check" size={13} color="#195E4B" /> Pet safe weed control if needed</RNText>

              <RNText style={{ fontFamily: fonts.bold, fontSize: 14, marginTop: 8 }}><MaterialIcons name="calendar-today" size={15} color="#195E4B" /> All Year Round</RNText>
              <RNText style={{ fontSize: 13 }}><MaterialIcons name="check" size={13} color="#195E4B" /> Dog waste removal twice weekly</RNText>
              <RNText style={{ fontSize: 13 }}><MaterialIcons name="check" size={13} color="#195E4B" /> Neutraliser every month</RNText>
              <RNText style={{ fontSize: 13 }}><MaterialIcons name="check" size={13} color="#195E4B" /> Deodoriser spray weekly</RNText>
              <RNText style={{ fontSize: 13 }}><MaterialIcons name="check" size={13} color="#195E4B" /> Fertiliser every 2–3 months (Note: not needed over winter months)</RNText>
              <RNText style={{ fontSize: 13, marginBottom: 8 }}><MaterialIcons name="check" size={13} color="#195E4B" /> Spot-repair as soon as damage appears</RNText>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  regular: { fontFamily: 'InterRegular', fontSize: 18, marginBottom: 12 },
  medium: { fontFamily: 'InterMedium', fontSize: 18, marginBottom: 12 },
  bold: { fontFamily: 'InterBold', fontSize: 18 },
});

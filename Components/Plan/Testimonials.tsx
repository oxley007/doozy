import React from "react";
import { Text as RNText, View, StyleSheet } from "react-native";
import { Button, Card, Text, List } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { styled } from "nativewind";
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import fonts from '../../assets/fonts/fonts.js';

const StyledView = styled(View);

export default function Testimonials() {
  const navigation = useNavigation();

  const fontFamilies = [
  'Inter 24pt Regular',
  fonts.medium,
  fonts.bold,
  'Inter24pt-Regular',
  'Inter24pt-Medium',
  'Inter24pt-Bold',
  'Inter 24pt',
  'Inter',
];

  const handleSelectPlan = (plan: string) => {
    console.log(`Selected plan: ${plan}`);
    // Here you’d trigger Stripe or IAP logic
  };

  return (
    <StyledView className="flex-1 bg-gray-100 p-4">

      <View style={{ paddingTop: 40, paddingBottom: 40 }}>
        <RNText style={{ fontFamily: fonts.bold, fontSize: 24, color: '#195E4B' }}>What customers say</RNText>
        <RNText style={{ fontFamily: fonts.bold, fontSize: 24, color: '#999999', lineHeight: 24, }}>Trusted by dog owners</RNText>
      </View>

      {["Jenny O", "Alanna D", "Tara P"].map((plan) => (
        <Card key={plan} style={{ borderRadius: 5, elevation: 0, shadowColor: 'transparent', padding: 20, marginBottom: 40, backgroundColor: '#eeeeee' }} className="mb-4">
          <View className="flex-row items-center mt-2">
            <RNText style={{ fontFamily: fonts.medium, fontSize: 15, color: '#777777', paddingTop: 10 }}>
                {plan === "Jenny O" &&
                  '“We love how easy Doozy has made yard clean-up. The team clearly cares about dogs, and our two love seeing them each week!”'
                }
                {plan === "Alanna D" &&
                  '“Love it! Lawn stays fresh, green, and clean without any hassle.”'
                }
                {plan === "Tara P" &&
                  '“We signed up for the twice-a-week plan and it’s been amazing. The yard stays clean, and the kids can actually run around without worrying. Doozy’s team is reliable and clearly loves dogs — it’s been such a win for the whole family.”'
                }
            </RNText>
            <RNText style={{ fontFamily: fonts.bold, fontSize: 15, color: '#777777', paddingTop: 10 }}>
              {plan === "Jenny O" &&
                'Jenny & Mark O.'
              }
              {plan === "Alanna D" &&
                'Alanna D'
              }
              {plan === "Tara P" &&
                'Tara P'
              }
            </RNText>
            <RNText style={{ fontFamily: fonts.medium, fontSize: 15, color: '#777777', paddingTop: 0 }}>
              {plan === "Jenny O" &&
                'Titirangi, Empty Nesters, Dog Owners'
              }
              {plan === "Alanna D" &&
                'Kohimarama, Mum, and Dog Mama'
              }
              {plan === "Tara P" &&
                'Mt Eden, Family, Dog Lovers'
              }
            </RNText>
          </View>
        </Card>
      ))}

    </StyledView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  regular: {
    fontFamily: 'InterRegular',
    fontSize: 18,
    marginBottom: 12,
  },
  medium: {
    fontFamily: 'InterMedium',
    fontSize: 18,
    marginBottom: 12,
  },
  bold: {
    fontFamily: 'InterBold',
    fontSize: 18,
  },
});

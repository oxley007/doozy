import React from "react";
import { Text as RNText, View, StyleSheet } from "react-native";
import { Button, Card, Text, List } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { styled } from "nativewind";
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import fonts from '../../assets/fonts/fonts.js';

const StyledView = styled(View);

export default function WhatsIncludeAndWhy() {
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

      <View style={{ paddingTop: 0, paddingBottom: 30 }}>
        <RNText style={{ fontFamily: fonts.bold, fontSize: 24, color: '#195E4B', paddingBottom: 20 }}>What’s Included</RNText>
        <RNText style={{ fontFamily: fonts.bold, fontSize: 18, color: '#195E4B', paddingBottom: 20 }}>Premium</RNText>
        <RNText style={{ fontFamily: fonts.medium, fontSize: 15, color: '#777777', lineHeight: 20, }}>
          We come to your home for every pickup.
        </RNText>
        <RNText style={{ fontFamily: fonts.medium, fontSize: 15, color: '#777777', lineHeight: 20 }}>
          Pet-safe deodorising spray with every visit to keep lawns fresh.
        </RNText>
        <RNText style={{ fontFamily: fonts.medium, fontSize: 15, color: '#777777', lineHeight: 20 }}>
          Monthly soil neutraliser treatment to prevent yellow spots and improve lawn health.
        </RNText>
        <RNText style={{ fontFamily: fonts.medium, fontSize: 15, color: '#777777', lineHeight: 20 }}>
          Extra care and attention for your lawn — we treat it like our own.
        </RNText>
        <RNText style={{ fontFamily: fonts.medium, fontSize: 15, color: '#777777', lineHeight: 20, }}>
          Bags and waste disposal included.
        </RNText>
        <RNText style={{ fontFamily: fonts.medium, fontSize: 15, color: '#777777', lineHeight: 20, }}>
          Yard spot check for any missed mess.
        </RNText>
        <RNText style={{ fontFamily: fonts.medium, fontSize: 15, color: '#777777', lineHeight: 20, }}>
          Pet-friendly team — we love your dogs!
        </RNText>

        <RNText style={{ fontFamily: fonts.bold, fontSize: 18, color: '#195E4B', paddingBottom: 20, paddingTop: 20 }}>Basic</RNText>
        <RNText style={{ fontFamily: fonts.medium, fontSize: 15, color: '#777777', lineHeight: 20, }}>
          We come to your home for every pickup.
        </RNText>
        <RNText style={{ fontFamily: fonts.medium, fontSize: 15, color: '#777777', lineHeight: 20, }}>
          Bags and waste disposal included.
        </RNText>
        <RNText style={{ fontFamily: fonts.medium, fontSize: 15, color: '#777777', lineHeight: 20, }}>
          Yard spot check for any missed mess.
        </RNText>
        <RNText style={{ fontFamily: fonts.medium, fontSize: 15, color: '#777777', lineHeight: 20, }}>
          Pet-friendly team — we love your dogs!
        </RNText>
      </View>

      <View style={{ paddingTop: 0, paddingBottom: 20 }}>
        <RNText style={{ fontFamily: fonts.bold, fontSize: 24, color: '#195E4B', paddingBottom: 20 }}>Billing & Why Doozy</RNText>
        <RNText style={{ fontFamily: fonts.medium, fontSize: 15, color: '#777777', lineHeight: 20, }}>
          No upfront payment!
        </RNText>
        <RNText style={{ fontFamily: fonts.medium, fontSize: 15, color: '#777777', lineHeight: 20, }}>
          Billed after your first month of service.
        </RNText>
        <RNText style={{ fontFamily: fonts.medium, fontSize: 15, color: '#777777', lineHeight: 20, }}>
          Then automatically billed each month — no manual bank transfers!
        </RNText>
        <RNText style={{ fontFamily: fonts.medium, fontSize: 15, color: '#777777', lineHeight: 20, }}>
          No hidden fees.
        </RNText>
        <RNText style={{ fontFamily: fonts.medium, fontSize: 15, color: '#777777', lineHeight: 20, }}>
          Cancel anytime.
        </RNText>
        <RNText style={{ fontFamily: fonts.medium, fontSize: 15, color: '#777777', lineHeight: 20, }}>
          Pause pickups anytime and resume when you return.
        </RNText>
        <RNText style={{ fontFamily: fonts.medium, fontSize: 15, color: '#777777', lineHeight: 20, paddingTop: 20 }}>
          <RNText style={{ fontFamily: fonts.bold, fontSize: 15, color: '#777777', lineHeight: 20, }}>
            Why choose Doozy:
          </RNText>
          {'\u00A0'}Keep your yard clean and smell-free. Great for busy dog owners and families. Safe, hygienic service. Support a local NZ business.
        </RNText>
      </View>



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

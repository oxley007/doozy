// PaymentCancelScreen.tsx
import React, { useEffect } from 'react';
import { View, Text as RNText, ScrollView, StyleSheet, Image } from "react-native";
import { Button } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { styled } from "nativewind";
import { RootState } from "../../store/store";
import { auth } from '../../Firebase/firebaseConfig';

import BottomMenu from '../Menus/BottomMenu';
import fonts from '../../assets/fonts/fonts.js';


const StyledView = styled(View);

export default function PaymentCancelScreen() {
  const navigation = useNavigation<any>();
  const user = useSelector((state: RootState) => state.user);

  return (
    <View className="flex-1 p-4 bg-gray-100" style={{ backgroundColor: '#E9FCDA', minHeight: '100%' }}>
      <ScrollView style={{ padding: 20 }}>
        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
          <Image
            source={require('../../assets/images/Doozy_dog_logo.png')}
            style={{ width: 325, height: 325 }}
            resizeMode="contain"
          />
        </View>

        <View style={{ justifyContent: 'center', alignItems: 'center', marginBottom: 60 }}>
          <RNText style={{ fontFamily: fonts.bold, fontSize: 32, color: '#195E4B' }}>
            Payment Cancelled.
          </RNText>
          <RNText style={{ fontFamily: fonts.bold, fontSize: 22, color: '#999999', lineHeight: 22, paddingTop: 20, textAlign: 'center' }}>
            Payment has been cancelled.
          </RNText>
        </View>
      </ScrollView>

      <BottomMenu />
    </View>
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

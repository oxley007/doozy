import React, { useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Image } from "react-native";
import { Button, Card } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import serviceAreas from '../../data/serviceAreas.json';
import store from "../../store/store";
import { useDispatch, useSelector } from "react-redux";

import ExtraDetailsForm from './ExtraDetailsForm'
import fonts from '../../assets/fonts/fonts.js';


export default function ThankYou() {

  const navigation = useNavigation<any>();
  const user = useSelector((state: RootState) => state.user);

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


  const seeReduxText = () => {

    //console.log("Full Redux state:", user);
    console.log("Full Redux state:", store.getState().user);

  };

  const backToCheckAddress = () => {

    navigation.navigate("CheckAddressHome");

  }

  return (
    <View style={{ flex: 1, backgroundColor: '#E9FCDA' }}>
      <ScrollView style={{ padding: 20 }}>
        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
          <Image
            source={require('../../assets/images/Doozy_dog_logo.png')}
            style={{ width: 325, height: 325 }}
            resizeMode="contain"
          />
        </View>
        <View style={{ justifyContent: 'center', alignItems: 'center', paddingBottom: 60 }}>
          <Text style={{ fontFamily: fonts.bold, fontSize: 32, color: '#195E4B' }}>Thank you!</Text>
          <Text style={{ fontFamily: fonts.bold, fontSize: 28, color: '#999999', lineHeight: 28, textAlign: 'center' }}>You're all signed up. </Text>
        </View>

        <ExtraDetailsForm />

        <View style={{paddingBottom: 180}} />

      </ScrollView>
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

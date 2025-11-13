import React, { useEffect } from 'react';
import { View, Text as RNText, ScrollView, StyleSheet, Image } from "react-native";
import { Button, Card } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import serviceAreas from '../../data/serviceAreas.json';
import { useDispatch, useSelector } from "react-redux";
import { RootState, setUserDetails } from '../../store/store';
import firestore from '@react-native-firebase/firestore';
import { styled } from "nativewind";

import fonts from '../../assets/fonts/fonts.js';

//import ExtraDetailsForm from './ExtraDetailsForm'

const StyledView = styled(View);

export default function VisitConfirmed() {

  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user);
  const navigation = useNavigation<any>();

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

const toDoozyDetails = async () => {
  if (!user?.uid) return; // safety check

  try {
    // Update Firestore
    await firestore().collection('users').doc(user.uid).update({
      hasCompletedRegistration: true,
    });

    // Update Redux
    dispatch(setUserDetails({ ...user, hasCompletedRegistration: true }));

    // Navigate
    navigation.reset({
      index: 0,
      routes: [{ name: 'DoozyHome' }],
    });
  } catch (err) {
    console.error("Failed to complete registration:", err);
  }
};

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
          <RNText style={{ fontFamily: fonts.bold, fontSize: 32, color: '#195E4B', textAlign: 'center' }}>We have received your request for an initial visit.</RNText>
          <RNText style={{ fontFamily: fonts.bold, fontSize: 28, color: '#999999', lineHeight: 28, textAlign: 'center' }}>We’ll confirm the exact time and day via text based on your selections.</RNText>
        </View>

        <StyledView style={{ borderRadius: 5, elevation: 0, shadowColor: 'transparent', padding: 20, marginBottom: 40, backgroundColor: '#eeeeee' }} className="flex-1 p-4 bg-white">
          <View style={{ paddingTop: 20, paddingBottom: 20 }}>
            <RNText style={{ fontFamily: fonts.bold, fontSize: 24, color: '#195E4B' }}>Selected day & time</RNText>
            {Array.isArray(user?.visitDetails?.selectedTimes) &&
              user.visitDetails.selectedTimes.map((time, index) => (
                <RNText
                  key={index}
                  style={{
                    fontFamily: fonts.bold,
                    fontSize: 15,
                    color: '#999999',
                    lineHeight: 24,
                  }}
                >
                  {time}
                </RNText>
              ))
            }
            {Array.isArray(user?.visitDetails?.selectedDays) &&
              user.visitDetails.selectedDays.map((day, index) => (
                <RNText
                  key={index}
                  style={{
                    fontFamily: fonts.bold,
                    fontSize: 15,
                    color: '#999999',
                    lineHeight: 24,
                  }}
                >
                  {day}
                </RNText>
              ))
            }
          </View>
          </StyledView>

        <StyledView style={{ borderRadius: 5, elevation: 0, shadowColor: 'transparent', padding: 20, marginBottom: 40, backgroundColor: '#eeeeee' }} className="flex-1 p-4 bg-white">
          <View style={{ paddingTop: 20, paddingBottom: 20 }}>
            <RNText style={{ fontFamily: fonts.bold, fontSize: 24, color: '#195E4B' }}>When will be my initial vist?</RNText>
            <RNText style={{ fontFamily: fonts.bold, fontSize: 15, color: '#999999', lineHeight: 24 }}>Your initial visit will be within a week. We’ll text you the exact date & time.</RNText>
          </View>
          <View style={{ paddingTop: 20, paddingBottom: 20 }}>
            <RNText style={{ fontFamily: fonts.bold, fontSize: 24, color: '#195E4B' }}>Can I edit my date and time selections?</RNText>
            <RNText style={{ fontFamily: fonts.bold, fontSize: 15, color: '#999999', lineHeight: 24 }}>Yes. Please email andrew@4dot6digital.com for any changes</RNText>
          </View>
          <Button
            mode="contained"
            buttonColor="#195E4B"   // background color
            textColor="#FFFFFF"     // text color
            onPress={toDoozyDetails}
            className="mt-4"
            style={{
              paddingVertical: 12,
              borderRadius: 6,
              marginTop: 25,
              minWidth: '100%'
            }}
            labelStyle={{
              fontSize: 16,
              fontWeight: '800',
            }}
          >
            View my details
          </Button>
          </StyledView>



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

import React, { useEffect, useState } from 'react';
import { View, Text as RNText, ScrollView, StyleSheet, Image } from "react-native";
import { Button } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { styled } from "nativewind";
import auth from "@react-native-firebase/auth";
import { useDispatch, useSelector } from "react-redux";
import { RootState, setUserDetails } from '../../store/store';
import firestore from '@react-native-firebase/firestore';

import fonts from '../../assets/fonts/fonts.js';

const StyledView = styled(View);

export default function DetailsConfirmed() {
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  const user = useSelector((state: RootState) => state.user);

  const [firebaseUser, setFirebaseUser] = useState<any>(null);

  // Listen for real Firebase auth state
  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged((user) => {
      setFirebaseUser(user);
    });
    return () => unsubscribe();
  }, []);

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
          <RNText style={{ fontFamily: fonts.bold, fontSize: 32, color: '#195E4B', textAlign: 'center' }}>
            We have your details!
          </RNText>
          <RNText style={{ fontFamily: fonts.bold, fontSize: 28, color: '#999999', lineHeight: 28, textAlign: 'center' }}>
            We’ll process your details and message you with the date of your first Doozy visit.
          </RNText>
        </View>

        <StyledView style={{ borderRadius: 5, elevation: 0, shadowColor: 'transparent', padding: 20, marginBottom: 40, backgroundColor: '#eeeeee' }}>
          <View style={{ paddingTop: 20, paddingBottom: 20 }}>
            <RNText style={{ fontFamily: fonts.bold, fontSize: 24, color: '#195E4B' }}>
              When will be my first Doozy visit?
            </RNText>
            <RNText style={{ fontFamily: fonts.bold, fontSize: 15, color: '#999999', lineHeight: 24 }}>
              Your first Doozy visit will be within a week. We’ll text you the exact date, and you can always check your schedule in the app.
            </RNText>
          </View>
          <View style={{ paddingTop: 20, paddingBottom: 20 }}>
            <RNText style={{ fontFamily: fonts.bold, fontSize: 24, color: '#195E4B' }}>
              What about payment?
            </RNText>
            <RNText style={{ fontFamily: fonts.bold, fontSize: 15, color: '#999999', lineHeight: 24 }}>
              You can set up automatic recurring billing through the app after your first month of Doozy. We’ll notify you when your payment is due.
            </RNText>
          </View>
          <Button
            mode="contained"
            buttonColor="#195E4B"   // background color
            textColor="#FFFFFF"     // text color
            onPress={toDoozyDetails}
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
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  regular: { fontFamily: 'InterRegular', fontSize: 18, marginBottom: 12 },
  medium: { fontFamily: 'InterMedium', fontSize: 18, marginBottom: 12 },
  bold: { fontFamily: 'InterBold', fontSize: 18 },
});

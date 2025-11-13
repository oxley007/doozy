import React, { useState } from 'react';
import { View, Text as RNText, ScrollView, StyleSheet, Image } from "react-native";
import { Button } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { styled } from "nativewind";
import { RootState } from "../../store/store";
import { auth } from '../../Firebase/firebaseConfig';
import { sendPasswordResetEmail } from "firebase/auth";

import BottomMenu from '../Menus/BottomMenu';
import fonts from '../../assets/fonts/fonts.js';

const StyledView = styled(View);

export default function PaymentSuccessScreen() {
  const navigation = useNavigation<any>();
  const user = useSelector((state: RootState) => state.user);
  const [resetSent, setResetSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const backToDoozyHome = () => navigation.navigate("DoozyHome");

  const handleResetPassword = async () => {
    try {
      if (!user?.email) {
        setError("No email address found.");
        return;
      }
      await sendPasswordResetEmail(auth, user.email);
      setResetSent(true);
      setError(null);
    } catch (err: any) {
      console.error("Reset password error:", err);
      setError(err.message || "Failed to send reset email.");
    }
  };

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

        <View style={{ justifyContent: 'center', alignItems: 'center', marginBottom: 40 }}>
          <RNText style={{ fontFamily: fonts.bold, fontSize: 32, color: '#195E4B' }}>
            Payment Successful!
          </RNText>
          <RNText style={{ fontFamily: fonts.medium, fontSize: 22, color: '#999999', lineHeight: 22, paddingTop: 20, textAlign: 'center' }}>
            Your payment was successful! We truly appreciate your support and thank you for being a valued customer.
          </RNText>
        </View>

        <Button
          mode="contained"
          buttonColor="#195E4B"   // background color
          textColor="#FFFFFF"     // text color
          onPress={backToDoozyHome}
          style={{ marginTop: 10, marginBottom: 20 }}
        >
          Back Home
        </Button>

        <StyledView style={{ borderRadius: 8, backgroundColor: "#eeeeee", padding: 20 }}>
        <View style={{ alignItems: 'center', marginBottom: 60 }}>
          <RNText style={{ fontFamily: fonts.medium, fontSize: 18, color: '#999999', lineHeight: 18 }}>
            We’ve generated you a random password.
            If you’d like to set your own password, click button below:
          </RNText>
          <Button
            mode="contained"
            onPress={handleResetPassword}
            style={{ backgroundColor: '#195E4B', marginTop: 10 }}
          >
            Reset Password
          </Button>

          {resetSent && (
            <RNText style={{ color: 'green', marginTop: 12, textAlign: 'center' }}>
              Reset password email has been sent to {user.email}. If you don’t see the reset email, please check your spam/junk folder.
            </RNText>
          )}

          {error && (
            <RNText style={{ color: 'red', marginTop: 12, textAlign: 'center' }}>
              {error}
            </RNText>
          )}

        </View>
        </StyledView>
      </ScrollView>

      <BottomMenu />
    </View>
  );
}

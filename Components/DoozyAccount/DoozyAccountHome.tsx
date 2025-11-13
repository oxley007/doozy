import React, { useEffect, useState } from 'react';
import { View, Text as RNText, ScrollView, StyleSheet, Image } from "react-native";
import { Button } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { styled } from "nativewind";
import { RootState } from "../../store/store";
import auth from '@react-native-firebase/auth'; // ✅ RNFirebase

import BottomMenu from '../Menus/BottomMenu';
import CustomerDetailsCard from './CustomerDetailsCard';
import DisplayPreviousPaymentDate from './DisplayPreviousPaymentDate';
import DisplayNextPaymentDate from './DisplayNextPaymentDate';
import { useLogout } from '../DoozyHome/useLogout';
import fonts from '../../assets/fonts/fonts.js';

import { useUserDataListener } from "../../hooks/useUserDataListener";

const StyledView = styled(View);

export default function DoozyAccountHome() {
  useUserDataListener();
  const navigation = useNavigation<any>();
  const user = useSelector((state: RootState) => state.user);
  const logout = useLogout();

  const [resetSent, setResetSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(user => {
      if (user) {
        console.log("User is logged in:", user.uid);
      } else {
        console.log("User not logged in");
      }
    });
    return unsubscribe;
  }, []);

  const handleResetPassword = async () => {
    try {
      if (!user?.email) {
        setError("No email address found.");
        return;
      }
      await auth().sendPasswordResetEmail(user.email); // ✅ RNFirebase method
      setResetSent(true);
      setError(null);
    } catch (err: any) {
      console.error("Reset password error:", err);
      setError(err.message || "Failed to send reset email.");
    }
  };

  const backToCheckAddress = () => navigation.navigate("CheckAddressHome");
  const backConfirmedDetails = () => navigation.navigate("DetailsConfirmed");

  const seeReduxText = () => {
    console.log("Full Redux state:", user);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#E9FCDA', minHeight: '100%' }}>
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
            Your Account.
          </RNText>
          <RNText style={{ fontFamily: fonts.bold, fontSize: 28, color: '#999999', lineHeight: 28, textAlign: 'center' }}>
            Keep your doo on track here!
          </RNText>
        </View>

        <CustomerDetailsCard />
        <DisplayPreviousPaymentDate />

        {/* Reset Password Section */}
        <StyledView style={{ borderRadius: 8, backgroundColor: "#eeeeee", padding: 20, marginBottom: 40 }}>
          <RNText style={{ fontFamily: fonts.bold, fontSize: 24, color: '#195E4B', paddingBottom: 10 }}>
            Reset Password
          </RNText>
          <RNText style={{ fontFamily: fonts.medium, fontSize: 18, color: '#999999', lineHeight: 18 }}>
            If you’d like to reset your password, click below:
          </RNText>
          <Button
            mode="contained"
            buttonColor="#195E4B"   // background color
            textColor="#FFFFFF"     // text color
            onPress={handleResetPassword}
            style={{
              paddingVertical: 12,
              borderRadius: 6,
              marginTop: 25,
            }}
            labelStyle={{
              fontSize: 16,
              fontWeight: '800',
            }}
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
        </StyledView>

        <Button
          mode="contained"
          onPress={logout}
          buttonColor="#195E4B"   // background color
          textColor="#FFFFFF"     // text color
          style={{
            paddingVertical: 12,
            borderRadius: 6,
            marginTop: 25,

          }}
          labelStyle={{
            fontSize: 16,
            fontWeight: '800',
          }}
        >
          Logout
        </Button>

        <View style={{marginBottom: 140}} />

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

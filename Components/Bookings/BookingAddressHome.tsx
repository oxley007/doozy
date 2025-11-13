import React from 'react';
import { View, Text, StyleSheet, Image } from "react-native";
import { Button } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import BookingAddress from './BookingAddress';
import fonts from '../../assets/fonts/fonts.js';
import { useLogout } from '../DoozyHome/useLogout'; // adjust path

export default function BookingAddressHome() {
  const user = useSelector((state: RootState) => state.user);
  const navigation = useNavigation<any>();
  const logout = useLogout();

  const goBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate("SignUpScreen");
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#E9FCDA', minHeight: '100%' }}>
      <KeyboardAwareScrollView
        contentContainerStyle={{ padding: 20 }}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
      >
        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
          <Image
            source={require('../../assets/images/Doozy_dog_logo.png')}
            style={{ width: 325, height: 325 }}
            resizeMode="contain"
          />
        </View>

        <View style={{ justifyContent: 'center', alignItems: 'center', paddingBottom: 40 }}>
          <Text style={{ fontFamily: fonts.bold, fontSize: 32, color: '#195E4B' }}>
            Enter your address
          </Text>
          <Text
            style={{
              fontFamily: fonts.bold,
              fontSize: 28,
              color: '#999999',
              lineHeight: 28,
              textAlign: 'center',
            }}
          >
            Doo we Doozy your area?
          </Text>
        </View>
        <BookingAddress />
        {/* Back Button */}
        <Button
          mode="outlined"
          onPress={goBack}
          style={{
            backgroundColor: '#195E4B',
            marginBottom: 20,
            marginTop: 20,
            borderRadius: 6,
            paddingVertical: 6,
            alignSelf: 'center',
            width: '100%',
          }}
          labelStyle={{
            fontFamily: fonts.medium,
            fontSize: 16,
            color: '#fff',
          }}
        >
          ← Back
        </Button>
      </KeyboardAwareScrollView>

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
});

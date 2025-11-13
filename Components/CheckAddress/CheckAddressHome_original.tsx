import React, { useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Image } from "react-native";
import { Button, Card } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import serviceAreas from '../../data/serviceAreas.json';
import store from "../../store/store";
import { useDispatch, useSelector } from "react-redux";
import { StripeProvider } from '@stripe/stripe-react-native';

import AddressChecker from './AddressChecker'


import { useLogout } from '../DoozyHome/useLogout'; // adjust the path to where your hook is
//import SignUpForm from './SignUpForm';
//import Testimonials from '../Plan/Testimonials';
//

export default function CheckAddressHome() {

  const user = useSelector((state: RootState) => state.user);
  const navigation = useNavigation<any>();

  const fontFamilies = [
  'Inter 24pt Regular',
  'Inter 24pt Medium',
  'Inter 24pt Bold',
  'Inter24pt-Regular',
  'Inter24pt-Medium',
  'Inter24pt-Bold',
  'Inter 24pt',
  'Inter',
];

  const logout = useLogout();


  const seeReduxText = () => {

    //console.log("Full Redux state:", user);
    console.log("Full Redux state:", store.getState().user);

  };


  const backToSignUp = () => {

    navigation.navigate("SignUpScreen");

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
          <Text style={{ fontFamily: 'Inter 24pt Bold', fontSize: 32, color: '#195E4B' }}>Almost there.</Text>
          <Text style={{ fontFamily: 'Inter 24pt Bold', fontSize: 28, color: '#999999', lineHeight: 28, textAlign: 'center' }}>Doo we Doozy your area?</Text>
        </View>

        <StripeProvider publishableKey="pk_test_51RxZIv3KFM9xH4Q6Kyzh1zwDfsPyURbapzZ12YhpVBoWAJs3WpWQYoGKl9YMQH4oZHbnPFnZOm49OI8Xg75qqr3G006x5nAX6D">
          <AddressChecker />
        </StripeProvider>

        <Button
          mode="contained"
          onPress={seeReduxText}
          className="mt-4"
          style={{
            paddingVertical: 12,
            borderRadius: 6,
            marginTop: 25,
            backgroundColor: '#195E4B',
          }}
          labelStyle={{
            fontSize: 16,
            fontWeight: '800',
          }}
        >
          Redux Log.
        </Button>

        <Button
          mode="contained"
          onPress={backToSignUp}
          className="mt-4"
          style={{
            paddingVertical: 12,
            borderRadius: 6,
            marginTop: 25,
            backgroundColor: '#195E4B',
          }}
          labelStyle={{
            fontSize: 16,
            fontWeight: '800',
          }}
        >
          Back to sign up.
        </Button>

        <Button
          mode="contained"
          onPress={logout}
          className="mt-4"
          style={{
            paddingVertical: 12,
            borderRadius: 6,
            marginTop: 25,
            backgroundColor: '#195E4B',
          }}
          labelStyle={{
            fontSize: 16,
            fontWeight: '800',
          }}
        >
          Logout
        </Button>


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

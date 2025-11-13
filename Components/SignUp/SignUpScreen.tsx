import React, { useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Button, Card } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { styled } from "nativewind";

import SignUpForm from './SignUpForm';
import Testimonials from '../Plan/Testimonials';

import fonts from '../../assets/fonts/fonts.js';

const StyledView = styled(View);

export default function HomeScreen() {

  const navigation = useNavigation();

/*
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
*/

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
        <View style={{ justifyContent: 'center', alignItems: 'center', paddingBottom: 30 }}>
          <Text style={{ fontFamily: fonts.bold, fontSize: 32, color: '#195E4B' }}>Sign up.</Text>
          <Text style={{ fontFamily: fonts.bold, fontSize: 28, color: '#999999', lineHeight: 28, textAlign: 'center' }}>Go on, doo it. Be a Doozy!</Text>
        </View>
        <TouchableOpacity
          style={{
            flexDirection: "row",
            alignItems: "center",
            //marginTop: 20,
            marginBottom: 10,
            padding: 20,
            maxWidth: "100%",
          }}
          onPress={() => navigation.navigate("MeetAndrewScreen")}
        >
          <Image
            source={require("../../assets/images/andrew.jpg")}
            style={{ width: 50, height: 50, borderRadius: 25, marginRight: 10 }}
          />
          <Text style={{ flex: 1, fontFamily: fonts.medium, fontSize: 15, color: "#195E4B" }}>
            You will be serviced by <Text style={{ fontWeight: "bold" }}>Andrew</Text> — read more in{' '}
            <Text style={{ textDecorationLine: 'underline' }}>his profile</Text>
          </Text>
        </TouchableOpacity>
        <SignUpForm />
        <StyledView style={styles.card}>
          <View style={{ justifyContent: 'center', alignItems: 'center', marginBottom: 20 }}>
            <Text style={{ fontFamily: fonts.bold, fontSize: 24, color: '#195E4B', marginBottom: 10 }}>
              Already Signed Up? Login!
            </Text>
            <Text style={{ fontFamily: fonts.medium, fontSize: 18, color: '#666666', lineHeight: 24, textAlign: 'center', paddingHorizontal: 20 }}>
              If you have already signed up and want to log in, click the button below to go to the login page.
            </Text>
          </View>
          <Button
            mode="contained"
            buttonColor="#195E4B"   // background color
            textColor="#FFFFFF"     // text color
            style={{
              fontFamily: fonts.medium,
              width: '100%',
              borderRadius: 5,
              marginTop: 20,
            }}
            onPress={() => navigation.navigate("LoginScreen", { returnScreen: "SignUpScreen" })}
          >
            Go to login page
          </Button>
        </StyledView>
        <Testimonials />
        <Button
          mode="text"
          onPress={() => navigation.navigate("Home")}
          labelStyle={{
            textDecorationLine: "underline",
            fontSize: 16,
            color: "#195E4B", // optional custom color
          }}
          style={{marginBottom: 60}}
        >
          Back to plans
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
  card: {
    borderRadius: 8,
    elevation: 0,
    shadowColor: "transparent",
    padding: 20,
    marginBottom: 40,
    backgroundColor: "#eeeeee",
  },
});

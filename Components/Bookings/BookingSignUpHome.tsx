import React, { useEffect, useState, useRef  } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Button } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { styled } from "nativewind";
import { useSelector } from 'react-redux';
import auth from '@react-native-firebase/auth';

import BookingTypeSelector from './BookingTypeSelector';
import Testimonials from '../Plan/Testimonials';

import fonts from '../../assets/fonts/fonts.js';

const StyledView = styled(View);

export default function BookingSignUpHome() {
  const navigation = useNavigation();
  const scrollViewRef = useRef<ScrollView>(null);
  const userState = useSelector((state) => state.user);
  const [firebaseLoggedIn, setFirebaseLoggedIn] = useState(false);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged((user) => {
      setFirebaseLoggedIn(!!user);
    });
    return unsubscribe;
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: '#E9FCDA' }}>
      <ScrollView
        ref={scrollViewRef}
        style={{ padding: 20 }}
        contentContainerStyle={{ paddingBottom: 80 }} // avoids buttons getting cut off
      >
        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
          <Image
            source={require('../../assets/images/Doozy_dog_logo.png')}
            style={{ width: 325, height: 325 }}
            resizeMode="contain"
          />
        </View>

        <View style={{ justifyContent: 'center', alignItems: 'center', paddingBottom: 30 }}>
          <Text style={{ fontFamily: fonts.bold, fontSize: 32, color: '#195E4B' }}>Instant Quote</Text>
          <Text style={{ fontFamily: fonts.bold, fontSize: 28, color: '#999999', lineHeight: 28, textAlign: 'center' }}>
            Go on, doo it. Get a quote and book today!
          </Text>
        </View>

        {/* Only show login prompt if user is NOT logged in in Firebase */}
        {!firebaseLoggedIn && (
          <StyledView style={styles.card}>
            <View style={{ justifyContent: 'center', alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ fontFamily: fonts.bold, fontSize: 24, color: '#195E4B', marginBottom: 10, textAlign: 'center' }}>
                Already booked with us before? Log in first!
              </Text>
              <Text style={{ fontFamily: fonts.medium, fontSize: 18, color: '#666666', lineHeight: 24, textAlign: 'center', paddingHorizontal: 20 }}>
                If you’ve booked with Doozy before, log in to quickly fill out your profile and continue.
              </Text>
            </View>
            <Button
              mode="contained"
              buttonColor="#195E4B"
              textColor="#FFFFFF"
              style={{
                fontFamily: fonts.medium,
                width: '100%',
                borderRadius: 5,
              }}
              onPress={() => navigation.navigate("LoginScreen", { returnScreen: "SignUpScreen" })}
            >
              Go to Login Page
            </Button>
            <Text style={{ fontFamily: fonts.bold, fontSize: 24, color: '#195E4B', marginBottom: 10, marginTop: 20, textAlign: 'center' }}>
            Otherwise, continue below to create your first booking.
            </Text>
          </StyledView>
        )}

        <StyledView style={{ borderRadius: 5, padding: 20, marginBottom: 40, backgroundColor: "#eeeeee" }}>
          <BookingTypeSelector scrollViewRef={scrollViewRef} />
        </StyledView>

        <Button
          mode="text"
          onPress={() => navigation.navigate("Home")}
          labelStyle={{
            textDecorationLine: "underline",
            fontSize: 16,
            color: "#195E4B",
          }}
          style={{ marginBottom: 10 }}
        >
          Back
        </Button>

        <Testimonials />


        <Button
          mode="text"
          onPress={() => navigation.goBack()}
          labelStyle={{
            textDecorationLine: "underline",
            fontSize: 16,
            color: "#195E4B",
          }}
          style={{ marginBottom: 60 }}
        >
          Doozy Home
        </Button>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 8,
    elevation: 0,
    shadowColor: "transparent",
    padding: 20,
    marginBottom: 40,
    backgroundColor: "#eeeeee",
  },
});

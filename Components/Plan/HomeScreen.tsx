import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, ActivityIndicator, StyleSheet, Alert } from "react-native";
import { styled } from "nativewind";
import { useNavigation } from "@react-navigation/native";
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { useDispatch } from 'react-redux';
import { setUser, setUserDetails } from '../../store/authSlice';
import { Button } from "react-native-paper";

import PlanScreen from './PlanScreen';
import DogWalkPlanScreen from './DogWalkPlanScreen';
import CombinedPlanScreen from './CombinedPlanScreen';
import FAQAccordion from './FAQAccordion';
import WhatsIncludeAndWhy from './WhatsIncludeAndWhy';
import Testimonials from './Testimonials';
import OneOffPickupAccordion from './OneOffPickupAccordion';
import OneOffDogWalkAccordion from './OneOffDogWalkAccordion';
import fonts from '../../assets/fonts/fonts.js';

const StyledView = styled(View);

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [hasNavigated, setHasNavigated] = useState(false); // prevent multiple navigations

  useEffect(() => {
    let isMounted = true; // prevents setState on unmounted component

    const fetchUserData = async (uid: string) => {
      try {
        const userDoc = await firestore().collection('users').doc(uid).get();
        if (userDoc.exists && isMounted) {
          const userData = userDoc.data();
          dispatch(setUserDetails(userData));
          dispatch(setUser({ uid, email: auth().currentUser?.email || '', profile: userData }));
        }
      } catch (fireErr) {
        console.error("Firestore fetch failed:", fireErr);
        Alert.alert("Data Error", "Failed to fetch user data. Please try again.");
      }
    };

    const unsubscribe = auth().onAuthStateChanged((user) => {
      if (user && !hasNavigated && isMounted) {
        setHasNavigated(true);

        // Navigation reset
        setTimeout(() => {
          try {
            navigation.reset({
              index: 0,
              routes: [{ name: 'DoozyHome' }],
            });
          } catch (navErr) {
            console.error("Navigation reset failed:", navErr);
            Alert.alert("Navigation Error", "Failed to reset navigation stack. Please try again.");
          }
        }, 300);

        // Firestore fetch
        fetchUserData(user.uid);
      } else if (!user && isMounted) {
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [dispatch, navigation, hasNavigated]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#195E4B" />
      </View>
    );
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

        <View style={{ justifyContent: 'center', alignItems: 'center', marginBottom: 40 }}>
          <Text style={{ fontFamily: fonts.bold, fontSize: 32, color: '#195E4B' }}>Pick your plan..</Text>
          <Text style={{ fontFamily: fonts.bold, fontSize: 28, color: '#999999', lineHeight: 28, textAlign: 'center' }}>
            From doggy walks to dirty doo. We doo the work!
          </Text>
        </View>

        <StyledView style={{ borderRadius: 5, padding: 20, marginBottom: 40, backgroundColor: "#eeeeee" }}>
          <View style={{ paddingTop: 20, paddingBottom: 40 }}>
            <Text style={{ fontFamily: fonts.bold, fontSize: 32, color: '#195E4B' }}>
              One-Off Options
            </Text>
            <Text
              style={{
                fontFamily: fonts.bold,
                fontSize: 18,
                color: "#999",
                lineHeight: 24,
                marginTop: 10,
              }}
            >
              We’re flexible — book a one-off dog poop pickup or a 30-minute street walk whenever you need!
            </Text>
            <Text
              style={{
                fontFamily: fonts.bold,
                fontSize: 18,
                color: "#999",
                lineHeight: 24,
                marginTop: 10,
              }}
            >
              Or see further below to{' '}
              <Text style={{ backgroundColor: 'yellow', fontWeight: 'bold' }}>
                save up to 70%
              </Text>{' '}
               by subscribing to our doggy doo pickup or dog walking services!
            </Text>
          </View>
          <OneOffPickupAccordion />
          <OneOffDogWalkAccordion />
        </StyledView>

        <StyledView style={{ borderRadius: 5, padding: 20, marginBottom: 40, backgroundColor: "#eeeeee" }}>
          <DogWalkPlanScreen />
          <PlanScreen />
          <CombinedPlanScreen />
        </StyledView>

        <WhatsIncludeAndWhy />
        <Testimonials />
        <FAQAccordion />

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
            onPress={() => navigation.navigate("LoginScreen", { returnScreen: "Home" })}
          >
            Go to login page
          </Button>
        </StyledView>
        <View style={{ marginBottom: 180 }} />
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

import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ScrollView, Image, ActivityIndicator, StyleSheet, Alert, Animated, Dimensions } from "react-native";
import { styled } from "nativewind";
import { useNavigation } from "@react-navigation/native";
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { useDispatch } from 'react-redux';
import { setUser, setUserDetails } from '../../store/authSlice';
import { Button } from "react-native-paper";
import * as Animatable from 'react-native-animatable';

import PlanScreen from './PlanScreen';
import DogWalkPlanScreen from './DogWalkPlanScreen';
import CombinedPlanScreen from './CombinedPlanScreen';
import FAQAccordion from './FAQAccordion';
import WhatsIncludeAndWhy from './WhatsIncludeAndWhy';
import Testimonials from './Testimonials';
import OneOffPickupAccordion from './OneOffPickupAccordion';
import OneOffDogWalkAccordion from './OneOffDogWalkAccordion';
import FadeInOutSection from '../Fade/FadeInOutSection';
import createFadeInOnScroll from '../Fade/FadeInOnScroll';
import fonts from '../../assets/fonts/fonts.js';

const StyledView = styled(View);

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const scrollRef = useRef<ScrollView>(null);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [hasNavigated, setHasNavigated] = useState(false);

  // scrollY for fade-on-scroll
  const scrollY = useRef(new Animated.Value(0)).current;

  // Generate the component with scrollY injected
  const FadeInOnScroll = createFadeInOnScroll(scrollY);

  // Auth + fetch user
  useEffect(() => {
    let isMounted = true;

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
      <Animated.ScrollView
        ref={scrollRef}
        style={{ padding: 20 }}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
      >
        {/* Logo */}
        <FadeInOutSection delay={100}>
          <View style={{ justifyContent: 'center', alignItems: 'center', paddingTop: 40 }}>
            <Image
              source={require('../../assets/images/doozy_nz_app_logo_web.png')}
              style={{ width: 225, height: 225 }}
              resizeMode="contain"
            />
          </View>
        </FadeInOutSection>

        <FadeInOutSection delay={300}>
          <Text style={{ fontFamily: fonts.bold, fontSize: 32, color: '#195E4B', textAlign: 'center' }}>
            Pick your plan.
          </Text>
          <Text style={{ fontFamily: fonts.bold, fontSize: 28, color: '#999999', lineHeight: 28, textAlign: 'center', paddingBottom: 40 }}>
            From doggy walks to dirty doo. We doo the work!
          </Text>
        </FadeInOutSection>

        {/* One-Off Options */}
          <FadeInOutSection delay={600}>
            <StyledView style={{ borderRadius: 5, padding: 20, marginBottom: 40, backgroundColor: "#eeeeee" }}>
            <View style={{ paddingTop: 20, paddingBottom: 40 }}>
              <Text style={{ fontFamily: fonts.bold, fontSize: 32, color: '#195E4B' }}>
                One-Off Options
              </Text>
              <Text style={{ fontFamily: fonts.bold, fontSize: 18, color: "#999", lineHeight: 24, marginTop: 10 }}>
                We’re flexible — book a one-off dog poop pickup or a 30-minute street walk whenever you need!
              </Text>
              <Text style={{ fontFamily: fonts.bold, fontSize: 18, color: "#999", lineHeight: 24, marginTop: 10 }}>
                Or see further below to{' '}
                <Text style={{ color: '#333', fontWeight: 'bold' }}>
                  save up to 70%
                </Text>{' '}
                 by subscribing to our doggy doo pickup or dog walking services!
              </Text>
            </View>
              <OneOffPickupAccordion />
              <OneOffDogWalkAccordion />
            </StyledView>
          </FadeInOutSection>


        {/* Plans */}
        <FadeInOnScroll>
          <StyledView style={{ borderRadius: 5, padding: 20, marginBottom: 40, backgroundColor: "#eeeeee" }}>
            <DogWalkPlanScreen scrollY={scrollY} />
            <PlanScreen />
            <CombinedPlanScreen />
          </StyledView>
        </FadeInOnScroll>

        {/* Extras */}
        <FadeInOnScroll>
          <WhatsIncludeAndWhy />
        </FadeInOnScroll>
        <FadeInOnScroll>
          <Testimonials />
        </FadeInOnScroll>
        <FadeInOnScroll>
          <FAQAccordion />
        </FadeInOnScroll>

        {/* Login Card */}
        <StyledView style={styles.card}>
          <View style={{ justifyContent: 'center', alignItems: 'center', marginBottom: 20 }}>
            <Text style={{ fontFamily: fonts.bold, fontSize: 24, color: '#195E4B', marginBottom: 10 }}>
              Already Signed Up? Login!
            </Text>
          </View>
          <Button
            mode="contained"
            buttonColor="#195E4B"
            textColor="#FFFFFF"
            style={{ fontFamily: fonts.medium, width: '100%', borderRadius: 5, marginTop: 20 }}
            onPress={() => navigation.navigate("LoginScreen", { returnScreen: "Home" })}
          >
            Go to login page
          </Button>
        </StyledView>

        <View style={{ marginBottom: 180 }} />
      </Animated.ScrollView>
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

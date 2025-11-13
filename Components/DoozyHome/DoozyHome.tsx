import React, { useEffect } from 'react';
import { View, Text as RNText, ScrollView, StyleSheet, Image, Linking } from "react-native";
import { Button } from "react-native-paper";
import { useNavigation, useNavigationContainerRef } from "@react-navigation/native";
import { useSelector, useDispatch } from "react-redux";
import { styled } from "nativewind";
import { RootState, setUserDetails } from "../../store/store";
import { setBookings } from "../../store/bookingSlice";
//import { auth } from '../../Firebase/firebaseConfig';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';


import DoozyNextPickup from './DoozyNextPickup';
import DoozyNextSixPickups from './DoozyNextSixPickups';
import NextPaymentDue from './NextPaymentDue';
import BookingDetails from './BookingDetails';
import BottomMenu from '../Menus/BottomMenu';
import AdminBottomMenu from '../Menus/AdminBottomMenu';
import PaymentRequiredBox from './PaymentRequiredBox';
import SetupRequiredBox from './SetupRequiredBox';
import SoilTestGraph from '../SoilTest/SoilTestGraph';
import UserServiceNotes from '../ServiceNotes/UserServiceNotes';
import LawnSaverCard from '../WaterRoutine/LawnSaverCard';
import PickupGraph from '../PickUpCount/PickupGraph';
import OneOffDogWalkAccordion from '../Plan/OneOffDogWalkAccordion';
import PlanScreen from '../Plan/PlanScreen';
import DogWalkPlanScreen from '../Plan/DogWalkPlanScreen';
import CombinedPlanScreen from '../Plan/CombinedPlanScreen';
import OneOffPickupAccordion from '../Plan/OneOffPickupAccordion';

import fonts from '../../assets/fonts/fonts.js';

import { useLogout } from './useLogout';

const StyledView = styled(View);

// Define Premium plans
const premiumPlans = [
  "Twice a week Premium",
  "Once a week Premium Friday",
  "Once a week Premium"
];

const dooPickupPlans = [
  "Twice a week Premium",
  "Once a week Premium Friday",
  "Once a week Premium",
  "Twice a week Artificial Grass",
  "Once a week Artificial Grass",
  "Twice a week",
  "Once a week Friday",
  "Once a week"
];


export default function DoozyHome() {
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  const navigationRef = useNavigationContainerRef();
  const user = useSelector((state: RootState) => state.user);
  const logout = useLogout();
  const currentUser = auth().currentUser;

  useEffect(() => {
      const handleUrl = (event: { url: string }) => {
        const url = event.url;
        if (!navigationRef.isReady()) return;

        if (url.includes('payment-success')) navigationRef.navigate('PaymentSuccessScreen');
        if (url.includes('payment-cancel')) navigationRef.navigate('PaymentCancelScreen');
      };

      const subscription = Linking.addEventListener('url', handleUrl);

      Linking.getInitialURL().then(url => {
        if (!url || !navigationRef.isReady()) return;
        if (url.includes('payment-success')) navigationRef.navigate('PaymentSuccessScreen');
        if (url.includes('payment-cancel')) navigationRef.navigate('PaymentCancelScreen');
      });

      return () => subscription.remove();
    }, [navigationRef]);

  useEffect(() => {
      const logIdToken = async () => {
        const user = auth().currentUser;
        if (user) {
          const idToken = await user.getIdToken();
          console.log('Firebase ID Token:', idToken);
        } else {
          console.log('No user is signed in.');
        }
      };

      logIdToken();
    }, []);

  useEffect(() => {
    const checkAdminRole = async () => {
      const currentUser = auth().currentUser;
      if (!currentUser) return;

      try {
        const userDoc = await firestore()
          .collection('users')
          .doc(currentUser.uid)
          .get();

        if (userDoc.exists) {
          const userData = userDoc.data();
          // check if role is admin
          const isAdmin = userData?.role === 'admin';

          // update Redux store with role info
          dispatch(setUserDetails({ ...userData, isAdmin }));
        }
      } catch (err) {
        console.error("Error checking admin role:", err);
      }
    };

    checkAdminRole();
  }, [dispatch]);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(user => {
      if (user) console.log("User is logged in:", user.uid);
      else console.log("User not logged in");
    });
    return unsubscribe;
  }, []);

  const backToCheckAddress = () => navigation.navigate("CheckAddressHome");
  const backToAddressCheckerMinimal = () => navigation.navigate("AddressCheckerMinimal");
  const doozyAdminScreen = () => navigation.navigate("AdminHome");
  const backConfirmedDetails = () => navigation.navigate("DetailsConfirmed");
  const paymentSuccessScreen = () => navigation.navigate("PaymentSuccessScreen");
  const paymentCancelScreen = () => navigation.navigate("PaymentCancelScreen");
  const backToSignUp = () => navigation.navigate("SignUpScreen");

  const seeReduxText = () => {
    console.log("Full Redux state:", user);
  };

  const updateBookingsFromFirebase = async () => {
      const user = auth().currentUser;
      if (!user) {
        Alert.alert("Error", "No logged-in user.");
        return;
      }

      //setLoading(true);

      try {
        const userSnap = await firestore().collection("users").doc(user.uid).get();
        if (!userSnap.exists) {
          Alert.alert("Error", "User document not found in Firebase.");
          //setLoading(false);
          return;
        }

        const userData = userSnap.data() || {};
        const firebaseBookings = Array.isArray(userData.booking) ? userData.booking : [];

        console.log("Firebase bookings:", firebaseBookings);

        dispatch(setBookings(firebaseBookings));
        Alert.alert("Success", "Bookings updated from Firebase!");
      } catch (err: any) {
        console.error("Failed to update bookings:", err);
        Alert.alert("Error", err.message || "Failed to fetch bookings.");
      } finally {
        //setLoading(false);
      }
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
            Your Doozy!
          </RNText>
          <RNText style={{ fontFamily: fonts.bold, fontSize: 28, color: '#999999', lineHeight: 28, textAlign: 'center' }}>
            All the doo you need to know!
          </RNText>
        </View>

        <SetupRequiredBox />

        <PaymentRequiredBox />

        <BookingDetails />

        {user.subscription && (
          <DoozyNextSixPickups mode="next" />
        )}

        {user.subscription && (
          <DoozyNextSixPickups subscription={user.subscription} />
        )}


          <StyledView style={{ borderRadius: 5, padding: 20, marginBottom: 40, backgroundColor: "#eeeeee" }}>
            <View style={{ paddingTop: 20, paddingBottom: 40 }}>
              <RNText style={{ fontFamily: fonts.bold, fontSize: 24, color: "#195E4B" }}>
                Busy week? Book a 30min Dog Walk or Waste Removal!
              </RNText>
              <RNText
                style={{
                  fontFamily: fonts.bold,
                  fontSize: 18,
                  color: "#999",
                  lineHeight: 24,
                  marginTop: 10,
                }}
              >
                Book a one-off 30-minute street walk or waste removal whenever you need!
              </RNText>
              <RNText
                style={{
                  fontFamily: fonts.bold,
                  fontSize: 18,
                  color: "#999",
                  lineHeight: 24,
                  marginTop: 10,
                }}
              >
                Or see further below to{' '}
                <RNText style={{ backgroundColor: 'yellow', fontWeight: 'bold' }}>
                  save up to 70%
                </RNText>{' '}
                 by also subscribing to our dog walking services!
              </RNText>
            </View>
            <OneOffDogWalkAccordion />
            <OneOffPickupAccordion />
          </StyledView>

          <StyledView style={{ borderRadius: 5, padding: 20, marginBottom: 40, backgroundColor: "#eeeeee" }}>
            <DogWalkPlanScreen />
            <PlanScreen />
            <CombinedPlanScreen />
          </StyledView>


        <StyledView style={{ borderRadius: 5, padding: 20, marginBottom: 40, backgroundColor: "#eeeeee" }}>
          <UserServiceNotes userId={currentUser?.uid} />
        </StyledView>

        <StyledView style={{ borderRadius: 5, padding: 20, marginBottom: 40, backgroundColor: "#eeeeee" }}>
          <PickupGraph userId={currentUser?.uid} />
        </StyledView>

        {
          /*
          <View>
        {premiumPlans.includes(user.subscription?.plan) && (
          <>
            <StyledView style={{ borderRadius: 5, padding: 20, marginBottom: 40, backgroundColor: "#eeeeee" }}>
              <SoilTestGraph userId={currentUser?.uid} />
            </StyledView>

            <StyledView style={{ borderRadius: 5, padding: 20, marginBottom: 40, backgroundColor: "#eeeeee" }}>
              <LawnSaverCard />
            </StyledView>
          </>
        )}
        </View>
        */
        }

        {user.isAdmin &&
          <View>
        <Button
          mode="contained"
          onPress={seeReduxText}
          style={{
            paddingVertical: 12,
            borderRadius: 6,
            marginTop: 25,
            backgroundColor: '#195E4B',
          }}
          labelStyle={{ fontSize: 16, fontWeight: '800' }}
        >
          Redux Log
        </Button>

        <Button
          mode="contained"
          onPress={logout}
          style={{
            paddingVertical: 12,
            borderRadius: 6,
            marginTop: 25,
            backgroundColor: '#195E4B',
          }}
          labelStyle={{ fontSize: 16, fontWeight: '800' }}
        >
          Logout
        </Button>

        <Button
          mode="text"
          onPress={backConfirmedDetails}
          style={{ marginTop: 25 }}
          labelStyle={{
            fontSize: 16,
            fontWeight: '400',
            color: '#195E4B',
            textDecorationLine: 'underline',
          }}
        >
          Confirmed Details page
        </Button>

        <Button
          mode="text"
          onPress={paymentSuccessScreen}
          style={{ marginTop: 25 }}
          labelStyle={{
            fontSize: 16,
            fontWeight: '400',
            color: '#195E4B',
            textDecorationLine: 'underline',
          }}
        >
          Payment Success Screen
        </Button>

        <Button
          mode="text"
          onPress={paymentCancelScreen}
          style={{ marginTop: 25 }}
          labelStyle={{
            fontSize: 16,
            fontWeight: '400',
            color: '#195E4B',
            textDecorationLine: 'underline',
          }}
        >
          Payment Cancel Screen
        </Button>

        <Button
          mode="contained"
          onPress={backToSignUp}
          style={{
            paddingVertical: 12,
            borderRadius: 6,
            marginTop: 25,
            backgroundColor: '#195E4B',
          }}
          labelStyle={{ fontSize: 16, fontWeight: '800' }}
        >
          Back to sign up
        </Button>

        <Button
          mode="text"
          onPress={backToCheckAddress}
          style={{ marginTop: 25 }}
          labelStyle={{
            fontSize: 16,
            fontWeight: '400',
            color: '#195E4B',
            textDecorationLine: 'underline',
          }}
        >
          Change address
        </Button>

          <Button
            mode="contained"
            onPress={doozyAdminScreen}
            style={{
              paddingVertical: 12,
              borderRadius: 6,
              marginTop: 25,
              backgroundColor: '#195E4B',
            }}
            labelStyle={{ fontSize: 16, fontWeight: '800' }}
          >
            Doozy Admin
          </Button>
          </View>
        }

        <View style={{paddingBottom: 180}} />
      </ScrollView>
      <AdminBottomMenu />
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
  regular: { fontFamily: 'InterRegular', fontSize: 18, marginBottom: 12 },
  medium: { fontFamily: 'InterMedium', fontSize: 18, marginBottom: 12 },
  bold: { fontFamily: 'InterBold', fontSize: 18 },
});

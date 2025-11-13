import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';

import HomeScreen from '../Components/Plan/HomeScreen.tsx';
import SignUpScreen from '../Components/SignUp/SignUpScreen.tsx';
import CheckAddressHome from '../Components/CheckAddress/CheckAddressHome.tsx';
import ThankYou from '../Components/ThankYou/ThankYou.tsx';
import DoozyHome from '../Components/DoozyHome/DoozyHome.tsx';
import DetailsConfirmed from '../Components/ThankYou/DetailsConfirmed.tsx';
import VisitConfirmed from '../Components/ThankYou/VisitConfirmed.tsx'
import DoozyAccountHome from '../Components/DoozyAccount/DoozyAccountHome.tsx';
import PaymentSuccessScreen from '../Components/DoozyHome/PaymentSuccessScreen.tsx';
import PaymentCancelScreen from '../Components/DoozyHome/PaymentCancelScreen.tsx';
import DoozyInfoHome from '../Components/DoozyInfo/DoozyInfoHome.tsx';
import LoginScreen from '../Components/SignIn/LoginScreen.tsx';
import Terms from '../Components/SignUp/Terms.tsx';
import AdminHome from '../Components/Admin/AdminHome.tsx';
import WeeklyPickups from '../Components/Admin/WeeklyPickups.tsx';
import UserNextSixPickups from '../Components/Admin/UserNextSixPickups.tsx';
import UsersHome from '../Components/Admin/UsersHome.tsx';
import AddSoilTest from '../Components/SoilTest/AddSoilTest.tsx';
import SoilInfo from '../Components/SoilTest/SoilInfo.tsx';
import AddUserServiceNotes from '../Components/ServiceNotes/AddUserServiceNotes.tsx';
import EditUserServiceNote from '../Components/ServiceNotes/EditUserServiceNote.tsx';
import LawnSaverRoutine from '../Components/WaterRoutine/LawnSaverRoutine.tsx';
import EditOverrides from '../Components/Admin/EditOverrides.tsx';
import AddressCheckerMinimal from '../Components/CheckAddress/AddressCheckerMinimal.tsx';
import AddPickupCount from '../Components/PickUpCount/AddPickupCount.tsx'
import MeetAndrewScreen from '../Components/MeetAndrew/MeetAndrewScreen.tsx'
import BookingAddressHome from '../Components/Bookings/BookingAddressHome.tsx'
import BookingSignUpHome from '../Components/Bookings/BookingSignUpHome.tsx'
import EmployeeBookingDetails from '../Components/AdminBookings/EmployeeBookingDetails.tsx'
import PaymentSuccessBookingScreen from '../Components/Bookings/PaymentSuccessBookingScreen.tsx'
import { Linking } from 'react-native';

const linking = {
  prefixes: ['doozy://'],
  config: {
    screens: {
      PaymentSuccessScreen: 'payment-success-web',
      PaymentCancelScreen: 'payment-cancel',
      PaymentSuccessBookingScreen: 'payment-success-booking',
      BookingSignUpHome: 'booking-Signup',
    },
  },
};

const Stack = createNativeStackNavigator();

export default function MainNavigator() {
  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'Doozy Home', headerShown: false }}
        />
        <Stack.Screen
          name="SignUpScreen"
          component={SignUpScreen}
          options={{ title: 'Sign Up to Doozy', headerShown: false }}
        />
        <Stack.Screen
          name="CheckAddressHome"
          component={CheckAddressHome}
          options={{ title: 'Check Address - Doozy', headerShown: false }}
        />
        <Stack.Screen
          name="ThankYou"
          component={ThankYou}
          options={{ title: 'Thank You! - Doozy', headerShown: false }}
        />
        <Stack.Screen
          name="DoozyHome"
          component={DoozyHome}
          options={{ title: 'Your Doozy!', headerShown: false }}
        />
        <Stack.Screen
          name="DetailsConfirmed"
          component={DetailsConfirmed}
          options={{ title: 'Details Confirmed!', headerShown: false }}
        />
        <Stack.Screen
          name="VisitConfirmed"
          component={VisitConfirmed}
          options={{ title: 'Visit Confirmed!', headerShown: false }}
        />
        <Stack.Screen
          name="DoozyAccountHome"
          component={DoozyAccountHome}
          options={{ title: 'Doozy Account!', headerShown: false }}
        />
        <Stack.Screen
          name="PaymentSuccessScreen"
          component={PaymentSuccessScreen}
          options={{ title: 'Doozy Payment Success!', headerShown: false }}
        />
        <Stack.Screen
          name="PaymentCancelScreen"
          component={PaymentCancelScreen}
          options={{ title: 'Doozy Payment Cancelled!', headerShown: false }}
        />
        <Stack.Screen
          name="DoozyInfoHome"
          component={DoozyInfoHome}
          options={{ title: 'Doozy Info!', headerShown: false }}
        />
        <Stack.Screen
          name="LoginScreen"
          component={LoginScreen}
          options={{ title: 'Doozy Login!', headerShown: false }}
        />
        <Stack.Screen
          name="Terms"
          component={Terms}
          options={{ title: 'Doozy Terms & Conditions!', headerShown: false }}
        />
        <Stack.Screen
          name="AdminHome"
          component={AdminHome}
          options={{ title: 'Doozy Admin!', headerShown: false }}
        />
        <Stack.Screen
          name="WeeklyPickups"
          component={WeeklyPickups}
          options={{ title: 'Weekly Pickups!', headerShown: false }}
        />
        <Stack.Screen
          name="UserNextSixPickups"
          component={UserNextSixPickups}
          options={{ title: 'User Info!', headerShown: false }}
        />
        <Stack.Screen
          name="UsersHome"
          component={UsersHome}
          options={{ title: 'Doozy Users!', headerShown: false }}
        />
        <Stack.Screen
          name="AddSoilTest"
          component={AddSoilTest}
          options={{ title: 'Add Soil Test!', headerShown: false }}
        />
        <Stack.Screen
          name="SoilInfo"
          component={SoilInfo}
          options={{ title: 'Soil Info!', headerShown: false }}
        />
        <Stack.Screen
          name="AddUserServiceNotes"
          component={AddUserServiceNotes}
          options={{ title: 'Add User Service Notes!', headerShown: false }}
        />
        <Stack.Screen
          name="EditUserServiceNote"
          component={EditUserServiceNote}
          options={{ title: 'Edit User Service Note!', headerShown: false }}
        />
        <Stack.Screen
          name="LawnSaverRoutine"
          component={LawnSaverRoutine}
          options={{ title: 'Doozy Lawn Saver Routine!', headerShown: false }}
        />
        <Stack.Screen
          name="EditOverrides"
          component={EditOverrides}
          options={{ title: 'Edit Overrides!', headerShown: false }}
        />
        <Stack.Screen
          name="AddressCheckerMinimal"
          component={AddressCheckerMinimal}
          options={{ title: 'Address Checker Minimal!', headerShown: false }}
        />
        <Stack.Screen
          name="AddPickupCount"
          component={AddPickupCount}
          options={{ title: 'Add Pickup Count!', headerShown: false }}
        />
        <Stack.Screen
          name="MeetAndrewScreen"
          component={MeetAndrewScreen}
          options={{ title: 'Meet Andrew!', headerShown: false }}
        />
        <Stack.Screen
          name="BookingAddressHome"
          component={BookingAddressHome}
          options={{ title: 'Enter Address!', headerShown: false }}
        />
        <Stack.Screen
          name="BookingSignUpHome"
          component={BookingSignUpHome}
          options={{ title: 'Booking Quote!', headerShown: false }}
        />
        <Stack.Screen
          name="EmployeeBookingDetails"
          component={EmployeeBookingDetails}
          options={{ title: 'Employee Booking Details!', headerShown: false }}
        />
        <Stack.Screen
          name="PaymentSuccessBookingScreen"
          component={PaymentSuccessBookingScreen}
          options={{ title: 'Payment Success Booking Screen!', headerShown: false }}
        />

        {/* Add other screens here */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

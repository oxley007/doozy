import React, { useState } from 'react';
import { View, Text as RNText } from 'react-native';
import { getDistance } from 'geolib';
import serviceAreas from '../../data/serviceAreas.json';
import { useDispatch, useSelector } from 'react-redux';
import { setUserDetails } from '../../store/store';
import { RootState } from '../../store/store';
import { styled } from 'nativewind';
import { useNavigation } from '@react-navigation/native';
import { Button } from 'react-native-paper';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import fonts from '../../assets/fonts/fonts.js';
import AddressAutocomplete from './AddressAutocomplete'; // ✅ import the new component

const StyledView = styled(View);

export default function AddressChecker() {
  const [serviceable, setServiceable] = useState<null | boolean>(null);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  const user = useSelector((state: RootState) => state.user);

  const checkService = (lat: number, lng: number) => {
    const matchedArea = serviceAreas.find(area => {
      const distance = getDistance(
        { latitude: lat, longitude: lng },
        { latitude: area.lat, longitude: area.lng }
      );
      return distance / 1000 <= area.radiusKm;
    });

    if (!matchedArea) {
      setServiceable(false);
      return null;
    }

    setServiceable(true);
    return matchedArea; // includes name, code, central etc.
  };

  const saveAddress = async (formattedAddress: string, lat: number, lng: number) => {
    if (!user?.uid) return;

    const matchedArea = checkService(lat, lng);

    const addressObj = {
      formattedAddress,
      lat,
      lng,
      serviceable: !!matchedArea,
      central: matchedArea?.central ?? false,
      code: matchedArea?.code || null, // ✅ new field
    };

    try {
      await firestore().collection('users').doc(user.uid).update({
        address: addressObj,
      });
      dispatch(setUserDetails({ address: addressObj }));
      console.log('Address saved to Redux:', addressObj);
    } catch (err: any) {
      console.error('Failed to save address:', err);
      alert('Failed to save address: ' + (err.message || 'Unknown error'));
    }
  };

  const goToDoozyHome = () => navigation.navigate('DoozyHome');

  const submitUserToSubscription = async () => {
    if (!user?.uid || !user.subscription) return;
    setLoading(true);

    try {
      const currentUser = auth().currentUser;
      if (!currentUser) throw new Error("No authenticated user");
      const idToken = await currentUser.getIdToken(true);

      const rawTrial = user.subscription.trialUntil;
      if (!rawTrial) throw new Error("Trial until missing");
      const trialUntil = rawTrial.seconds ? new Date(rawTrial.seconds * 1000) : new Date(rawTrial);
      const trialUntilSeconds = Math.floor(trialUntil.getTime() / 1000);

      const subscriptionPlan = user.subscription.plan;
      if (!subscriptionPlan) throw new Error("Plan not set");

      // ✅ Include name and email explicitly
      const requestBody = {
        subscriptionName: subscriptionPlan,
        firstPaymentTimestamp: trialUntilSeconds,
        name: user.name || "",    // fallback to empty string
        email: user.email || "",  // fallback to empty string
        uid: user.uid,            // optional, useful for backend
      };

      const cloudRunUrl = "https://create-delayed-subscription-725766869893.australia-southeast1.run.app/create-delayed-subscription";
      const response = await fetch(cloudRunUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Cloud Run failed: ${response.status} - ${errText}`);
      }

      navigation.navigate("ThankYou");
    } catch (err: any) {
      console.error("submitUserToSubscription error:", err);
      alert("Subscription setup failed: " + (err.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <StyledView style={{ borderRadius: 5, elevation: 5, shadowColor: 'transparent', padding: 20, marginBottom: 40, backgroundColor: '#eeeeee', zIndex: 9999 }} className="flex-1 p-4 bg-white">
      <View style={{ paddingTop: 20, paddingBottom: 20 }}>
        <RNText style={{ fontFamily: fonts.bold, fontSize: 24, color: '#195E4B' }}>
          Enter your address
        </RNText>
        <RNText style={{ fontFamily: fonts.bold, fontSize: 22, color: '#999999', lineHeight: 24 }}>
          Please enter your doggy loving address to check if we Doozy in your area.
        </RNText>
      </View>

      {/* ✅ Use new AddressAutocomplete component */}
      <AddressAutocomplete
        onSelect={(place) => {
          if (!place) {
            // input cleared
            setServiceable(null);
            return;
          }
          saveAddress(place.description, place.lat, place.lng);
        }}
      />

      {serviceable !== null && (
        <View style={{ top: 50, paddingBottom: 50 }}>
          {serviceable && user.address?.central ? (
            <View style={{ paddingTop: 20, paddingBottom: 20, minWidth: '100%' }}>
              <RNText style={{ fontFamily: fonts.bold, fontSize: 22, color: '#999999', lineHeight: 24 }}>
                Woof, woof! We Doozy in your area.
              </RNText>
              <Button
                mode="contained"
                onPress={submitUserToSubscription}
                loading={loading}
                disabled={loading}
                style={{ paddingVertical: 12, borderRadius: 6, marginTop: 25, backgroundColor: '#195E4B', width: '100%' }}
                labelStyle={{ fontSize: 16, fontWeight: '800', color: 'white' }}
              >
                {loading ? "Processing..." : "Continue"}
              </Button>
            </View>
          ) : serviceable && !user.address?.central ? (
            <View style={{ paddingTop: 20, paddingBottom: 20 }}>
              <RNText style={{ fontFamily: fonts.bold, fontSize: 24, color: '#195E4B' }}>
                We currently don't offer weekly services in your area
              </RNText>
              <RNText style={{ fontFamily: fonts.bold, fontSize: 22, color: '#999999', lineHeight: 24 }}>
                However, we do offer one-off bookings! First-time customers get 20% off their first booking.
              </RNText>
              <Button
                mode="contained"
                onPress={() => navigation.navigate('BookingSignUpHome')} // <-- navigate to one-off booking
                style={{ paddingVertical: 12, borderRadius: 6, marginTop: 25, backgroundColor: '#195E4B', width: '100%' }}
                labelStyle={{ fontSize: 16, fontWeight: '800', color: 'white' }}
              >
                Book a one-off
              </Button>
            </View>
          ) : (
            <View style={{ paddingTop: 20, paddingBottom: 20 }}>
              <RNText style={{ fontFamily: fonts.bold, fontSize: 24, color: '#195E4B' }}>
                Sorry, we don't yet scoop your area.
              </RNText>
              <RNText style={{ fontFamily: fonts.medium, fontSize: 13, color: '#777777', lineHeight: 20, paddingBottom: 20 }}>
                We’ve received your details and will contact you as soon as we start servicing your area.
              </RNText>
              <Button
                mode="contained"
                onPress={goToDoozyHome}
                style={{ paddingVertical: 12, borderRadius: 6, marginTop: 25, backgroundColor: '#195E4B', width: '100%' }}
                labelStyle={{ fontSize: 16, fontWeight: '800' }}
              >
                View my details
              </Button>
            </View>
          )}
        </View>
      )}

    </StyledView>
  );
}

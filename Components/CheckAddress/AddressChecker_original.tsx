import React, { useState } from 'react';
import { View, Text as RNText } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { getDistance } from 'geolib';
import serviceAreas from '../../data/serviceAreas.json';
import { useDispatch, useSelector } from "react-redux";
import { setUserDetails } from '../../store/store';
import { RootState } from '../../store/store';
import { styled } from "nativewind";
import { useNavigation } from "@react-navigation/native";
import { Button } from "react-native-paper";
import { auth, firestore } from '../../Firebase/firebaseConfig';

const StyledView = styled(View);

export default function AddressChecker() {
  const [serviceable, setServiceable] = useState<null | boolean>(null);
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user);
  const selectedPlan = useSelector((state: RootState) => state.plan.selectedPlan);
  const navigation = useNavigation<any>();

  const [loading, setLoading] = useState(false);

  const checkService = (lat: number, lng: number) => {
    const isWithin = serviceAreas.some(area => {
      const distance = getDistance(
        { latitude: lat, longitude: lng },
        { latitude: area.lat, longitude: area.lng }
      );
      return distance / 1000 <= area.radiusKm;
    });
    setServiceable(isWithin);
    return isWithin;
  };

  const saveAddress = async (formattedAddress: string, lat: number, lng: number) => {
    if (!user?.uid) return;

    const addressObj = {
      formattedAddress,
      lat,
      lng,
      serviceable: checkService(lat, lng),
    };

    // Update Firestore
    await firestore.collection('users').doc(user.uid).update({
      address: addressObj,
    });

    // Update Redux
    dispatch(setUserDetails({ address: addressObj }));
  };

  const goToDoozyHome = () => {
    navigation.navigate("DoozyHome");
  };

  const submitUserToSubscription = async () => {
    try {
      setLoading(true); // ⏳ show spinner
      if (!user?.uid) throw new Error("User not found");
      if (!user.subscription) throw new Error("Subscription details missing");

      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("No authenticated user");
      const idToken = await currentUser.getIdToken(true);

      const rawTrial = user.subscription.trialUntil;
      if (!rawTrial) throw new Error("Trial until missing");
      const trialUntil = rawTrial.seconds
        ? new Date(rawTrial.seconds * 1000)
        : new Date(rawTrial);
      const trialUntilSeconds = Math.floor(trialUntil.getTime() / 1000);

      const subscriptionPlan = user.subscription.plan;
      if (!subscriptionPlan) throw new Error("Plan not set");

      const cloudRunUrl =
        "https://create-delayed-subscription-725766869893.australia-southeast1.run.app/create-delayed-subscription";
      const payload = {
        subscriptionName: subscriptionPlan,
        firstPaymentTimestamp: trialUntilSeconds,
      };

      const response = await fetch(cloudRunUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(
          `Cloud Run function failed: ${response.status} - ${errText}`
        );
      }

      navigation.navigate("ThankYou");
    } catch (err: any) {
      console.error("submitUserToSubscription error:", err);
      alert("Subscription setup failed: " + (err.message || "Unknown error"));
    } finally {
      setLoading(false); // ✅ stop spinner
    }
  };



  return (
    <StyledView style={{ borderRadius: 5, elevation: 0, shadowColor: 'transparent', padding: 20, marginBottom: 40, backgroundColor: '#eeeeee' }} className="flex-1 p-4 bg-white">
      <View style={{ paddingTop: 20, paddingBottom: 20 }}>
        <RNText style={{ fontFamily: 'Inter 24pt Bold', fontSize: 24, color: '#195E4B' }}>Enter your address</RNText>
        <RNText style={{ fontFamily: 'Inter 24pt Bold', fontSize: 22, color: '#999999', lineHeight: 24 }}>
          Please enter your doggy loving address to check if we Doozy in your area.
        </RNText>
      </View>

      <View style={{ flex: 1, padding: 10 }}>
        <GooglePlacesAutocomplete
          placeholder="Enter your address"
          onPress={(data, details = null) => {
            if (!details) return;
            const lat = details.geometry.location.lat;
            const lng = details.geometry.location.lng;
            const formattedAddress = data.description;
            saveAddress(formattedAddress, lat, lng);
          }}
          fetchDetails={true}
          query={{
            key: 'AIzaSyAcz7dy7tlTmazzWRmLZ8n3MJNOlhT7drc',
            language: 'en',
            components: 'country:nz',
          }}
          styles={{
            textInput: {
              height: 44,
              backgroundColor: '#cccccc',
              color: '#333333',
              borderColor: '#ccc',
              borderWidth: 1,
              borderRadius: 6,
              paddingHorizontal: 10,
            },
            textInputContainer: {
              borderTopWidth: 0,
              borderBottomWidth: 0,
            },
            description: {
              color: '#000',
            },
            listView: {
              position: 'absolute',
              top: 50, // push below input
              zIndex: 1000,
              elevation: 5,
              backgroundColor: 'white',
            },
          }}
          textInputProps={{
            placeholderTextColor: '#888888',
          }}
        />

        {serviceable !== null && (
          <View style={{ marginTop: 20 }}>
            {serviceable ? (
              <View style={{ paddingTop: 20, paddingBottom: 20, minWidth: '100%' }}>
                <RNText style={{ fontFamily: 'Inter 24pt Bold', fontSize: 22, color: '#999999', lineHeight: 24 }}>
                  Woof, woof! We Doozy in your area.
                </RNText>
                <Button
                  mode="contained"
                  onPress={submitUserToSubscription}
                  loading={loading}
                  disabled={loading}
                  style={{
                    paddingVertical: 12,
                    borderRadius: 6,
                    marginTop: 25,
                    backgroundColor: '#195E4B',
                    width: '100%',
                  }}
                  labelStyle={{ fontSize: 16, fontWeight: '800', color: 'white' }}
                >
                  {loading ? "Processing..." : "Continue"}
                </Button>
              </View>
            ) : (
              <View style={{ paddingTop: 20, paddingBottom: 20 }}>
                <RNText style={{ fontFamily: 'Inter 24pt Bold', fontSize: 24, color: '#195E4B' }}>
                  Sorry, we don't yet scoop your area.
                </RNText>
                <RNText style={{ fontFamily: 'Inter 24pt Bold', fontSize: 22, color: '#999999', lineHeight: 24, paddingBottom: 20 }}>
                  However, we're going to doo your area soon!
                </RNText>
                <RNText style={{ fontFamily: 'Inter 24pt Medium', fontSize: 15, color: '#195E4B', lineHeight: 20 }}>
                  Whats next?
                </RNText>
                <RNText style={{ fontFamily: 'Inter 24pt Medium', fontSize: 13, color: '#777777', lineHeight: 20 }}>
                  We’ve received your details and will contact you as soon as we start servicing your area. Sorry for the disappointment — but don’t worry, go give your dog a pat to cheer up, and we’ll be in touch soon!
                </RNText>
                <Button
                  mode="contained"
                  onPress={goToDoozyHome}
                  style={{
                    paddingVertical: 12,
                    borderRadius: 6,
                    marginTop: 25,
                    backgroundColor: '#195E4B',
                    width: '100%',
                  }}
                  labelStyle={{ fontSize: 16, fontWeight: '800' }}
                >
                  View my details
                </Button>
              </View>
            )}
          </View>
        )}
      </View>
    </StyledView>
  );
}

import React, { useState } from 'react';
import { View, Text as RNText } from 'react-native';
import { getDistance } from 'geolib';
import { useDispatch, useSelector } from 'react-redux';
import { setUserDetails } from '../../store/store';
import { RootState } from '../../store/store';
import serviceAreas from '../../data/serviceAreasBooking.json';
import { styled } from 'nativewind';
import fonts from '../../assets/fonts/fonts.js';
import AddressAutocomplete from '../CheckAddress/AddressAutocomplete';
import { Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

const StyledView = styled(View);

export default function BookingAddress() {
  const [serviceable, setServiceable] = useState<null | boolean>(null);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  const user = useSelector((state: RootState) => state.user);

  const checkService = (lat: number, lng: number) => {
    const areaFound = serviceAreas.find(area => {
      const distance = getDistance(
        { latitude: lat, longitude: lng },
        { latitude: area.lat, longitude: area.lng }
      );
      return distance / 1000 <= area.radiusKm;
    });
    if (!areaFound) {
      setServiceable(false);
      return { serviceable: false, central: false };
    }
    setServiceable(true);
    return { serviceable: true, central: areaFound.central };
  };

  const saveAddressToRedux = (formattedAddress: string, lat: number, lng: number) => {
    const { serviceable, central } = checkService(lat, lng);

    const addressObj = {
      formattedAddress,
      lat,
      lng,
      serviceable,
      central,
    };

    dispatch(setUserDetails({ address: addressObj }));
    console.log('Address saved to Redux:', addressObj);
  };

  // Dummy function for your "Continue" button
  const submitUserToSubscription = () => {
    //console.log('Continue pressed!');
    navigation.navigate("BookingSignUpHome");
    // Add your subscription logic here later
  };

  return (
    <StyledView
      style={{ borderRadius: 5, elevation: 5, shadowColor: 'transparent', padding: 20, backgroundColor: '#eeeeee' }}
      className="flex-1 p-4 bg-white"
    >
      <View style={{ paddingBottom: 20 }}>
        <RNText style={{ fontFamily: fonts.bold, fontSize: 24, color: '#195E4B' }}>
          Enter your address
        </RNText>
        <RNText style={{ fontFamily: fonts.medium, fontSize: 16, color: '#555555', lineHeight: 22 }}>
          Please enter your address to see if we service your area.
        </RNText>
      </View>

      <AddressAutocomplete
        onSelect={(place) => {
          if (!place) {
            setServiceable(null);
            return;
          }
          saveAddressToRedux(place.description, place.lat, place.lng);
        }}
      />

      {serviceable !== null && (
        <View style={{ paddingTop: 20 }}>
          {serviceable ? (
            <>
              <RNText style={{ fontFamily: fonts.bold, fontSize: 20, color: '#195E4B' }}>
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
                {loading ? 'Processing...' : 'Continue'}
              </Button>
            </>
          ) : (
            <>
              <RNText style={{ fontFamily: fonts.bold, fontSize: 20, color: '#FF5555' }}>
                Sorry, we don't service your area yet.
              </RNText>
              <Button
                mode="text"
                onPress={() => navigation.navigate('Home')}
                labelStyle={{
                  textDecorationLine: 'underline',
                  fontSize: 16,
                  color: '#195E4B',
                }}
                style={{ marginTop: 25, marginBottom: 60 }}
              >
                Back to plans
              </Button>
            </>
          )}
        </View>
      )}
    </StyledView>
  );
}

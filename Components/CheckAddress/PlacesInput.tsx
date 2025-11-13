import React from 'react';
import { StyleSheet } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

export default function PlacesInput({ onPlaceSelected }) {
  return (
    <GooglePlacesAutocomplete
      placeholder="Enter your address"
      onPress={(data, details = null) => {
        if (details) {
          const lat = details.geometry.location.lat;
          const lng = details.geometry.location.lng;
          const formattedAddress = data.description;
          onPlaceSelected(formattedAddress, lat, lng);
        }
      }}
      fetchDetails={true}
      query={{
        key: 'AIzaSyAcz7dy7tlTmazzWRmLZ8n3MJNOlhT7drc', // Use your actual key
        language: 'en',
        components: 'country:nz',
      }}
      keyboardShouldPersistTaps="handled"
      styles={{
        textInput: {
          height: 44,
          backgroundColor: '#cccccc',
          color: '#333333',
          borderColor: '#ccc',
          borderWidth: 1,
          borderRadius: 6,
          paddingHorizontal: 10,
          top: 100, position: 'absolute'
        },
        listView: {
          position: 'absolute',
          top: 50,
          left: 0,
          right: 0,
          backgroundColor: 'white',
          zIndex: 9999,
          elevation: 5,
        },
      }}
      textInputProps={{
        placeholderTextColor: '#888888',
      }}
    />
  );
}

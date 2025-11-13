// AddressCheckerMinimal.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AddressAutocomplete from './AddressAutocomplete'; // ✅ your pure JS version

export default function AddressCheckerMinimal() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Test Google Places Autocomplete (web)</Text>

      <AddressAutocomplete
        onSelect={(place) => {
          console.log('✅ Selected:', place);
          // { description, place_id, lat, lng }
          // You can now save to Firestore or Redux
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});

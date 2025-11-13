
import React, { useState, useCallback, useRef } from 'react';
import { View, TextInput, FlatList, TouchableOpacity, Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const GOOGLE_API_KEY = 'AIzaSyAcz7dy7tlTmazzWRmLZ8n3MJNOlhT7drc';

export default function AddressAutocomplete({ onSelect }: { onSelect: (place: any | null) => void }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const skipNextFetch = useRef(false);

  const fetchSuggestions = useCallback(async (text: string) => {
    if (skipNextFetch.current) {
      skipNextFetch.current = false;
      return;
    }
    if (text.length < 3) {
      setSuggestions([]);
      return;
    }

    try {
      setLoading(true);

      // Bias toward NZ/AU by using a central lat/lng and large radius (~5000 km)
      const locationBias = "-36.8485,174.7633"; // Auckland center
      const radiusBias = 5000000; // 5000 km

      const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
        text
      )}&key=${GOOGLE_API_KEY}&location=${locationBias}&radius=${radiusBias}`;

      const res = await fetch(url);
      const json = await res.json();

      if (!json.predictions) {
        setSuggestions([]);
        return;
      }

      // ✅ Filter only NZ or AU addresses
      const filtered = json.predictions.filter(item =>
        //item.description.endsWith("New Zealand") || item.description.endsWith("Australia")
        item.description.endsWith("New Zealand")
      );

      setSuggestions(filtered);
    } catch (e) {
      console.log('Autocomplete error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const debounce = (fn: any, delay = 300) => {
    let timeout: any;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn(...args), delay);
    };
  };
  const debouncedFetch = useCallback(debounce(fetchSuggestions, 400), []);

  const handleChangeText = (text: string) => {
    setQuery(text);
    debouncedFetch(text);
  };

  const selectSuggestion = async (item: any) => {
  try {
    skipNextFetch.current = true;
    setSuggestions([]); // hide list immediately

    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${item.place_id}&key=${GOOGLE_API_KEY}`;
    const res = await fetch(url);
    const json = await res.json();

    const location = json.result?.geometry?.location;
    if (!location) {
      console.warn('⚠️ No geometry found for', item);
      return;
    }

    const fullAddress = json.result?.formatted_address || item.description;

    // ✅ set the TextInput to the full address
    setQuery(fullAddress);

    onSelect({
      description: fullAddress,
      place_id: item.place_id,
      lat: location.lat,
      lng: location.lng,
    });
  } catch (e) {
    console.log('Place details error:', e);
  }
};

  const clearInput = () => {
    setQuery('');
    setSuggestions([]);
    onSelect(null); // ✅ signal parent that input is cleared
  };

  return (
    <View style={{ width: '100%', position: 'relative' }}>
    <TextInput
      placeholder="Search address"
      placeholderTextColor="#888888"
      value={query}
      onChangeText={handleChangeText}
      style={{
        height: 44,
        backgroundColor: '#cccccc',
        color: '#333333',
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 6,
        paddingHorizontal: 10,
        fontSize: 16,       // keep your previous fontSize
      }}
    />
      {query.length > 0 && (
        <TouchableOpacity
          onPress={clearInput}
          style={{
            position: 'absolute',
            right: 10,
            top: 10,
          }}
        >
          <Icon name="close-circle" size={20} color="#888" />
        </TouchableOpacity>
      )}

      {suggestions.length > 0 && (
        <FlatList
          keyboardShouldPersistTaps="handled"
          data={suggestions}
          keyExtractor={(item) => item.place_id}
          style={{
            maxHeight: 200,
            backgroundColor: 'white',
            borderWidth: 1,
            borderColor: '#ccc',
            borderRadius: 6,
            marginTop: 5,
          }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => selectSuggestion(item)}
              style={{
                padding: 10,
                borderBottomColor: '#eee',
                borderBottomWidth: 1,
                backgroundColor: 'white',
              }}
            >
              <Text>{item.description}</Text>
            </TouchableOpacity>
          )}
          ListFooterComponent={
            <Text style={{ fontSize: 12, textAlign: 'center', color: '#888', padding: 5 }}>
              Powered by Google
            </Text>
          }
        />
      )}

      {loading && <Text style={{ marginTop: 5 }}>Loading...</Text>}
    </View>
  );
}

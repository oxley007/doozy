import React, { useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { useDispatch, useSelector } from 'react-redux';
import api from '../api/axiosConfig';
import { setVehicles, selectVehicle, setVehicleTrack, setLoading } from '../store/carbnSlice';
import { useVehicleWebSocket } from '../hooks/useWebSocket';
import { loginAndStoreToken } from '../api/authapi';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CarbnMapScreen = () => {
  const dispatch = useDispatch();
  const { vehicles, selectedVehicle, vehicleTrack, loading } = useSelector((state: any) => state.carbn);

  useEffect(() => {
    const init = async () => {
      let token = await AsyncStorage.getItem('carbn_token');
      if (!token) {
        token = await loginAndStoreToken();
      }

      if (token) {
        fetchVehicles();
      }
    };

    init();
  }, []);

  // Load vehicles in a bounding box
  const fetchVehicles = async () => {
    dispatch(setLoading(true));
    try {
      const res = await api.get('/fleet/vehicles/live?swLat=-47.0&swLng=165.0&neLat=-34&neLng=180.0');
      dispatch(setVehicles(res.data.data.vehicles));
    } catch (err) {
      console.error(err);
    } finally {
      dispatch(setLoading(false));
    }
  };

  // Load selected vehicle track
  const fetchVehicleTrack = async (vehicleId: string) => {
    dispatch(setLoading(true));
    try {
      const res = await api.get(`/fleet/vehicles/${vehicleId}/track?from=now-24h`);
      dispatch(setVehicleTrack(res.data.data.points));
    } catch (err) {
      console.error(err);
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    console.log('vehicles', vehicles);
  }, [vehicles]);

  useEffect(() => {
    if (vehicles.length > 0) {
      useVehicleWebSocket(vehicles.map(v => v.vehicle_id));
    }
  }, [vehicles]);

  return (
    <View style={styles.container}>
      {loading && <ActivityIndicator style={StyleSheet.absoluteFill} size="large" color="blue" />}
      <MapView
        provider={PROVIDER_GOOGLE} // <- add this
        style={StyleSheet.absoluteFill}
        initialRegion={{
          latitude: -36.85,
          longitude: 174.76,
          latitudeDelta: 5,
          longitudeDelta: 5,
        }}
      >
        {vehicles.map(vehicle => (
          <Marker
            key={vehicle.vehicle_id}
            coordinate={{ latitude: vehicle.lat, longitude: vehicle.lng }}
            title={vehicle.name}
            description={`Speed: ${vehicle.speed} km/h`}
            onPress={() => {
              dispatch(selectVehicle(vehicle));
              fetchVehicleTrack(vehicle.vehicle_id);
            }}
          />
        ))}

        {vehicleTrack.length > 0 && (
          <Polyline
            coordinates={vehicleTrack.map(pt => ({ latitude: pt.lat, longitude: pt.lng }))}
            strokeColor="blue"
            strokeWidth={3}
          />
        )}
      </MapView>
    </View>
  );
};

export default CarbnMapScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

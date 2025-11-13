import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store'; // adjust path if needed

const TestCreateBookingRule = () => {
  // Try accessing the root state directly
  const reduxState = useSelector((state: RootState) => state);
  const employeeId = reduxState.employeeId || reduxState.user?.employeeId;
  const name = reduxState.name || reduxState.user?.name;

  const handleCreate = async () => {
    if (!employeeId) {
      Alert.alert('Error', 'No employee ID found');
      return;
    }

    const docRef = firestore().collection('settings').doc(`bookingRules_${employeeId}`);
    const defaultData = {
      employeeId,
      name: name || '',
      profilePic: 'default.jpg',
      serviceAreas: [],
      days: {
        monday: [{ start: '08:00', end: '08:30', subscribed: false }],
        tuesday: [{ start: '08:00', end: '08:30', subscribed: false }],
        wednesday: [],
        thursday: [],
        friday: [],
        saturday: [],
        sunday: [],
      },
    };

    try {
      await docRef.set(defaultData);
      Alert.alert('Success', `bookingRules_${employeeId} created in settings`);
      console.log('Document created:', docRef.path);
    } catch (error: any) {
      console.error('Error creating document:', error);
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <TouchableOpacity
        style={{ backgroundColor: '#007BFF', padding: 15, borderRadius: 8, marginBottom: 12 }}
        onPress={handleCreate}
      >
        <Text style={{ color: 'white', fontWeight: '700' }}>Create bookingRules Document</Text>
      </TouchableOpacity>

      <Text style={{ fontSize: 16, color: '#333' }}>
        Employee ID from Redux: {employeeId || 'Not found'}
      </Text>
    </View>
  );
};

export default TestCreateBookingRule;

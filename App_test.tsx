import React, { useEffect, useState } from 'react';
import { SafeAreaView, Text, ActivityIndicator } from 'react-native';
import { auth } from './Firebase/firebaseConfig';

export default function App() {
  const [status, setStatus] = useState<string>('Checking Firebase...');

  useEffect(() => {
    // Test Firebase Auth
    const subscriber = auth().onAuthStateChanged(user => {
      if (user) {
        setStatus(`Signed in as ${user.email || user.uid}`);
      } else {
        setStatus('No user signed in (Firebase is working)');
      }
    });

    return subscriber; // unsubscribe on unmount
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      {status ? <Text>{status}</Text> : <ActivityIndicator />}
    </SafeAreaView>
  );
}

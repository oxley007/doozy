// App.tsx
import 'react-native-gesture-handler'; // MUST be first
import React, { useEffect } from 'react';
import { View, ActivityIndicator, NativeModules, useColorScheme, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native'; // if you want to navigate
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

import { Provider as ReduxProvider, useDispatch, useSelector } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { Provider as PaperProvider, MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import GlobalFont from 'react-native-global-font';

import store, { persistor, RootState } from './store/store';
import MainNavigator from './navigation/MainNavigator';
import auth from '@react-native-firebase/auth';
import { setUser, clearUser, setLoading } from './store/authSlice';
import { enableRemoteDebugging } from './debugTools';

function AppWrapper() {
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state: RootState) => state.auth);
  //const navigation = useNavigation<any>();

  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? MD3DarkTheme : MD3LightTheme;

  // Apply global fonts
  /*
  useEffect(() => {
    GlobalFont.applyGlobal('Inter 24pt Regular');
    GlobalFont.applyGlobal(fonts.bold);
    GlobalFont.applyGlobal(fonts.medium);
  }, []);
  */

  /*
  useEffect(() => {
      const handleUrl = (event: { url: string }) => {
        console.log('Opened via URL: ', event.url);

        if (event.url === 'doozy://payment-success') {
          navigation.navigate('PaymentSuccessScreen');
        } else if (event.url === 'doozy://payment-cancel') {
          navigation.navigate('PaymentCancelScreen');
        }
      };

      const subscription = Linking.addEventListener('url', handleUrl);

      Linking.getInitialURL().then(url => {
        if (url === 'doozy://payment-success') {
          navigation.navigate('PaymentSuccessScreen');
        } else if (url === 'doozy://payment-cancel') {
          navigation.navigate('PaymentCancelScreen');
        }
      });

      return () => subscription.remove();
    }, [navigation]);
    */


  useEffect(() => {
    console.log('🔍 NativeModules keys:', Object.keys(NativeModules));
    console.log('GooglePlacesAutocomplete:', GooglePlacesAutocomplete);
  }, []);

  // Enable remote debugging
  useEffect(() => {
    enableRemoteDebugging();
  }, []);

  // Firebase auth listener
  useEffect(() => {
    dispatch(setLoading(true));

    const unsubscribe = auth().onAuthStateChanged((user) => {
      if (user) {
        dispatch(setUser({ uid: user.uid, email: user.email, profile: null }));
      } else {
        dispatch(clearUser());
      }
      dispatch(setLoading(false)); // stop loading after auth state resolved
    });

    return unsubscribe;
  }, [dispatch]);


  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PaperProvider theme={theme}>
          <MainNavigator />
        </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default function App() {
  return (
    <ReduxProvider store={store}>
      {/* PersistGate ensures persisted state is loaded before rendering */}
      <PersistGate loading={<ActivityIndicator size="large" />} persistor={persistor}>
        <AppWrapper />
      </PersistGate>
    </ReduxProvider>
  );
}

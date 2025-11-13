import { useEffect } from 'react';
import { Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export function useStripeRedirectHandler() {
  const navigation = useNavigation();

  useEffect(() => {
    const handleDeepLink = (event: { url: string }) => {
      const { url } = event;
      if (url.includes('payment-success')) {
        navigation.navigate('PaymentSuccessScreen');
      } else if (url.includes('payment-cancel')) {
        navigation.navigate('PaymentCancelScreen');
      }
    };

    // Listen for deep links
    const subscription = Linking.addEventListener('url', handleDeepLink);

    // Handle case where app is opened from a deep link
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url });
    });

    return () => subscription.remove();
  }, []);
}

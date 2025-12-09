// authapi.ts
import api from './axiosConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const loginAndStoreToken = async () => {
  try {
    const res = await api.post('/auth/login', {
      email: 'andrew@bfsnz.co.nz',
      password: 'NewPass@1977',
    });

    if (res.data.success) {
      const token = res.data.data.token;
      await AsyncStorage.setItem('carbn_token', token);
      console.log('TOKEN STORED →', token);
      return token;
    }
  } catch (err: any) {
    console.error('Login failed', err.response?.data || err.message);
    return null;
  }
};

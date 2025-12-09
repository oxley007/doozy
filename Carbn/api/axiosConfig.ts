import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://api-dev.carbn.nz/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

api.interceptors.request.use(async config => {
  const token = await AsyncStorage.getItem('carbn_token');

  console.log('➡️ API REQUEST:', config.url);
  console.log('➡️ TOKEN:', token);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});


export default api;

import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateVehiclePosition } from '../store/carbnSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useVehicleWebSocket = (vehicleIds: string[]) => {
  const ws = useRef<WebSocket | null>(null);
  const dispatch = useDispatch();

  useEffect(() => {
    let token: string | null = null;

    const init = async () => {
      token = await AsyncStorage.getItem('carbn_token');
      if (!token) return;

      ws.current = new WebSocket(`wss://api-dev.carbn.nz/api/v1/fleet/live?token=${token}`);

      ws.current.onopen = () => {
        ws.current?.send(JSON.stringify({ action: 'subscribe', vehicle_ids: vehicleIds }));
      };

      ws.current.onmessage = event => {
        const data = JSON.parse(event.data);
        if (data.type === 'position_update') {
          dispatch(updateVehiclePosition(data));
        }
      };

      ws.current.onclose = () => {
        console.log('Carbn WebSocket closed, reconnecting in 5s...');
        setTimeout(init, 5000);
      };

      ws.current.onerror = err => {
        console.error('Carbn WebSocket error', err);
        ws.current?.close();
      };
    };

    init();

    return () => {
      ws.current?.close();
    };
  }, [vehicleIds]);
};

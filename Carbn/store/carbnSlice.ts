import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Vehicle {
  vehicle_id: string;
  registration: string;
  name: string;
  lat: number;
  lng: number;
  speed: number;
  heading: number;
  ignition_on: boolean;
  timestamp: string;
}

interface CarbnState {
  vehicles: Vehicle[];
  selectedVehicle: Vehicle | null;
  vehicleTrack: any[];
  loading: boolean;
}

const initialState: CarbnState = {
  vehicles: [],
  selectedVehicle: null,
  vehicleTrack: [],
  loading: false,
};

export const carbnSlice = createSlice({
  name: 'carbn',
  initialState,
  reducers: {
    setVehicles: (state, action: PayloadAction<Vehicle[]>) => {
      state.vehicles = action.payload;
    },
    selectVehicle: (state, action: PayloadAction<Vehicle | null>) => {
      state.selectedVehicle = action.payload;
    },
    setVehicleTrack: (state, action: PayloadAction<any[]>) => {
      state.vehicleTrack = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    updateVehiclePosition: (state, action: PayloadAction<Partial<Vehicle> & { vehicle_id: string }>) => {
      const idx = state.vehicles.findIndex(v => v.vehicle_id === action.payload.vehicle_id);
      if (idx >= 0) {
        state.vehicles[idx] = { ...state.vehicles[idx], ...action.payload };
      }
      if (state.selectedVehicle?.vehicle_id === action.payload.vehicle_id) {
        state.selectedVehicle = { ...state.selectedVehicle, ...action.payload };
      }
    },
  },
});

export const { setVehicles, selectVehicle, setVehicleTrack, setLoading, updateVehiclePosition } = carbnSlice.actions;
export default carbnSlice.reducer;

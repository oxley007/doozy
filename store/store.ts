// store/store.ts
import { configureStore, createSlice, PayloadAction, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authReducer from './authSlice';
import bookingReducer from './bookingSlice';

interface Override {
  override: number;
  date: number | null;
  originalDate: number | null;
  overrideIcons: number;
  overrideCancel: number;
  icons: {
    doo: number;
    deod: number;
    soil: number;
    fert: number;
    aer: number;
    seed: number;
    repair: number;
  };
}

// ---------------- User Slice ----------------
interface UserState {
  name: string;
  email: string;
  phone: string;
  dogBreeds: string;
  numberOfDogs: string;
  uid: string;
  role?: string;
  employeeId?: string;
  hasCompletedRegistration: boolean;
  subscription?: {
    status: string;
    plan: string | null;
    paidUntil: Date | null;
    trialUntil: Date;
    lastPaymentDate?: number;
    nextInvoiceDate?: number;
    soilNeutralantDay: string | null;
    dateOverrideOne: Override[];
    dateOverrideTwo: Override[];
    dateOverrideThree: Override[];
    dateOverrideFour: Override[];
    dateOverrideFive: Override[];
    dateOverrideSix: Override[];
  };
  address?: {
    formattedAddress: string;
    lat: number;
    lng: number;
    serviceable: boolean;
    central: boolean;
  };
  extraDetails?: {
    dogNames: string;
    accessYard: string;
    specialInstruct: string;
    homeNotes: string;
  };
  visitDetails?: {
    selectedTimes: string[];
    selectedDays: string[];
    homeNotes: string;
  };
  booking?: any[];
}

const emptyOverride: Override = {
  override: 0,
  date: null,
  originalDate: null,
  overrideIcons: 0,
  overrideCancel: 0,
  icons: { doo: 0, deod: 0, soil: 0, fert: 0, aer: 0, seed: 0, repair: 0 },
};

const initialUserState: UserState = {
  name: '',
  email: '',
  phone: '',
  dogBreeds: '',
  numberOfDogs: '',
  uid: '',
  role: 'user',
  employeeId: '',
  hasCompletedRegistration: false,
  subscription: {
    status: '',
    plan: null,
    paidUntil: null,
    trialUntil: new Date(),
    soilNeutralantDay: null,
    dateOverrideOne: [emptyOverride],
    dateOverrideTwo: [emptyOverride],
    dateOverrideThree: [emptyOverride],
    dateOverrideFour: [emptyOverride],
    dateOverrideFive: [emptyOverride],
    dateOverrideSix: [emptyOverride],
  },
  booking: [],
};

const userSlice = createSlice({
  name: 'user',
  initialState: initialUserState,
  reducers: {
    setUserDetails(state, action: PayloadAction<Partial<UserState>>) {
      Object.assign(state, action.payload);
    },
    clearUserDetails(state) {
      Object.assign(state, initialUserState);
    },
  },
});

// ---------------- Plan Slice ----------------
interface PlanState {
  selectedPlan: string | null;
}
const initialPlanState: PlanState = { selectedPlan: null };

const planSlice = createSlice({
  name: 'plan',
  initialState: initialPlanState,
  reducers: {
    setSelectedPlan(state, action: PayloadAction<string | null>) {
      state.selectedPlan = action.payload;
    },
    clearSelectedPlan(state) {
      state.selectedPlan = null;
    },
  },
});


// ---------------- Persist Config ----------------
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['user', 'plan', 'booking'], // persist booking if needed
};

// ---------------- Root Reducer ----------------
export const RESET_APP = 'RESET_APP';

const appReducer = combineReducers({
  auth: authReducer,
  user: userSlice.reducer,
  plan: planSlice.reducer,
  booking: bookingReducer,
});

const rootReducer = (state: any, action: any) => {
  if (action.type === RESET_APP) {
    // ⚡ Clear persisted Redux state (keep persistence structure intact)
    state = undefined;
  }
  return appReducer(state, action);
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

// ---------------- Store ----------------
const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // needed for redux-persist
    }),
});

export const persistor = persistStore(store);

// ---------------- Export Actions ----------------
export const { setUserDetails, clearUserDetails } = userSlice.actions;
export const { setSelectedPlan, clearSelectedPlan } = planSlice.actions;

// ---------------- Types ----------------
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;

export const resetApp = () => ({ type: RESET_APP });

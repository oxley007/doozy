// store/authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  uid: string | null;
  email: string | null;
  profile: any | null;
  isLoading: boolean;
}

const initialState: AuthState = {
  uid: null,
  email: null,
  profile: null,
  isLoading: true, // wait for Firebase auth rehydrate
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<{ uid: string; email: string | null; profile?: any }>) => {
      const { uid, email, profile } = action.payload;
      state.uid = uid;
      state.email = email;
      state.profile = profile || null;
      state.isLoading = false;
    },
    clearUser: (state) => {
      state.uid = null;
      state.email = null;
      state.profile = null;
      state.isLoading = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setUser, clearUser, setLoading } = authSlice.actions;
export default authSlice.reducer;

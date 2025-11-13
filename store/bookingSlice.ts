import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Booking {
  bookingId?: string;
  bookedByUid: string;
  BookingType: string;
  bookingServices: Record<string, boolean>;
  date: number;
  createdAt?: any;
  confirmed?: boolean;
}

interface BookingState {
  bookings: Booking[];
  bookingComplete: boolean;
  selectedDates: number[]; // 👈 now stores multiple selected date timestamps
}

const initialState: BookingState = {
  bookings: [],
  bookingComplete: false,
  selectedDates: [],
};

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    setBookings(state, action: PayloadAction<Booking[]>) {
      state.bookings = action.payload;
    },
    addBooking(state, action: PayloadAction<Booking>) {
      state.bookings.push(action.payload);
    },
    clearBookings(state) {
      state.bookings = [];
      state.bookingComplete = false;
      state.selectedDates = [];
    },
    updateBookingConfirmed(
      state,
      action: PayloadAction<{ bookingId: string; confirmed: boolean }>
    ) {
      const { bookingId, confirmed } = action.payload;
      const booking = state.bookings.find((b) => b.bookingId === bookingId);
      if (booking) {
        booking.confirmed = confirmed;
      }
    },
    setBookingComplete(state, action: PayloadAction<boolean>) {
      state.bookingComplete = action.payload;
    },
    setSelectedDates(state, action: PayloadAction<number[]>) {
      state.selectedDates = action.payload;
    },
    addSelectedDate(state, action: PayloadAction<number>) {
      // Add date if not already selected
      if (!state.selectedDates.includes(action.payload)) {
        state.selectedDates.push(action.payload);
      }
    },
    removeSelectedDate(state, action: PayloadAction<number>) {
      // Remove date if present
      state.selectedDates = state.selectedDates.filter(
        (d) => d !== action.payload
      );
    },
  },
});

export const {
  setBookings,
  addBooking,
  clearBookings,
  updateBookingConfirmed,
  setBookingComplete,
  setSelectedDates,
  addSelectedDate,
  removeSelectedDate,
} = bookingSlice.actions;

export default bookingSlice.reducer;

import { v4 as uuidv4 } from "uuid";
import React, { useEffect, useState } from "react";
import {
  View,
  Text as RNText,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Button,
} from "react-native";
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";
import { styled } from "nativewind";
import fonts from "../../assets/fonts/fonts.js";
import { useDispatch, useSelector } from "react-redux";
import { setUser, setUserDetails } from '../../store/store';
import {
  addBooking,
  setBookings,
  setBookingComplete,
  addSelectedDate,
  removeSelectedDate,
  setSelectedDates,
} from '../../store/bookingSlice';

const StyledView = styled(View);

interface DayMaxBooking {
  maxBooking: number;
  overflowOnly: boolean;
  sameDayBooking: boolean;
}

interface Booking {
  bookedByUid: string;
  BookingType: string;
  bookingServices: Record<string, boolean>;
  date: number;
  createdAt?: any;
  bookingId?: string;
  confirmed?: boolean;
}

export default function BookingCalendar({
  user,
  name,
  email,
  phone,
  dogBreeds,
  numberOfDogs,
  accessYard,
  yardSize,
  walkSelected,
  dooSelected,
}: {
  user: any;
  name: string;
  email: string;
  phone: string;
  dogBreeds: string;
  numberOfDogs: string;
  accessYard: string;
  yardSize?: string;
  walkSelected: boolean;
  dooSelected: boolean;
}) {
  const [weekOffset, setWeekOffset] = useState(0);
  const [bookings, setLocalBookings] = useState<Booking[]>([]);
  const [dayMaxBooking, setDayMaxBooking] = useState<Record<string, DayMaxBooking>>({});
  const [localBookedDates, setLocalBookedDates] = useState<number[]>([]);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const dispatch = useDispatch();
  const bookingComplete = useSelector((state: any) => state.user.bookingComplete);
  const addressFromRedux = useSelector((state: RootState) => state.user.address);
  const reduxState = useSelector((state: RootState) => state);

  const dooPickupPlans = [
    "Twice a week Premium",
    "Once a week Premium Friday",
    "Once a week Premium",
    "Twice a week Artificial Grass",
    "Once a week Artificial Grass",
    "Twice a week",
    "Once a week Friday",
    "Once a week"
  ];

  // Map which days each plan gets serviced
  const dooPickupServiceDays: Record<string, number[]> = {
    "Twice a week Premium": [1, 5], // Monday & Friday
    "Twice a week": [1, 5],
    "Twice a week Artificial Grass": [1, 5],
    "Once a week Premium Friday": [5],
    "Once a week Friday": [5],
    "Once a week Premium": [3],
    "Once a week": [3],
    "Once a week Artificial Grass": [3]
  };

  // Fetch booking rules
  useEffect(() => {
    const fetchBookingRules = async () => {
      try {
        const docSnap = await firestore().collection("settings").doc("bookingRules").get();
        if (docSnap.exists) {
          setDayMaxBooking(docSnap.data() as Record<string, DayMaxBooking>);
        }
      } catch (err) {
        console.error("Error fetching booking rules:", err);
      } finally {
        setLoadingSettings(false);
      }
    };
    fetchBookingRules();
  }, []);

  // Load bookings
  useEffect(() => {
    if (!auth().currentUser) return;

    const unsubscribe = firestore()
      .collection("bookings")
      .onSnapshot(
        (snapshot) => {
          const allBookings = snapshot.docs.map((doc) => ({
            bookingId: doc.id,
            ...doc.data(),
          })) as Booking[];
          setLocalBookings(allBookings);
        },
        (err) => console.error(err)
      );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setLocalBookedDates(reduxState.booking.selectedDates || []);
  }, [reduxState.booking.selectedDates]);

  // Helper to normalize a date to midnight timestamp
  const getDayKey = (date: Date | number) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d.getTime(); // returns number
  };

  // Get start and end timestamps for the displayed week
  const getWeekRange = (weekOffset: number) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffToSunday = today.getDay(); // Sunday = 0
    const sunday = new Date(today);
    sunday.setDate(today.getDate() - diffToSunday + weekOffset * 7);
    const saturday = new Date(sunday);
    saturday.setDate(sunday.getDate() + 6);

    return { start: sunday.getTime(), end: saturday.getTime() };
  };

  // Pre-calculate booking counts only for this week
  const { start, end } = getWeekRange(weekOffset);
  const bookingsCountByDay = bookings.reduce((acc: Record<number, number>, b: Booking) => {
    // Convert Firestore timestamp to JS Date if needed
    const dateObj = b.date?.toDate ? b.date.toDate() : new Date(b.date);
    const dayKey = getDayKey(dateObj);

    if (dayKey >= start && dayKey <= end) {
      acc[dayKey] = (acc[dayKey] || 0) + 1;
    }

    return acc;
  }, {});

  const handlePress = () => {
      // Option 1: console log
      console.log('Redux store:', reduxState);

      // Option 2: quick Alert to see JSON (not for huge state)
      Alert.alert('Redux Store', JSON.stringify(reduxState, null, 2));
    };

  // Week navigation
  const goNextWeek = () => setWeekOffset((prev) => Math.min(prev + 1, 3));
  const goPrevWeek = () => setWeekOffset((prev) => Math.max(prev - 1, 0));

  // Get date for each day (Sunday = index 0)
  const getDateForWeekDay = (weekOffset: number, dayIndex: number) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffToSunday = today.getDay(); // Sunday = 0
    const sunday = new Date(today);
    sunday.setDate(today.getDate() - diffToSunday + weekOffset * 7);
    const dayDate = new Date(sunday);
    dayDate.setDate(sunday.getDate() + dayIndex);
    return dayDate;
  };

  const sameDate = (ts: number | any, date: Date) => {
    const d = ts?.toDate ? ts.toDate() : new Date(ts);
    return d.toDateString() === date.toDateString();
  };

  const calculateAvailableSpots = (
    dayDate: Date,
    dayData: DayMaxBooking,
    currentBookings: number
  ) => {
    const now = new Date();
    const { maxBooking, sameDayBooking } = dayData;

    if (dayDate < new Date(now.setHours(0, 0, 0, 0))) {
      return { spotsAvailable: 0, displayMessage: "No spots left available" };
    }

    if (maxBooking === 0) {
      return { spotsAvailable: 0, displayMessage: "Scheduled for Subscription bookings only" };
    }

    const isToday = dayDate.toDateString() === new Date().toDateString();
    if (!isToday) {
      const spotsAvailable = Math.max(maxBooking - currentBookings, 0);
      const displayMessage =
        spotsAvailable > 0 ? `${spotsAvailable} spots available` : "No spots left available";
      return { spotsAvailable, displayMessage };
    }

    // Same-day booking logic
    const hours = new Date().getHours();
    if (!sameDayBooking && hours >= 8) {
      return { spotsAvailable: 0, displayMessage: "Same-day booking closed" };
    }

    let spotsAvailable = 0;
    if (hours < 8) spotsAvailable = Math.max(maxBooking - currentBookings, 0);
    else if (hours >= 8 && hours < 10)
      spotsAvailable = Math.max(Math.floor(maxBooking / 2) - currentBookings, 0);
    else if (hours >= 10 && hours < 12)
      spotsAvailable = Math.max(Math.floor(maxBooking / 4) - currentBookings, 0);

    const displayMessage =
      spotsAvailable > 0 ? `${spotsAvailable} spots available` : "No spots left available";
    return { spotsAvailable, displayMessage };
  };

  // Updated bookSpot function
  const bookSpot = ({
    dayDate,
    bookingServices,
    bookingType,
  }: {
    dayDate: Date;
    bookingServices: Record<string, boolean>;
    bookingType: string;
  }) => {
    if (!bookingServices.walk && !bookingServices.doo) {
      Alert.alert("Select a service", "Please select at least one service (walk or doo).");
      return;
    }

    const dateTimestamp = dayDate.getTime();

    // Prevent double-booking the same date
    const selectedDates = reduxState.booking.selectedDates || [];
    if (selectedDates.includes(dateTimestamp)) {
      Alert.alert("Already booked", "You've already selected this day.");
      return;
    }

    const newBooking: Booking = {
      bookedByUid: "local",
      BookingType: bookingType,
      bookingServices,
      date: dateTimestamp,
      confirmed: false,
    };

    dispatch(addBooking(newBooking));
    dispatch(addSelectedDate(dateTimestamp));

    // Update local state immediately for UI responsiveness
    setLocalBookedDates((prev) => [...prev, dateTimestamp]);

    Alert.alert("Date selected!", "Your booking date has been selected.");
  };

  // Remove booking function
  const removeBooking = (date: number) => {
    const stateBookings = reduxState.booking.bookings || [];

    // Filter out bookings for this date
    const updatedBookings = stateBookings.filter(
      (b: Booking) => !sameDate(b.date, new Date(date))
    );

    dispatch(setBookings(updatedBookings));
    dispatch(removeSelectedDate(date)); // 👈 remove from Redux selectedDates
    setLocalBookedDates((prev) => prev.filter((d) => d !== date));

    Alert.alert("Date removed", "Your date has been deleted.");
  };

  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  if (loadingSettings) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#195E4B" />
        <RNText style={{ marginTop: 12 }}>Loading booking rules...</RNText>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#E9FCDA" }}>
      <StyledView className="flex-1" style={{ backgroundColor: "#f9f9f9" }}>
        <RNText
          style={{
            fontFamily: fonts.bold,
            fontSize: 22,
            color: "#195E4B",
            padding: 10,
          }}
        >
          Book Your Spot
        </RNText>
        <RNText
          style={{
            fontFamily: fonts.bold,
            fontSize: 18,
            color: "#999",
            padding: 10,
          }}
        >
          Book multiple days for a further 15% discount!
        </RNText>

        {/* Week Navigation */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", margin: 16 }}>
          <TouchableOpacity
            onPress={goPrevWeek}
            style={{ padding: 8, backgroundColor: "#195E4B", borderRadius: 6, width: 120 }}
          >
            <RNText style={{ color: "#fff", textAlign: "center" }}>Previous Week</RNText>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={goNextWeek}
            style={{ padding: 8, backgroundColor: "#195E4B", borderRadius: 6, width: 120 }}
          >
            <RNText style={{ color: "#fff", textAlign: "center" }}>Next Week</RNText>
          </TouchableOpacity>
        </View>

        <ScrollView style={{ padding: 20 }}>
        {daysOfWeek.map((day, index) => {
          const dayDate = getDateForWeekDay(weekOffset, index);
          const dayKey = getDayKey(dayDate);

          // Get number of bookings already on this day
          const bookedOnThisDay = bookingsCountByDay[dayKey] || 0;

          // Use dayMaxBooking if it exists, else default to 0 spots
          const dayData: DayMaxBooking = dayMaxBooking[day.toLowerCase() + "MaxBooking"] || {
            maxBooking: 0,
            overflowOnly: false,
            sameDayBooking: false,
          };

          const now = new Date();
          const isToday = dayDate.toDateString() === now.toDateString();

          // Default spots calculation
          let spotsAvailable = Math.max(dayData.maxBooking - bookedOnThisDay, 0);
          let displayMessage = spotsAvailable > 0
            ? `${spotsAvailable} spots available`
            : "No spots left available";

          // Past days
          if (dayDate < new Date(now.setHours(0, 0, 0, 0))) {
            spotsAvailable = 0;
            displayMessage = "No spots left available";
          }

          // Scheduled for subscription-only days
          if (dayData.maxBooking === 0) {
            spotsAvailable = 0;
            displayMessage = "Scheduled for Subscription bookings only";
          }

          // Discount message for users with relevant dooPickup subscription
          let discountMessage = "";
          if (user?.subscription?.plan && dooPickupPlans.includes(user.subscription.plan)) {
            const serviceDays = dooPickupServiceDays[user.subscription.plan] || [];
            if (serviceDays.includes(index)) {
              discountMessage = "Book on the same day you get doo-pick up for a 20% discount!";
            }
          }

          // Overflow-only logic
          if (dayData.overflowOnly) {
            const prevDayKey = getDayKey(new Date(dayDate.getTime() - 24 * 60 * 60 * 1000));
            const nextDayKey = getDayKey(new Date(dayDate.getTime() + 24 * 60 * 60 * 1000));

            const prevBooked = bookingsCountByDay[prevDayKey] || 0;
            const nextBooked = bookingsCountByDay[nextDayKey] || 0;

            const prevMaxBooking =
              dayMaxBooking[
                daysOfWeek[new Date(dayDate.getTime() - 24 * 60 * 60 * 1000).getDay()].toLowerCase() +
                  "MaxBooking"
              ]?.maxBooking || 0;

            const nextMaxBooking =
              dayMaxBooking[
                daysOfWeek[new Date(dayDate.getTime() + 24 * 60 * 60 * 1000).getDay()].toLowerCase() +
                  "MaxBooking"
              ]?.maxBooking || 0;

            // Only show spots if both previous & next day are full
            if (prevBooked < prevMaxBooking || nextBooked < nextMaxBooking) {
              spotsAvailable = 0;
              displayMessage = "No spots available";
            }
          }

          // Same-day booking restrictions
          if (isToday) {
            const hours = now.getHours();
            if (!dayData.sameDayBooking && hours >= 8) {
              spotsAvailable = 0;
              displayMessage = "Same-day booking closed";
            } else if (hours >= 8 && hours < 10) {
              spotsAvailable = Math.max(Math.floor(dayData.maxBooking / 2) - bookedOnThisDay, 0);
              displayMessage = spotsAvailable > 0 ? `${spotsAvailable} spots available` : "No spots left available";
            } else if (hours >= 10 && hours < 12) {
              spotsAvailable = Math.max(Math.floor(dayData.maxBooking / 4) - bookedOnThisDay, 0);
              displayMessage = spotsAvailable > 0 ? `${spotsAvailable} spots available` : "No spots left available";
            }
          }

          console.log(day, dayData, bookedOnThisDay, dayData.maxBooking - bookedOnThisDay);

          return (
            <View key={day} style={{ marginBottom: 20 }}>
              <RNText style={{ fontFamily: fonts.bold, fontSize: 22, color: "#8C2B2B", marginBottom: 8 }}>
                {day} – {dayDate.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
              </RNText>

              <RNText style={{ fontFamily: fonts.medium, fontSize: 16, marginBottom: 8 }}>
                {displayMessage}
              </RNText>

              {discountMessage !== "" && (
                <RNText style={{ fontFamily: fonts.medium, fontSize: 14, color: "#195E4B", marginBottom: 8, backgroundColor: 'yellow' }}>
                  {discountMessage}
                </RNText>
              )}

              {spotsAvailable > 0 && (
                <View style={{ flexDirection: "row", alignItems: "center", marginTop: 12 }}>
                  {localBookedDates.includes(dayDate.getTime()) ? (
                    <>
                      <TouchableOpacity
                        style={{ padding: 12, borderRadius: 6, backgroundColor: "#888", flex: 1 }}
                        onPress={() => Alert.alert("Already booked!", "You have this spot booked.")}
                      >
                        <RNText style={{ color: "white", fontWeight: "700", textAlign: "center" }}>
                          Booked
                        </RNText>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={{ padding: 12, marginLeft: 10, borderRadius: 6, backgroundColor: "#FF4D4D" }}
                        onPress={() => removeBooking(dayDate.getTime())}
                      >
                        <RNText style={{ color: "white", fontWeight: "700", textAlign: "center" }}>X</RNText>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <TouchableOpacity
                      onPress={() =>
                        bookSpot({
                          dayDate,
                          bookingServices: { walk: walkSelected, doo: dooSelected },
                          bookingType: "30min walk + waste removal",
                        })
                      }
                      style={{ padding: 12, borderRadius: 6, backgroundColor: "#195E4B", flex: 1 }}
                    >
                      <RNText style={{ color: "white", fontWeight: "700", textAlign: "center" }}>
                        Book Spot
                      </RNText>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          );
        })}
          <Button
            title="Show Redux Store"
            onPress={handlePress}
            color="#FF6347" // optional styling
          />
          <Button
            title="Clear All Bookings"
            color="#FF6347"
            onPress={() => {
              // Clear selected dates in Redux
              dispatch(setSelectedDates([]));

              // Clear all bookings in Redux
              dispatch(setBookings([]));

              // Clear local UI state
              setLocalBookedDates([]);

              Alert.alert("All bookings cleared", "All your bookings have been reset.");
            }}
          />
        </ScrollView>
      </StyledView>
    </SafeAreaView>
  );
}

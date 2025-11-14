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
  Image,
  LayoutAnimation,
} from "react-native";
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";
import { styled } from "nativewind";
import fonts from "../../assets/fonts/fonts.js";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { useNavigation } from "@react-navigation/native";
import {
  addBooking,
  setBookings,
  addSelectedDate,
  removeSelectedDate,
  setSelectedDates,
} from "../../store/bookingSlice";

const StyledView = styled(View);

interface Booking {
  bookedByUid: string;
  BookingType: string;
  bookingServices: Record<string, boolean>;
  date: string; // Firestore stores as string: "timestamp-start-end-employeeId"
  slotKey: string;
  employeeId?: string;
  employeeName?: string;
  confirmed?: boolean;
}

interface EmployeeSlot {
  start: string;
  end: string;
  employeeId: string;
  employeeName: string;
  profilePic?: string;
}

interface CombinedSlot {
  start: string;
  end: string;
  availableEmployees: EmployeeSlot[];
}

// --- Helpers ---
const getNZTimestamp = (year: number, month: number, day: number, hour: number, minute: number) => {
  const date = new Date(Date.UTC(year, month, day, hour - 13, minute, 0)); // NZDT UTC+13
  return date.getTime();
};

const getNZWeekStart = (weekOffset: number) => {
  const now = new Date();
  const nzOffset = 13 * 60; // NZDT +13
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const nzTime = new Date(utc + nzOffset * 60000);
  nzTime.setHours(0, 0, 0, 0);

  const day = nzTime.getDay();
  const sunday = new Date(nzTime);
  sunday.setDate(nzTime.getDate() - day + weekOffset * 7);
  return sunday;
};

export default function BookingCalendar({
  user,
  walkSelected,
  dooSelected,
  yardSize,
  deodSelected,
  onEmployeeSelected,
}: {
  user: any;
  walkSelected: boolean;
  dooSelected: boolean;
  yardSize: string | number | null;
  deodSelected: boolean;
  onEmployeeSelected?: (employeeId: string, employeeName: string) => void;
}) {
  const [weekOffset, setWeekOffset] = useState(0);
  const [bookings, setLocalBookings] = useState<Booking[]>([]);
  const [employeeSchedule, setEmployeeSchedule] = useState<Record<string, EmployeeSlot[]>>({});
  const [combinedSchedule, setCombinedSchedule] = useState<Record<string, CombinedSlot[]>>({});
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<{ dayDate: Date; slot: CombinedSlot } | null>(null);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);

  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  const reduxState = useSelector((state: RootState) => state);
  const localSelectedDates = reduxState.booking.selectedDates || [];

  const now = new Date();
  const nzOffset = 13 * 60; // NZDT +13
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const nzNow = new Date(utc + nzOffset * 60000);

  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  // --- Fetch employee schedules ---
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const snapshot = await firestore().collection("settings").get();
        const mergedSchedules: Record<string, EmployeeSlot[]> = {};

        snapshot.docs.forEach((doc) => {
          if (!doc.id.startsWith("bookingRules_")) return;
          const data = doc.data();
          const days = data.days || {};
          const employeeId = data.employeeId;
          const employeeName = data.name;
          const profilePic = data.profilePic || null;

          Object.keys(days).forEach((day) => {
            if (!mergedSchedules[day]) mergedSchedules[day] = [];
            days[day].forEach((slot: any) => {
              mergedSchedules[day].push({
                start: slot.start,
                end: slot.end,
                employeeId,
                employeeName,
                profilePic,
              });
            });
          });
        });

        setEmployeeSchedule(mergedSchedules);
      } catch (err) {
        console.error(err);
      }
    };

    fetchSchedules();
  }, []);

  // --- Combine employee slots per day ---
  useEffect(() => {
    const combined: Record<string, CombinedSlot[]> = {};

    Object.keys(employeeSchedule).forEach((day) => {
      const slots = employeeSchedule[day];
      const slotMap: Record<string, CombinedSlot> = {};

      slots.forEach((slot) => {
        const key = `${slot.start}-${slot.end}`;
        if (!slotMap[key]) {
          slotMap[key] = { start: slot.start, end: slot.end, availableEmployees: [] };
        }
        slotMap[key].availableEmployees.push(slot);
      });

      combined[day] = Object.values(slotMap).sort((a, b) => {
        const [ah, am] = a.start.split(":").map(Number);
        const [bh, bm] = b.start.split(":").map(Number);
        return ah * 60 + am - (bh * 60 + bm);
      });
    });

    setCombinedSchedule(combined);
    setLoading(false);
  }, [employeeSchedule]);

  const getDateForWeekDay = (dayIndex: number) => {
    const sunday = getNZWeekStart(weekOffset);
    const dayDate = new Date(sunday);
    dayDate.setDate(sunday.getDate() + dayIndex);
    return dayDate;
  };

  const getWeekRange = () => {
    const sunday = getNZWeekStart(weekOffset);
    const saturday = new Date(sunday);
    saturday.setDate(sunday.getDate() + 6);
    return [sunday.getTime(), saturday.getTime()];
  };

  // --- Fetch bookings for the week ---
  // --- Fetch bookings for the week ---
useEffect(() => {
  const [weekStart, weekEnd] = getWeekRange(); // numeric timestamps
  console.log("Fetching bookings for week:", new Date(weekStart), "-", new Date(weekEnd));

  const unsubscribe = firestore()
    .collection("bookings")
    .where("date", ">=", weekStart)
    .where("date", "<=", weekEnd)
    .onSnapshot(
      (snapshot) => {
        console.log("Fetched bookings snapshot size:", snapshot.docs.length);

        const weekBookings: Booking[] = snapshot.docs.map((doc) => {
          const data = doc.data() as Booking;

          return {
            bookingId: doc.id,
            ...data,
            slotKey: data.slotKey, // ✅ Trust the stored slotKey
          };
        });

        console.log("All bookings for this week:", weekBookings);
        setLocalBookings(weekBookings);
      },
      (err) => console.error("Error fetching bookings:", err)
    );

  return () => unsubscribe();
}, [weekOffset]);

  // --- Precompute booked slots for quick lookup ---
  const bookedSlotKeys = new Set([...bookings.map((b) => b.slotKey), ...localSelectedDates]);

  // --- Book a slot ---
  const bookSlot = (dayDate: Date, slot: CombinedSlot, employee: EmployeeSlot) => {
    if (!walkSelected && !dooSelected) {
      Alert.alert("Select a service", "Please select at least one service.");
      return;
    }

    const [hour, minute] = slot.start.split(":").map(Number);
    const slotTimestamp = getNZTimestamp(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate(), hour, minute);
    const slotKey = `${slotTimestamp}-${slot.start}-${slot.end}-${employee.employeeId}`;

    const newBooking: Booking = {
      bookedByUid: "local",
      BookingType: `Slot ${slot.start}-${slot.end}`,
      bookingServices: { walk: walkSelected, doo: dooSelected },
      yardSize: yardSize ?? null,
      deod: deodSelected,
      date: slotKey, // store same format as Firestore
      slotKey,
      employeeId: employee.employeeId,
      employeeName: employee.employeeName,
      areaCode: user.address?.code || null,
      confirmed: false,
    };

    dispatch(addBooking(newBooking));
    dispatch(addSelectedDate(slotKey));

    if (onEmployeeSelected) {
      onEmployeeSelected(employee.employeeId, employee.employeeName);
    }
  };

  const removeSlot = (slotKey: string) => {
    const reduxBookings = reduxState.booking.bookings || [];
    const updatedBookings = reduxBookings.filter((b) => b.slotKey !== slotKey);

    dispatch(setBookings(updatedBookings));
    dispatch(removeSelectedDate(slotKey));

    // Also clear selection if currently selected
    if (selectedSlot?.slot) {
      const selectedSlotKey = `${getNZTimestamp(
        selectedSlot.dayDate.getFullYear(),
        selectedSlot.dayDate.getMonth(),
        selectedSlot.dayDate.getDate(),
        Number(selectedSlot.slot.start.split(":")[0]),
        Number(selectedSlot.slot.start.split(":")[1])
      )}-${selectedSlot.slot.start}-${selectedSlot.slot.end}-${selectedSlot.slot.availableEmployees[0].employeeId}`;

      if (selectedSlotKey === slotKey) setSelectedSlot(null);
    }
  };

  if (loading) {
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
        <RNText style={{ fontFamily: fonts.bold, fontSize: 22, color: "#195E4B", padding: 10 }}>
          Book Your Spot
        </RNText>

        <View style={{ flexDirection: "row", justifyContent: "space-between", margin: 16 }}>
          <TouchableOpacity
            onPress={() => setWeekOffset((p) => Math.max(p - 1, 0))}
            style={{ padding: 8, backgroundColor: "#195E4B", borderRadius: 6, width: 120 }}
          >
            <RNText style={{ color: "#fff", textAlign: "center" }}>Previous Week</RNText>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setWeekOffset((p) => Math.min(p + 1, 3))}
            style={{ padding: 8, backgroundColor: "#195E4B", borderRadius: 6, width: 120 }}
          >
            <RNText style={{ color: "#fff", textAlign: "center" }}>Next Week</RNText>
          </TouchableOpacity>
        </View>

        <ScrollView style={{ padding: 20 }}>
          {daysOfWeek.map((day, dayIndex) => {
            const dayDate = getDateForWeekDay(dayIndex);

            // Hide days before today
            const todayStart = new Date(nzNow);
            todayStart.setHours(0, 0, 0, 0);

            if (dayDate.getTime() < todayStart.getTime()) {
              return null;
            }

            const slots = combinedSchedule[day.toLowerCase()] || [];
            const isExpanded = expandedDay === day;

            return (
              <View key={day} style={{ marginBottom: 20 }}>
              {/* Accordion Header */}


              <TouchableOpacity
                onPress={() => {
                  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                  setExpandedDay(isExpanded ? null : day);
                }}
                style={{
                  backgroundColor: isExpanded ? "#195E4B" : "#A6F4C5",
                  paddingVertical: 12,
                  paddingHorizontal: 14,
                  borderRadius: 8,
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                        <RNText
                          style={{
                            fontFamily: fonts.bold,
                            fontSize: 18,
                            color: isExpanded ? "#fff" : "#195E4B",
                          }}
                        >
                          {day} – {dayDate.toLocaleDateString("en-NZ", { month: "short", day: "numeric" })}
                        </RNText>
                        <RNText style={{ color: isExpanded ? "#fff" : "#195E4B", fontSize: 18 }}>
                          {isExpanded ? "▲" : "▼"}
                        </RNText>
                      </TouchableOpacity>

                      {/* Expanded Content */}
                      {isExpanded && (
                        <View style={{ padding: 12 }}>

                {slots.length === 0 && <RNText style={{ fontFamily: fonts.medium, fontSize: 16, marginBottom: 8 }}>No slots available</RNText>}

                {slots.map((slot) => {
                  // --- Determine employees to show ---
                  const [startHour, startMin] = slot.start.split(":").map(Number);
                  const slotTimestampForDay = getNZTimestamp(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate(), startHour, startMin);

                  // Hide past slots on the current day
                  if (dayDate.toDateString() === nzNow.toDateString() && slotTimestampForDay < nzNow.getTime()) {
                    return null;
                  }

                  console.log("Processing slot:", slot.start, "-", slot.end);
                  console.log("Slot timestamp for day:", slotTimestampForDay);
                  console.log("Slot available employees:", slot.availableEmployees.map(e => e.employeeName));

                  // Check if local user already booked this slot
                  const bookedForThisSlot = reduxState.booking.bookings.find(
                    (b) =>
                      b.slotKey?.startsWith(`${slotTimestampForDay}-${slot.start}-${slot.end}-`) &&
                      b.bookedByUid === "local"
                  );

                  console.log("bookedForThisSlot:", bookedForThisSlot);

                  let employeesToShow: EmployeeSlot[] = [];
                  let showRemoveButton = false;

                  if (bookedForThisSlot) {
                    // Local user booked → show only the booked employee
                    employeesToShow = slot.availableEmployees.filter(
                      (e) => e.employeeId === bookedForThisSlot.employeeId
                    );
                    showRemoveButton = true;
                    console.log("Local booking exists, showing booked employee:", employeesToShow.map(e => e.employeeName));
                  } else {
                    // Filter employees not booked by anyone else
                    employeesToShow = slot.availableEmployees.filter((e) => {
                      const slotKey = `${slotTimestampForDay}-${slot.start}-${slot.end}-${e.employeeId}`;

                      const isBookedBySomeoneElse = bookings.some(
                        (b) =>
                          b.slotKey === slotKey &&
                          b.bookedByUid !== auth().currentUser?.uid
                      );

                      console.log(`Employee: ${e.employeeName}, SlotKey: ${slotKey}, bookedBySomeoneElse?`, isBookedBySomeoneElse);
                      return !isBookedBySomeoneElse;
                    });

                    showRemoveButton = false;
                    console.log("Employees available after filtering:", employeesToShow.map(e => e.employeeName));
                  }

                  // Hide slot if no employees available
                  if (employeesToShow.length === 0) {
                    console.log("No employees available for this slot → hiding slot.");
                    return null;
                  }

                  const isSelected =
                    selectedSlot &&
                    selectedSlot.slot.start === slot.start &&
                    selectedSlot.slot.end === slot.end &&
                    selectedSlot.dayDate.toDateString() === dayDate.toDateString();

                  return (
                    <View key={`${slot.start}-${slot.end}`} style={{ marginBottom: 12 }}>
                      {/* Slot button */}
                      <TouchableOpacity
                        style={{
                          padding: 12,
                          marginVertical: 4,
                          backgroundColor: isSelected ? "#888" : "#195E4B",
                          borderRadius: 6,
                          borderWidth: isSelected ? 2 : 0,
                          borderColor: "#A6F4C5",
                        }}
                        onPress={() =>
                          setSelectedSlot(
                            isSelected ? null : { dayDate, slot: { ...slot, availableEmployees: employeesToShow } }
                          )
                        }
                      >
                        <RNText style={{ color: "white", textAlign: "center", fontWeight: "700" }}>
                          {slot.start} - {slot.end}
                        </RNText>
                      </TouchableOpacity>

                      {/* Employees list */}
                      {isSelected && (
                        <View style={{ backgroundColor: "#fff", padding: 12, borderRadius: 6, marginBottom: 10 }}>
                          <RNText style={{ fontFamily: fonts.bold, fontSize: 16, marginBottom: 6 }}>
                            Choose who will service this time:
                          </RNText>

                          {employeesToShow.map((e) => {
                            const slotKey = `${slotTimestampForDay}-${slot.start}-${slot.end}-${e.employeeId}`;
                            const profileImgSrc = e.profilePic
                              ? { uri: e.profilePic }
                              : require("../../assets/images/default.png");

                            return (
                              <View key={e.employeeId} style={{ marginBottom: 12 }}>
                                {/* Profile */}
                                <TouchableOpacity
                                  onPress={() => navigation.navigate("MeetAndrewScreen", { employeeId: e.employeeId })}
                                  style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}
                                >
                                  <Image
                                    source={profileImgSrc}
                                    style={{ width: 40, height: 40, borderRadius: 20, marginRight: 8 }}
                                  />
                                  <RNText style={{ fontFamily: fonts.medium, fontSize: 15, color: "#195E4B" }}>
                                    {e.employeeName} • View Profile
                                  </RNText>
                                </TouchableOpacity>

                                {/* Action button */}
                                {showRemoveButton ? (
                                  <TouchableOpacity
                                    onPress={() => removeSlot(slotKey)}
                                    style={{ padding: 10, backgroundColor: "#FF4D4D", borderRadius: 6 }}
                                  >
                                    <RNText style={{ color: "white", textAlign: "center", fontWeight: "700" }}>
                                      Change Service Person
                                    </RNText>
                                  </TouchableOpacity>
                                ) : (
                                  <TouchableOpacity
                                    onPress={() => bookSlot(dayDate, slot, e)}
                                    style={{ padding: 10, backgroundColor: "#195E4B", borderRadius: 6 }}
                                  >
                                    <RNText style={{ color: "white", textAlign: "center", fontWeight: "700" }}>
                                      Book with {e.employeeName}
                                    </RNText>
                                  </TouchableOpacity>
                                )}
                              </View>
                            );
                          })}
                        </View>
                      )}
                    </View>
                  );
                })}
            </View>
            )}
              </View>
            );
          })}
        </ScrollView>
      </StyledView>
    </SafeAreaView>
  );
}

/*
<Button
  title="Show Redux Store"
  onPress={() => console.log("Redux Store", JSON.stringify(reduxState, null, 2))}
  color="#FF6347"
/>

<Button
  title="Clear All Bookings"
  color="#FF6347"
  onPress={() => {
    dispatch(setSelectedDates([]));
    dispatch(setBookings([]));
    setSelectedSlot(null);
    Alert.alert("All bookings cleared", "All your bookings have been reset.");
  }}
/>
*/

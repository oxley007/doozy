import React, { useEffect, useState } from "react";
import { View, Text as RNText, ScrollView, Image, TouchableOpacity, SafeAreaView } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";
import { styled } from "nativewind";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";

import { RootState, setUserDetails } from "../../store/store";
import fonts from "../../assets/fonts/fonts.js";
import AdminBottomMenu from '../Menus/AdminBottomMenu';
import BottomMenu from "../Menus/BottomMenu";
import { getPickupFeatures } from "../../utils/getPickupFeatures";
import { resetExpiredOverrides } from "../../utils/resetExpiredOverrides";

const StyledView = styled(View);

export default function WeeklyPickups() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user);

  const [allUsers, setAllUsers] = useState<any[]>([]);
  //const [weekPickups, setWeekPickups] = useState<any[]>([]);
  const [weekPickups, setWeekPickups] = useState<Record<string, any[]>>({});
  const [weekOffset, setWeekOffset] = useState(0); // 0 = this week, 1 = next week, etc.

  const goNextWeek = () => setWeekOffset((prev) => prev + 1);
  const goPrevWeek = () => setWeekOffset((prev) => prev - 1);


  // ------------------- Check Admin Role -------------------
  useEffect(() => {
    const checkAdminRole = async () => {
      const currentUser = auth().currentUser;
      if (!currentUser) return;

      try {
        const userDoc = await firestore().collection("users").doc(currentUser.uid).get();
        if (userDoc.exists) {
          const userData = userDoc.data();
          const isAdmin = userData?.role === "admin";
          dispatch(setUserDetails({ ...userData, isAdmin }));
        }
      } catch (err) {
        console.error("Error checking admin role:", err);
      }
    };
    checkAdminRole();
  }, [dispatch]);

  // ------------------- Fetch all users -------------------
  useEffect(() => {
    const unsubscribe = firestore()
      .collection("users")
      .onSnapshot(async (snapshot) => {
        const users = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setAllUsers(users);
      });
    return () => unsubscribe();
  }, []);

  // ------------------- Calculate Week Pickups -------------------
  // ------------------- Calculate Week Pickups (subscriptions + bookings) -------------------
  useEffect(() => {
    if (!allUsers.length) return;

    const fetchPickups = async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Start of week (Monday)
      const dayOfWeek = today.getDay(); // Sunday=0, Monday=1, ...
      const diffToMonday = (dayOfWeek + 6) % 7; // days since Monday
      const monday = new Date(today);
      monday.setDate(today.getDate() - diffToMonday + weekOffset * 7);

      // End of week (Sunday)
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      sunday.setHours(23, 59, 59, 999);

      const serviceDaysMap: Record<string, number[]> = {
        "Twice a week Premium": [1, 5],
        "Twice a week": [1, 5],
        "Once a week Premium Friday": [5],
        "Once a week Friday": [5],
        "Once a week Premium": [3],
        "Once a week": [3],
        "Once a week Artificial Grass": [3],
        "Twice a week Artificial Grass": [1, 5],
      };

      const buildIconsArray = (features: any) => {
        const icons: { icon: string; label: string }[] = [];
        icons.push({ icon: "delete-circle", label: "Doo pickup" });
        if (features.isPremium || features.isArtificialGrass) {
          if (features.isPremium || features.isArtificialGrass)
            icons.push({ icon: "spray", label: "Deodorising spray" });
          if (features.isPremium && features.soilNeutraliser)
            icons.push({ icon: "leaf", label: "Soil Neutraliser" });
          if (features.isArtificialGrass)
            icons.push({ icon: "broom", label: "Artificial Grass clean" });
          if (features.isPremium && features.fertiliser)
            icons.push({ icon: "grass", label: "Fertiliser" });
          if (features.isPremium && features.aeration)
            icons.push({ icon: "circle-slice-8", label: "Lawn aeration" });
          if (features.isPremium && features.overseed)
            icons.push({ icon: "flask-outline", label: "Test Soil Levels" });
          if (features.isPremium && features.repair)
            icons.push({ icon: "tools", label: "Repair bare spots" });
        } else {
          icons.push({ icon: "magnify", label: "Spot check" });
        }
        return icons;
      };

      // ------------------- Subscription Pickups -------------------
      const subscriptionPickups = allUsers
        .map((u) => {
          const subscription: any = u.subscription;
          if (!subscription) return null;
          const status = subscription.status?.toLowerCase() || "N/A";
          if (!["trial", "trialing", "active", "past_due"].includes(status)) return null;

          // Overrides
          const overrideSets = [
            subscription.dateOverrideOne,
            subscription.dateOverrideTwo,
            subscription.dateOverrideThree,
            subscription.dateOverrideFour,
            subscription.dateOverrideFive,
            subscription.dateOverrideSix,
          ].filter(Boolean);

          let activeOverrides: any[] = [];
          for (const set of overrideSets) {
            const ov = set?.[0];
            if (ov?.override === 1 && ov.date) {
              const ovDate = new Date(ov.date * 1000);
              if (ovDate >= monday && ovDate <= sunday) {
                if (ov.overrideCancel === 1) continue;
                activeOverrides.push({ ...ov, dateObj: ovDate });
              }
            }
          }

          const plan = subscription.plan || "N/A";
          const serviceDays = serviceDaysMap[plan] || [];
          if (!serviceDays.length && !activeOverrides.length) return null;

          let pickups: any[] = [];

          // Add overrides
          activeOverrides.forEach((ov) => {
            pickups.push({
              userId: u.id,
              userName: u.name,
              email: u.email,
              plan,
              status: subscription.status || "N/A",
              subscription,
              date: ov.dateObj,
              iconsToRender: buildIconsArray(getPickupFeatures(plan, subscription.planStart, ov.dateObj)),
              address: u.address || {},
              isBooking: false,
            });
          });

          // Add regular pickups
          for (let d = 0; d < 7; d++) {
            const day = new Date(monday);
            day.setDate(monday.getDate() + d);
            const weekday = day.getDay();
            if (!serviceDays.includes(weekday)) continue;

            const hasOverride = activeOverrides.some(
              (ov) => ov.dateObj.toDateString() === day.toDateString()
            );
            if (hasOverride) continue;

            pickups.push({
              userId: u.id,
              userName: u.name,
              email: u.email,
              plan,
              status: subscription.status || "N/A",
              subscription,
              date: day,
              iconsToRender: buildIconsArray(getPickupFeatures(plan, subscription.planStart, day)),
              address: u.address || {},
              isBooking: false,
            });
          }

          return pickups;
        })
        .flat()
        .filter(Boolean);

      // ------------------- Bookings -------------------
      const bookingsSnapshot = await firestore().collection("bookings").get();

      const bookingsPickups = bookingsSnapshot.docs
        .map(doc => {
          const data = doc.data();
          const bookingDate = data.date?.toDate ? data.date.toDate() : new Date(data.date);

          if (!data.userDetails) return null;

          return {
            bookingId: doc.id,
            userId: data.bookedByUid || "unknown",
            userName: data.userDetails.name || "Unknown User",
            email: data.userDetails.email || "N/A",
            plan: data.BookingType || "N/A",
            confirmed: data.confirmed !== undefined && data.confirmed !== null ? data.confirmed : "N/A",
            status: "Booking",
            subscription: null,
            date: bookingDate,
            servicesRequested: Object.entries(data.bookingServices || {})
              .filter(([_, val]) => val)
              .map(([key]) => key), // or map to display names if you want
            numberOfDogs: data.userDetails.numberOfDogs ?? 0,
            dogBreeds: data.userDetails.dogBreeds || null,
            iconsToRender: Object.entries(data.bookingServices || {})
              .filter(([_, val]) => val)
              .map(([key]) => {
                const iconMap: Record<string, string> = { walk: "walk", doo: "delete-circle", deod: "spray" };
                const labelMap: Record<string, string> = { walk: "Walk", doo: "Doo pickup", deod: "Deodorising spray" };
                return { icon: iconMap[key], label: labelMap[key] };
              }),
            address: data.userDetails.address || {},
            isBooking: true,
          };
        })
        .filter(Boolean)
        .filter(b => b.date >= monday && b.date <= sunday);

      console.log("bookingsPickups", bookingsPickups);

      // ------------------- Merge & Group -------------------
      const allPickups = [...subscriptionPickups, ...bookingsPickups];
      allPickups.sort((a, b) => a.date.getTime() - b.date.getTime());

      const daysOfWeek = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
      const grouped = daysOfWeek.reduce((acc, day) => { acc[day] = []; return acc; }, {} as Record<string, any[]>);

      allPickups.forEach(p => {
        const jsDay = p.date.getDay();
        const shiftedIndex = (jsDay + 6) % 7;
        const dayName = daysOfWeek[shiftedIndex];
        grouped[dayName].push(p);
      });

      setWeekPickups(grouped);
    };

    fetchPickups().catch(console.error);
  }, [allUsers, weekOffset]);

  // ------------------- Render override icons helper -------------------
  const getOverrideIcons = (ov: any, subscription: any) => {
    const icons: { icon: string; label: string }[] = [];
    if (ov.overrideIcons === 1 && ov.icons) {
      const o = ov.icons;
      if (o.doo) icons.push({ icon: "delete-circle", label: "Doo pickup" });
      if (o.deod) icons.push({ icon: "spray", label: "Deodorising spray" });
      if (o.soilNeutraliser) icons.push({ icon: "leaf", label: "Soil Neutraliser" });
      if (o.fert) icons.push({ icon: "grass", label: "Fertiliser" });
      if (o.aer) icons.push({ icon: "circle-slice-8", label: "Lawn aeration" });
      if (o.seed) icons.push({ icon: "flask-outline", label: "Overseeding" });
      if (o.repair) icons.push({ icon: "tools", label: "Repair bare spots" });
    } else {
      const features = getPickupFeatures(subscription.plan, subscription.planStart, new Date());
      if (features.isPremium || features.isArtificialGrass) {
        icons.push({ icon: "delete-circle", label: "Doo pickup" });
        if (features.isPremium || features.isArtificialGrass)
          icons.push({ icon: "spray", label: "Deodorising spray" });
        if (features.isPremium && features.soilNeutraliser)
          icons.push({ icon: "leaf", label: "Soil Neutraliser" });
        if (features.isArtificialGrass) icons.push({ icon: "broom", label: "Artificial Grass clean" });
        if (features.isPremium && features.fertiliser) icons.push({ icon: "grass", label: "Fertiliser" });
        if (features.isPremium && features.aeration) icons.push({ icon: "circle-slice-8", label: "Lawn aeration" });
        if (features.isPremium && features.overseed) icons.push({ icon: "flask-outline", label: "Overseeding" });
        if (features.isPremium && features.repair) icons.push({ icon: "tools", label: "Repair bare spots" });
      } else {
        icons.push({ icon: "magnify", label: "Spot check" });
      }
    }
    return icons;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#E9FCDA" }}>
    <StyledView className="flex-1" style={{ backgroundColor: "#E9FCDA" }}>

        {/* Heading */}
        <View style={{ justifyContent: "center", alignItems: "center", marginBottom: 30, marginTop: 60 }}>
          <RNText style={{ fontFamily: fonts.bold, fontSize: 32, color: "#195E4B" }}>Weekly Pickups</RNText>
          <RNText style={{ fontFamily: fonts.bold, fontSize: 28, color: "#999999", lineHeight: 28, textAlign: "center" }}>
            All pickups from Monday to Sunday
          </RNText>
        </View>

        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 16, paddingLeft: '5%', paddingRight: '5%' }}>
          <TouchableOpacity
            onPress={goPrevWeek}
            style={{ padding: 8, backgroundColor: "#195E4B", borderRadius: 6, width: 120 }}
          >
            <RNText style={{ color: "#fff", textAlign: 'center' }}>Previous Week</RNText>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={goNextWeek}
            style={{ padding: 8, backgroundColor: "#195E4B", borderRadius: 6, width: 120 }}
          >
            <RNText style={{ color: "#fff", textAlign: 'center' }}>Next Week</RNText>
          </TouchableOpacity>
        </View>
        <ScrollView style={{ padding: 20 }}>
        {/* Week Pickups */}
        {Object.values(weekPickups).every((arr) => arr.length === 0) ? (
          <RNText style={{ fontFamily: fonts.medium, fontSize: 16, color: "#999999" }}>
            No pickups scheduled for this week.
          </RNText>
        ) : (
          Object.entries(weekPickups).map(([day, pickups]) => {
            const daysOfWeek = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
            const dayIndex = daysOfWeek.indexOf(day); // Monday=0

            const today = new Date();
            today.setHours(0,0,0,0);
            const diffToMonday = (today.getDay() + 6) % 7;
            const monday = new Date(today);
            monday.setDate(today.getDate() - diffToMonday + weekOffset * 7); // <-- apply weekOffset

            const dayDate = new Date(monday);
            dayDate.setDate(monday.getDate() + dayIndex);

            return (
              <View key={day} style={{ marginBottom: 20 }}>
                {/* Day Header */}
                <RNText
                  style={{
                    fontFamily: fonts.bold,
                    fontSize: 22,
                    color: "#8C2B2B",
                    marginBottom: 8,
                  }}
                >
                  {day} – {dayDate.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                </RNText>

                {/* If no pickups */}
                {pickups.length === 0 ? (
                  <RNText
                    style={{
                      fontFamily: fonts.medium,
                      fontSize: 14,
                      color: "#999999",
                      marginBottom: 8,
                    }}
                  >
                    No pickups scheduled.
                  </RNText>
                ) : (
                  pickups.map((p) => (
                    <TouchableOpacity
                      key={p.userId + "-" + p.date.toDateString()}
                      onPress={() =>
                        navigation.navigate("UserNextSixPickups", { userId: p.userId, userName: p.userName })
                      }
                    >
                      <StyledView
                        style={{
                          borderRadius: 5,
                          padding: 16,
                          marginBottom: 12,
                          backgroundColor: "#eeeeee",
                          borderWidth: p.isBooking ? 2 : 0,
                          borderColor: p.isBooking ? "#195E4B" : "transparent",
                        }}
                      >
                        {/* User Name */}
                        <RNText style={{ fontFamily: fonts.bold, fontSize: 20, color: "#195E4B", marginBottom: 4 }}>
                          {p.userName}
                        </RNText>

                        {/* Email */}
                        <RNText style={{ fontFamily: fonts.medium, fontSize: 16, color: "#999999", marginBottom: 4 }}>
                          {p.email}
                        </RNText>

                        {/* Plan / Status */}
                        <RNText style={{ fontFamily: fonts.medium, fontSize: 16, color: "#195E4B", marginBottom: 4 }}>
                          {p.isBooking ? `Status: ${p.status}` : `Plan: ${p.plan || "N/A"}`}
                        </RNText>

                        {/* Address */}
                        {p.address?.formattedAddress && (
                          <RNText style={{ fontFamily: fonts.medium, fontSize: 16, color: "#195E4B", marginBottom: 4 }}>
                            Address: {p.address.formattedAddress}
                          </RNText>
                        )}

                        {/* Service Date */}
                        <RNText style={{ fontFamily: fonts.bold, fontSize: 16, color: "#999999", marginBottom: 4 }}>
                          Service Date: {p.date.toDateString()}
                        </RNText>

                        {/* Booking-specific info */}
                        {p.isBooking && (
                          <>
                            <RNText
                              style={{
                                fontFamily: fonts.medium,
                                fontSize: 16,
                                color: p.confirmed === false ? "red" : "#195E4B",
                                marginBottom: 4,
                              }}
                            >
                              Confirmed: {p.confirmed === true ? "Yes" : p.confirmed === false ? "No" : "N/A"}
                            </RNText>
                            <RNText style={{ fontFamily: fonts.medium, fontSize: 16, color: "#195E4B", marginBottom: 4 }}>
                              Services: {(p.servicesRequested || []).join(", ")}
                            </RNText>
                            <RNText style={{ fontFamily: fonts.medium, fontSize: 16, color: "#195E4B", marginBottom: 4 }}>
                              Number of dogs: {p.numberOfDogs ?? "N/A"}
                            </RNText>
                            <RNText style={{ fontFamily: fonts.medium, fontSize: 16, color: "#195E4B", marginBottom: 4 }}>
                              Breeds: {p.dogBreeds ?? ""}
                            </RNText>
                          </>
                        )}

                        {/* Icons */}
                        <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 6 }}>
                          {Array.isArray(p.iconsToRender) &&
                            p.iconsToRender.map((ic, idx) => (
                              <View key={idx} style={{ flexDirection: "row", alignItems: "center", marginRight: 10, marginBottom: 4 }}>
                                <Icon name={ic.icon} size={18} color="#195E4B" style={{ marginRight: 4 }} />
                                <RNText style={{ fontFamily: fonts.medium, fontSize: 15, color: "#195E4B" }}>{ic.label}</RNText>
                              </View>
                            ))}
                        </View>
                      </StyledView>
                    </TouchableOpacity>
                  ))
                )}
              </View>
            );
          })
        )}

        {/* ✅ Button to weekly service */}
        <TouchableOpacity
          style={{
            marginTop: 10,
            padding: 8,
            backgroundColor: "#195E4B",
            borderRadius: 6,
          }}
          onPress={() => navigation.navigate("AdminHome")} // 👈 navigate instead of console.log
        >
          <RNText style={{ color: "#fff", textAlign: "center" }}>
            Back to todays services
          </RNText>
        </TouchableOpacity>

        <View style={{ paddingBottom: 180 }} />
      </ScrollView>




    </StyledView>

        <AdminBottomMenu />
        <BottomMenu />

    </SafeAreaView>
  );
}

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
  useEffect(() => {
    if (!allUsers.length) return;

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

    const pickupsThisWeek = allUsers
      .map((u) => {
        const subscription: any = u.subscription;
        if (!subscription) return null;

        const status = subscription.status?.toLowerCase() || "N/A";
        if (!["trial", "trialing", "active", "past_due"].includes(status)) return null;

        // ------------------- Check Overrides -------------------
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

        // ------------------- Regular plan -------------------
        const plan = subscription.plan || "N/A";
        const serviceDays = serviceDaysMap[plan] || [];
        if (!serviceDays.length && !activeOverrides.length) return null;

        let pickups: any[] = [];

        // 1️⃣ Add overrides first
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
          });
        });

        // 2️⃣ Add regular pickups for this week if not overridden
        for (let d = 0; d < 7; d++) {
          const day = new Date(monday);
          day.setDate(monday.getDate() + d);
          const weekday = day.getDay();

          if (!serviceDays.includes(weekday)) continue;

          // skip if override exists
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
          });
        }

        return pickups;
      })
      .flat()
      .filter(Boolean);

    pickupsThisWeek.sort((a, b) => a.date.getTime() - b.date.getTime());
    //setWeekPickups(pickupsThisWeek);

    const daysOfWeek = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

    // initialise
    const grouped = daysOfWeek.reduce((acc, day) => {
      acc[day] = [];
      return acc;
    }, {} as Record<string, any[]>);

    // assign pickups to correct day (Monday-first)
    pickupsThisWeek.forEach(p => {
      const jsDay = p.date.getDay(); // 0 = Sun … 6 = Sat
      const shiftedIndex = (jsDay + 6) % 7; // shift so Monday=0 … Sunday=6
      const dayName = daysOfWeek[shiftedIndex];
      grouped[dayName].push(p);
    });

    setWeekPickups(grouped);


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
            // Calculate actual date for this day
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
                      key={p.userId}
                      onPress={() =>
                        navigation.navigate("UserNextSixPickups", { userId: p.userId, userName: p.userName })
                      }
                    >
                      <StyledView
                        key={`${p.userId}-${p.date.toDateString()}`}
                        style={{
                          borderRadius: 5,
                          padding: 16,
                          marginBottom: 12,
                          backgroundColor: "#eeeeee",
                        }}
                      >
                        {/* User Name */}
                        <RNText
                          style={{
                            fontFamily: fonts.bold,
                            fontSize: 20,
                            color: "#195E4B",
                            marginBottom: 4,
                          }}
                        >
                          {p.userName}
                        </RNText>

                        {/* Email */}
                        <RNText
                          style={{
                            fontFamily: fonts.medium,
                            fontSize: 16,
                            color: "#999999",
                            marginBottom: 4,
                          }}
                        >
                          {p.email}
                        </RNText>

                        {/* Plan */}
                        <RNText
                          style={{
                            fontFamily: fonts.medium,
                            fontSize: 16,
                            color: "#195E4B",
                            marginBottom: 4,
                          }}
                        >
                          Plan: {p.plan || "N/A"}
                        </RNText>

                        {/* Status */}
                        <RNText
                          style={{
                            fontFamily: fonts.medium,
                            fontSize: 16,
                            color: "#195E4B",
                            marginBottom: 4,
                          }}
                        >
                          Status: {p.status || "N/A"}
                        </RNText>

                        {/* Address */}
                        {p.address?.formattedAddress && (
                          <RNText
                            style={{
                              fontFamily: fonts.medium,
                              fontSize: 16,
                              color: "#195E4B",
                              marginBottom: 4,
                            }}
                          >
                            Address: {p.address.formattedAddress}
                          </RNText>
                        )}

                        {/* Service Date */}
                        <RNText
                          style={{
                            fontFamily: fonts.bold,
                            fontSize: 16,
                            color: "#999999",
                            marginBottom: 4,
                          }}
                        >
                          Service Date: {p.date.toDateString()}
                        </RNText>

                        {/* Icons */}
                        <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 6 }}>
                          {Array.isArray(p.iconsToRender) &&
                            p.iconsToRender.map((ic, idx) => (
                              <View
                                key={idx}
                                style={{
                                  flexDirection: "row",
                                  alignItems: "center",
                                  marginRight: 10,
                                  marginBottom: 4,
                                }}
                              >
                                <Icon
                                  name={ic.icon}
                                  size={18}
                                  color="#195E4B"
                                  style={{ marginRight: 4 }}
                                />
                                <RNText
                                  style={{
                                    fontFamily: fonts.medium,
                                    fontSize: 15,
                                    color: "#195E4B",
                                  }}
                                >
                                  {ic.label}
                                </RNText>
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

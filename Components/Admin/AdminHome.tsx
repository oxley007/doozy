import React, { useEffect, useState } from "react";
import { View, Text as RNText, ScrollView, Image, TouchableOpacity } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";
import { styled } from "nativewind";
import { useNavigation } from "@react-navigation/native";

import { RootState, setUserDetails } from "../../store/store";
import fonts from "../../assets/fonts/fonts.js";
import BottomMenu from "../Menus/BottomMenu";
import AdminBottomMenu from "../Menus/AdminBottomMenu";
import PlanningUsersList from "../Admin/PlanningUsersList";
import { resetExpiredOverrides } from "../../utils/resetExpiredOverrides";
import { renderPickupIcons } from "../../utils/renderPickupIcons";

const StyledView = styled(View);

interface PickupItem {
  userId: string;
  userName: string;
  email: string;
  subscription: any;
  date: Date;
  planStartDate?: Date | null;
  address?: { formattedAddress?: string };
  iconsToRender: Array<{ icon?: React.ReactNode; label?: string }>;
}

export default function AdminHome() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user);

  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [todayPickups, setTodayPickups] = useState<PickupItem[]>([]);

  const toDate = (input: any): Date | null => {
    if (!input) return null;
    if (input.toDate && typeof input.toDate === "function") return input.toDate();
    if (typeof input === "object" && "seconds" in input) return new Date(input.seconds * 1000);
    if (typeof input === "number") return new Date(input * 1000);
    if (input instanceof Date) return input;
    return null;
  };

  // ---------------- Check Admin Role ----------------
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

  // ---------------- Fetch All Users ----------------
  useEffect(() => {
    const unsubscribe = firestore()
      .collection("users")
      .onSnapshot((snapshot) => {
        const users = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setAllUsers(users);
      });

    return () => unsubscribe();
  }, []);

  // ---------------- Compute Today's Pickups ----------------
  useEffect(() => {
    if (!allUsers.length) return;

    let isMounted = true;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

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

    const computePickups = async () => {
      const result: PickupItem[] = [];

      for (const u of allUsers) {
        const s = u.subscription;
        if (!s) continue;
        const status = s.status?.toLowerCase();
        if (!["trial", "trialing", "active", "past_due"].includes(status)) continue;

        let nextPickupDate: Date | null = null;

        // --- Check overrides ---
        const overrides = [
          s.dateOverrideOne,
          s.dateOverrideTwo,
          s.dateOverrideThree,
          s.dateOverrideFour,
          s.dateOverrideFive,
          s.dateOverrideSix,
        ].filter(Boolean);

        for (const set of overrides) {
          const ov = set[0];
          if (!ov || ov.override !== 1 || !ov.date || ov.overrideCancel === 1) continue;
          const ovDate = toDate(ov.date);
          if (ovDate && ovDate >= today && ovDate <= endOfDay) {
            nextPickupDate = ovDate;
            break;
          }
        }

        // --- Fallback to plan days ---
        if (!nextPickupDate) {
          const planDays = serviceDaysMap[s.plan] || [];
          if (planDays.length) {
            const weekday = today.getDay();
            const nextDay = planDays.map((d) => (d - weekday + 7) % 7).sort((a, b) => a - b)[0];
            nextPickupDate = new Date(today);
            nextPickupDate.setDate(today.getDate() + nextDay);
          }
        }

        if (!nextPickupDate) continue;

        // --- Precompute icons ---
        let iconsToRender: Array<{ icon?: React.ReactNode; label?: string }> = [];
        try {
          iconsToRender = renderPickupIcons({ subscription: s, date: nextPickupDate });
        } catch (err) {
          console.error("Error rendering pickup icons:", err);
        }

        result.push({
          userId: u.id,
          userName: u.name || "Unknown",
          email: u.email || "",
          subscription: s,
          date: nextPickupDate,
          planStartDate: toDate(s.planStart),
          address: u.address || {},
          iconsToRender,
        });

        // --- Reset expired overrides (async, non-blocking) ---
        try {
          await resetExpiredOverrides(u.id, s, dispatch, today, nextPickupDate);
        } catch {}
      }

      if (isMounted) setTodayPickups(result);
    };

    computePickups();

    return () => {
      isMounted = false;
    };
  }, [allUsers, dispatch]);

  // ---------------- Navigation helper ----------------
  const goToUser = (userId: string, userName: string) => {
    navigation.navigate("UserNextSixPickups", { userId, userName, fromPlanningList: true });
  };

  return (
    <StyledView className="flex-1 p-4" style={{ backgroundColor: "#E9FCDA" }}>
      <ScrollView style={{ padding: 20 }}>
        {/* Logo */}
        <View style={{ justifyContent: "center", alignItems: "center" }}>
          <Image
            source={require("../../assets/images/Doozy_dog_logo.png")}
            style={{ width: 325, height: 325 }}
            resizeMode="contain"
          />
        </View>

        {/* Heading */}
        <View style={{ justifyContent: "center", alignItems: "center", marginBottom: 30 }}>
          <RNText style={{ fontFamily: fonts.bold, fontSize: 32, color: "#195E4B" }}>Your Admin!</RNText>
          <RNText style={{ fontFamily: fonts.bold, fontSize: 28, color: "#999999", lineHeight: 28, textAlign: "center" }}>
            All the admin you need to doo!
          </RNText>
        </View>

        {/* Today's Pickups */}
        <StyledView style={{ marginTop: 20 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <RNText style={{ fontFamily: fonts.bold, fontSize: 24, color: "#195E4B" }}>Today's Pickups</RNText>
            <RNText style={{ fontFamily: fonts.bold, fontSize: 16, color: "#999999" }}>
              {new Date().toLocaleDateString("en-NZ", { weekday: "short", day: "numeric", month: "short" })}
            </RNText>
          </View>

          {todayPickups.length === 0 ? (
            <RNText style={{ fontFamily: fonts.medium, fontSize: 16, color: "#999999" }}>
              No pickups scheduled for today.
            </RNText>
          ) : (
            todayPickups.map((p) => (
              <TouchableOpacity key={p.userId} onPress={() => goToUser(p.userId, p.userName)}>
                <StyledView style={{ borderRadius: 5, padding: 16, marginBottom: 16, backgroundColor: "#eeeeee" }}>
                  <RNText style={{ fontFamily: fonts.bold, fontSize: 20, color: "#195E4B", marginBottom: 4 }}>
                    {p.userName}
                  </RNText>
                  <RNText style={{ fontFamily: fonts.medium, fontSize: 16, color: "#999999", marginBottom: 4 }}>
                    {p.email}
                  </RNText>
                  <RNText style={{ fontFamily: fonts.medium, fontSize: 16, color: "#195E4B", marginBottom: 4 }}>
                    Plan: {p.subscription?.plan || "N/A"}
                  </RNText>
                  <RNText style={{ fontFamily: fonts.medium, fontSize: 16, color: "#195E4B", marginBottom: 4 }}>
                    Status: {p.subscription?.status || "N/A"}
                  </RNText>
                  <RNText style={{ fontFamily: fonts.bold, fontSize: 16, color: "#999999", marginBottom: 4 }}>
                    Next Service Date: {p.date.toDateString()}
                  </RNText>
                  <RNText style={{ fontFamily: fonts.medium, fontSize: 16, color: "#999999", marginBottom: 4 }}>
                    Start Date: {p.planStartDate?.toDateString() ?? "N/A"}
                  </RNText>

                  {p.address?.formattedAddress && (
                    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
                      <RNText style={{ fontFamily: fonts.bold, fontSize: 16, color: "#195E4B" }}>
                        {p.address.formattedAddress}
                      </RNText>
                    </View>
                  )}

                  {/* Icons row */}
                  <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 6 }}>
                    {p.iconsToRender.map((item, idx) => (
                      <View key={idx} style={{ flexDirection: "row", alignItems: "center", marginRight: 6 }}>
                        {item.icon && React.isValidElement(item.icon) ? item.icon : null}
                        {item.label && (
                          <RNText style={{ fontSize: 12, color: "#555", marginLeft: 2 }}>
                            {item.label}
                          </RNText>
                        )}
                      </View>
                    ))}
                  </View>
                </StyledView>
              </TouchableOpacity>
            ))
          )}
        </StyledView>

        {/* Services this Week button */}
        <TouchableOpacity
          style={{ marginTop: 10, padding: 8, backgroundColor: "#195E4B", borderRadius: 6 }}
          onPress={() => navigation.navigate("WeeklyPickups")}
        >
          <RNText style={{ color: "#fff", textAlign: "center" }}>Services this Week</RNText>
        </TouchableOpacity>

        {/* Add/Edit your availability */}
        <TouchableOpacity
          style={{ marginTop: 10, padding: 8, backgroundColor: "#195E4B", borderRadius: 6 }}
          onPress={() => navigation.navigate("EmployeeBookingDetails")}
        >
          <RNText style={{ color: "#fff", textAlign: "center" }}>Edit your booking availability</RNText>
        </TouchableOpacity>

        {/* Users List */}
        <View style={{ marginBottom: 30 }}>
          <PlanningUsersList users={allUsers} onUserPress={(user) => goToUser(user.id, user.name)} />
        </View>

        <View style={{ paddingBottom: 180 }} />
      </ScrollView>

      <AdminBottomMenu />
      <BottomMenu />
    </StyledView>
  );
}

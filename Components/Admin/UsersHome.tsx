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
import AdminBottomMenu from '../Menus/AdminBottomMenu';
import { resetExpiredOverrides } from "../../utils/resetExpiredOverrides";

const StyledView = styled(View);

export default function UsersHome() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user);

  const [allUsers, setAllUsers] = useState<any[]>([]);

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

        for (const u of users) {
          const subscription = u.subscription;
          if (!subscription) continue;

          const status = subscription.status?.toLowerCase();
          if (!["trial", "trialing", "active"].includes(status)) continue;

          let nextPickupDate: Date | null = null;
          try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const weekday = today.getDay();
            const plan = subscription.plan;
            const planDay = subscription.planDay;

            if (plan.includes("Friday")) {
              const daysUntilFriday = (5 - weekday + 7) % 7;
              nextPickupDate = new Date(today);
              nextPickupDate.setDate(today.getDate() + daysUntilFriday);
            } else if (plan.includes("Twice a week")) {
              const seq = [1, 3, 5];
              const nextSeq = seq.find((d) => d >= weekday) ?? seq[0];
              const daysUntil = (nextSeq - weekday + 7) % 7;
              nextPickupDate = new Date(today);
              nextPickupDate.setDate(today.getDate() + daysUntil);
            } else if (plan.includes("Once a week") && !plan.includes("Friday")) {
              const dayNum = planDay === "mon" ? 1 : 3;
              const daysUntil = (dayNum - weekday + 7) % 7;
              nextPickupDate = new Date(today);
              nextPickupDate.setDate(today.getDate() + daysUntil);
            } else if (plan.includes("Artificial Grass")) {
              const daysUntilWed = (3 - weekday + 7) % 7;
              nextPickupDate = new Date(today);
              nextPickupDate.setDate(today.getDate() + daysUntilWed);
            }
          } catch (err) {
            console.error("Error calculating nextPickupDate:", err);
          }

          try {
            await resetExpiredOverrides(
              u.id,
              subscription,
              dispatch,
              new Date(),
              nextPickupDate ?? undefined
            );
          } catch (err) {
            console.error(`Error resetting overrides for user ${u.id}:`, err);
          }
        }
      });

    return () => unsubscribe();
  }, [dispatch]);

  return (
    <StyledView className="flex-1 p-4 bg-gray-100" style={{ backgroundColor: "#E9FCDA" }}>
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
          <RNText style={{ fontFamily: fonts.bold, fontSize: 32, color: "#195E4B" }}>All Users</RNText>
          <RNText style={{ fontFamily: fonts.bold, fontSize: 28, color: "#999999", lineHeight: 28, textAlign: "center" }}>
            Manage and view all Doozy users
          </RNText>
        </View>

        {/* Users List */}
        <View style={{ marginBottom: 30 }}>
          <RNText style={{ fontSize: 22, fontWeight: "bold", marginBottom: 10 }}>
            Users:
          </RNText>

          {allUsers.length === 0 ? (
            <RNText>No users found.</RNText>
          ) : (
            allUsers
              .filter((u) => {
                const status = u.subscription?.status?.toLowerCase();
                return [
                  "trialing",
                  "trial",
                  "active",
                  "past_due",
                  "canceled",
                  "incomplete",
                  "incomplete_expired",
                  "unpaid",
                ].includes(status);
              })
              .map((u) => {
                const plan = u.subscription?.plan || "N/A";
                const planStart = u.subscription?.planStart
                  ? new Date(u.subscription.planStart.seconds * 1000).toDateString()
                  : "N/A";

                return (
                  <TouchableOpacity
                    key={u.id}
                    onPress={() =>
                      navigation.navigate("UserNextSixPickups", {
                        userId: u.id,
                        userName: u.name || "Unknown",
                      })
                    }
                  >
                    <View
                      style={{
                        padding: 12,
                        backgroundColor: "#fff",
                        marginBottom: 10,
                        borderRadius: 8,
                      }}
                    >
                      <RNText>Name: {u.name || "N/A"}</RNText>
                      <RNText>Email: {u.email || "N/A"}</RNText>
                      <RNText>Status: {u.subscription?.status || "N/A"}</RNText>
                      <RNText>Plan: {plan}</RNText>
                      <RNText>Plan Start: {planStart}</RNText>
                    </View>
                  </TouchableOpacity>
                );
              })
          )}
        </View>

        <View style={{ paddingBottom: 180 }} />
      </ScrollView>

      <AdminBottomMenu />
      <BottomMenu />
    </StyledView>
  );
}

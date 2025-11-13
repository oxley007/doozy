import React, { useMemo, useEffect, useState } from "react";
import { View, Text as RNText } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { styled } from "nativewind";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import firestore from '@react-native-firebase/firestore';
import { setUserDetails, RootState } from "../../store/store";

import fonts from '../../assets/fonts/fonts.js';

// --- Shared function ---
function getPickupFeatures(plan: string, planStartTs: number, date: Date) {
  const planStart = new Date(planStartTs * 1000);
  const weeksSinceStart = Math.floor(
    (date.getTime() - planStart.getTime()) / (1000 * 60 * 60 * 24 * 7)
  );
  const month = date.getMonth();
  const isPremium = plan.includes("Premium");
  const isArtificialGrass = plan.includes("Artificial Grass");

  const soilNeutraliser = isPremium && weeksSinceStart % 4 === 0;
  const fertiliser = isPremium && ![0, 1, 5, 6, 7].includes(month) && weeksSinceStart % 8 === 0;
  const overseed = fertiliser;
  const aeration = fertiliser && [2, 3, 4, 8, 9, 10].includes(month);
  const repair = isPremium && weeksSinceStart % 2 === 0;

  return { soilNeutraliser, fertiliser, overseed, aeration, repair, isPremium, isArtificialGrass };
}

const StyledView = styled(View);

interface Override {
  override: number;
  date?: number | null;
  overrideIcons: number;
  overrideCancel: number;
  icons: {
    doo: number;
    deod: number;
    soilNeutraliser: number;
    fert: number;
    aer: number;
    seed: number;
    repair: number;
  };
}

interface Subscription {
  plan: string;
  planStart: number;
  planDay?: string;
  status?: string;
  dateOverrideOne?: Override[];
  dateOverrideTwo?: Override[];
  dateOverrideThree?: Override[];
  dateOverrideFour?: Override[];
  dateOverrideFive?: Override[];
  dateOverrideSix?: Override[];
  [key: string]: any;
}

export default function DoozyNextSixPickups() {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user);
  const [subscription, setSubscription] = useState<Subscription | null>(user?.subscription || null);

  // ---------------- Firestore live listener ----------------
  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = firestore()
      .collection("users")
      .doc(user.uid)
      .onSnapshot((docSnap) => {
        if (!docSnap || !docSnap.exists) return;
        const data = docSnap.data();
        setSubscription(data?.subscription || null);
        dispatch(setUserDetails({ subscription: data?.subscription || null }));
      });

    return () => unsubscribe();
  }, [user?.uid, dispatch]);

  // ---------------- Reset expired overrides (flicker-proof) ----------------
  useEffect(() => {
    if (!user?.uid || !subscription) return;

    const now = Date.now();
    const overrideKeys = [
      'dateOverrideOne',
      'dateOverrideTwo',
      'dateOverrideThree',
      'dateOverrideFour',
      'dateOverrideFive',
      'dateOverrideSix',
    ];

    let updated = false;
    const newOverrides: Override[] = overrideKeys.map((key) => {
      const currentOverride = subscription[key as keyof Subscription]?.[0];

      if (currentOverride?.override === 1 && currentOverride.date && currentOverride.originalDate) {
        const originalTs = currentOverride.originalDate * 1000;
        // Only reset override if the original scheduled date has passed
        if (now > originalTs) {
          updated = true;
          return { ...currentOverride, override: 0, date: null, overrideCancel: 0, overrideIcons: 0 };
        }
        // Otherwise keep the override active
        return currentOverride;
      }

      // No override present
      return currentOverride || { override: 0, date: null, overrideCancel: 0, overrideIcons: 0, icons: { doo:0,deod:0,soilNeutraliser:0,fert:0,aer:0,seed:0,repair:0 } };
    });

    if (updated) {
      const updateObj: any = {};
      overrideKeys.forEach((key, idx) => {
        updateObj[key] = [newOverrides[idx]];
      });

      firestore()
        .collection('users')
        .doc(user.uid)
        .update({ subscription: { ...subscription, ...updateObj } })
        .then(() => dispatch(setUserDetails({ subscription: { ...subscription, ...updateObj } })))
        .catch(console.error);
    }
  }, [subscription, user?.uid, dispatch]);

  // ---------------- Compute next six pickups ----------------
  const nextSixDates = useMemo(() => {
    if (!subscription?.planStart || !subscription?.plan) return [];

    const plan = subscription.plan;
    const planDay = subscription.planDay;

    const overrideArray = [
      subscription.dateOverrideOne?.[0],
      subscription.dateOverrideTwo?.[0],
      subscription.dateOverrideThree?.[0],
      subscription.dateOverrideFour?.[0],
      subscription.dateOverrideFive?.[0],
      subscription.dateOverrideSix?.[0],
    ];

    const getNextWeekday = (from: Date, weekday: number) => {
      const d = new Date(from);
      d.setDate(d.getDate() + ((7 + weekday - d.getDay()) % 7 || 7));
      return d;
    };

    const generatedDates: { date: Date; original: Date; override?: Override }[] = [];
    let lastOriginal = new Date(); // start from today

    for (let i = 0; i < 6; i++) {
      // calculate next original date
      let nextOriginal: Date;
      switch (plan) {
        case "Twice a week":
        case "Twice a week Premium": {
          const day = lastOriginal.getDay();
          nextOriginal = day >= 2 && day <= 4 ? getNextWeekday(lastOriginal, 5) : getNextWeekday(lastOriginal, 1);
          break;
        }
        case "Once a week Friday":
        case "Once a week Premium Friday":
          nextOriginal = getNextWeekday(lastOriginal, 5);
          break;
        case "Once a week":
        case "Once a week Premium":
          nextOriginal = planDay === "mon" ? getNextWeekday(lastOriginal, 1) : getNextWeekday(lastOriginal, 3);
          break;
        case "Once a week Artificial Grass":
          nextOriginal = getNextWeekday(lastOriginal, 3);
          break;
        default:
          nextOriginal = new Date(lastOriginal.getTime() + 7*24*60*60*1000);
      }

      const override = overrideArray[i];
      const now = Date.now();

      // logic to respect originalDate
      let finalDate: Date;
      if (override?.override === 1 && override.date) {
        const originalTs = override.originalDate ? override.originalDate * 1000 : nextOriginal.getTime();
        // Use override date if today is before original date
        finalDate = now < originalTs ? new Date(override.date * 1000) : nextOriginal;
      } else {
        finalDate = nextOriginal;
      }

      generatedDates.push({ original: nextOriginal, date: finalDate, override });

      lastOriginal = nextOriginal;
    }

    return generatedDates.map(item => ({
      date: item.date,
      ...getPickupFeatures(plan, subscription.planStart, item.date),
      override: item.override,
    }));

  }, [subscription]);

  const formatDate = (date: Date) =>
    date.toLocaleDateString("en-NZ", { weekday: "long", day: "numeric", month: "long" });

  return (
    <StyledView style={{ borderRadius: 5, padding: 20, marginBottom: 40, backgroundColor: "#eeeeee" }}>
      <View style={{ paddingTop: 20, paddingBottom: 20 }}>
        <RNText style={{ fontFamily: fonts.bold, fontSize: 24, color: "#195E4B", marginBottom: 10 }}>
          Next 6 pickups
        </RNText>

        {subscription?.status === "planning" ? (
          <RNText style={{ fontFamily: fonts.bold, fontSize: 20, color: "#999999", marginBottom: 8 }}>
            Scheduling your Doozy. Check back soon
          </RNText>
        ) : (
          nextSixDates.map((item, idx) => {
            const o = item.override;

            return (
              <View key={idx} style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
                {/* Icons */}
                {o?.overrideIcons === 1 ? (
                  <>
                    {o.icons.doo === 1 && <Icon name="delete-circle" size={18} color="#195E4B" style={{ marginRight: 6 }} />}
                    {o.icons.deod === 1 && <Icon name="spray" size={18} color="#195E4B" style={{ marginRight: 6 }} />}
                    {o.icons.soilNeutraliser === 1 && <Icon name="leaf" size={18} color="#195E4B" style={{ marginRight: 6 }} />}
                    {o.icons.fert === 1 && <Icon name="grass" size={18} color="#195E4B" style={{ marginRight: 6 }} />}
                    {o.icons.aer === 1 && <Icon name="circle-slice-8" size={18} color="#195E4B" style={{ marginRight: 6 }} />}
                    {o.icons.seed === 1 && <Icon name="flask-outline" size={18} color="#195E4B" style={{ marginRight: 6 }} />}
                    {o.icons.repair === 1 && <Icon name="tools" size={18} color="#195E4B" style={{ marginRight: 6 }} />}
                  </>
                ) : (
                  <>
                    <Icon name="delete-circle" size={18} color="#195E4B" style={{ marginRight: 6 }} />
                    {(item.isPremium || item.isArtificialGrass) && <Icon name="spray" size={18} color="#195E4B" style={{ marginRight: 6 }} />}
                    {item.isPremium && item.soilNeutraliser && <Icon name="leaf" size={18} color="#195E4B" style={{ marginRight: 6 }} />}
                    {item.isPremium && item.fertiliser && <Icon name="grass" size={18} color="#195E4B" style={{ marginRight: 6 }} />}
                    {item.isPremium && item.aeration && <Icon name="circle-slice-8" size={18} color="#195E4B" style={{ marginRight: 6 }} />}
                    {item.isPremium && item.overseed && <Icon name="flask-outline" size={18} color="#195E4B" style={{ marginRight: 6 }} />}
                    {item.isPremium && item.repair && <Icon name="tools" size={18} color="#195E4B" style={{ marginRight: 6 }} />}
                    {item.isArtificialGrass && <Icon name="broom" size={18} color="#195E4B" style={{ marginRight: 6 }} />}
                    {!item.isPremium && !item.isArtificialGrass && <Icon name="magnify" size={18} color="#195E4B" style={{ marginRight: 6 }} />}
                  </>
                )}

                {/* Date + skipped label */}
                <RNText style={{ fontFamily: fonts.medium, fontSize: 15, color: "#195E4B", marginRight: 6 }}>
                  {formatDate(item.date)}
                </RNText>
                {o?.overrideCancel === 1 && <RNText style={{ fontFamily: fonts.bold, fontSize: 10, color: "#C00" }}>Cancelled. To be refunded</RNText>}
              </View>
            );
          })
        )}
      </View>
      {/* Legend / Key at bottom */}
      {subscription?.status !== "planning" && (
        <View style={{ marginTop: 20, borderTopWidth: 1, borderTopColor: "#ccc", paddingTop: 10 }}>
          <RNText style={{ fontFamily: fonts.bold, fontSize: 12, color: "#555", marginBottom: 4 }}>
            Key:
          </RNText>

          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
            {/* Always present */}
            <View style={{ flexDirection: "row", alignItems: "center", marginRight: 12 }}>
              <Icon name="delete-circle" size={14} color="#195E4B" style={{ marginRight: 4 }} />
              <RNText style={{ fontSize: 10, color: "#555" }}>Doo pickup</RNText>
            </View>

            {/* Premium features */}
            {subscription?.plan.includes("Premium") && (
              <>
                <View style={{ flexDirection: "row", alignItems: "center", marginRight: 12 }}>
                  <Icon name="spray" size={14} color="#195E4B" style={{ marginRight: 4 }} />
                  <RNText style={{ fontSize: 10, color: "#555" }}>Deodorising spray</RNText>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", marginRight: 12 }}>
                  <Icon name="leaf" size={14} color="#195E4B" style={{ marginRight: 4 }} />
                  <RNText style={{ fontSize: 10, color: "#555" }}>Soil Neutraliser</RNText>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", marginRight: 12 }}>
                  <Icon name="grass" size={14} color="#195E4B" style={{ marginRight: 4 }} />
                  <RNText style={{ fontSize: 10, color: "#555" }}>Fertiliser</RNText>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", marginRight: 12 }}>
                  <Icon name="circle-slice-8" size={14} color="#195E4B" style={{ marginRight: 4 }} />
                  <RNText style={{ fontSize: 10, color: "#555" }}>Lawn Aeration</RNText>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", marginRight: 12 }}>
                  <Icon name="flask-outline" size={14} color="#195E4B" style={{ marginRight: 4 }} />
                  <RNText style={{ fontSize: 10, color: "#555" }}>Overseeding</RNText>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", marginRight: 12 }}>
                  <Icon name="tools" size={14} color="#195E4B" style={{ marginRight: 4 }} />
                  <RNText style={{ fontSize: 10, color: "#555" }}>Repair bare spots</RNText>
                </View>
              </>
            )}

            {/* Artificial Grass plan */}
            {subscription?.plan.includes("Artificial Grass") && (
              <>
                <View style={{ flexDirection: "row", alignItems: "center", marginRight: 12 }}>
                  <Icon name="spray" size={14} color="#195E4B" style={{ marginRight: 4 }} />
                  <RNText style={{ fontSize: 10, color: "#555" }}>Deodorising spray</RNText>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", marginRight: 12 }}>
                  <Icon name="broom" size={14} color="#195E4B" style={{ marginRight: 4 }} />
                  <RNText style={{ fontSize: 10, color: "#555" }}>Artificial Grass clean</RNText>
                </View>
              </>
            )}

            {/* Non-premium / spot check */}
            {!subscription?.plan.includes("Premium") && !subscription?.plan.includes("Artificial Grass") && (
              <View style={{ flexDirection: "row", alignItems: "center", marginRight: 12 }}>
                <Icon name="magnify" size={14} color="#195E4B" style={{ marginRight: 4 }} />
                <RNText style={{ fontSize: 10, color: "#555" }}>Spot check</RNText>
              </View>
            )}
          </View>
        </View>
      )}
    </StyledView>
  );
}

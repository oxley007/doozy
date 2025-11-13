import React, { useEffect, useState } from "react";
import { View, Text as RNText } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { styled } from "nativewind";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import firestore from '@react-native-firebase/firestore';
import { setUserDetails, RootState } from "../../store/store";

import { getNextSixPickups } from "../../utils/getNextSixPickups";
import { resetExpiredOverrides } from "../../utils/resetExpiredOverrides";
import { getNextSixTwiceAWeekPickups } from "../../utils/getNextSixTwiceAWeekPickups";

import fonts from '../../assets/fonts/fonts.js';

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
  planStart: number | Date;
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

interface DoozyPickupsProps {
  mode?: "nextSix" | "next"; // default is "nextSix"
}

// ---------------- Shared pickup features function ----------------
function getPickupFeatures(plan: string | null | undefined, planStart: Date, date: Date) {
  const safePlan = plan || "";
  const isPremium = safePlan.includes("Premium");

  if (!isPremium || !planStart || !date) return { soilNeutraliser: false, isPremium };

  const weeksSinceStart = Math.floor(
    (date.getTime() - planStart.getTime()) / (1000 * 60 * 60 * 24 * 7)
  );

  return {
    soilNeutraliser: weeksSinceStart % 4 === 0,
    isPremium,
  };
}

/*
function getPickupFeatures(plan: string | null | undefined, planStart: Date, date: Date) {
  const weeksSinceStart = Math.floor(
    (date.getTime() - planStart.getTime()) / (1000 * 60 * 60 * 24 * 7)
  );
  const month = date.getMonth();

  const safePlan = plan || "";
  const isPremium = safePlan.includes("Premium");
  const isArtificialGrass = safePlan.includes("Artificial Grass");

  const soilNeutraliser = isPremium && weeksSinceStart % 4 === 0;
  const fertiliser = isPremium && ![0, 1, 5, 6, 7].includes(month) && weeksSinceStart % 8 === 0;
  const overseed = fertiliser;
  const aeration = fertiliser && [2, 3, 4, 8, 9, 10].includes(month);
  const repair = isPremium && weeksSinceStart % 2 === 0;

  return { soilNeutraliser, fertiliser, overseed, aeration, repair, isPremium, isArtificialGrass };
}
*/

export default function DoozyNextSixPickups({ mode = "nextSix" }: DoozyPickupsProps) {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user);
  const [subscription, setSubscription] = useState<Subscription | null>(user?.subscription || null);
  const [nextSixDates, setNextSixDates] = useState<any[]>([]);

  // ---------------- Firestore live listener ----------------
  useEffect(() => {
    if (!user?.uid) return;
    const unsubscribe = firestore()
      .collection("users")
      .doc(user.uid)
      .onSnapshot(
        (docSnap) => {
          if (!docSnap || !docSnap.exists) {
            console.warn("No Firestore document found or snapshot was null.");
            return;
          }

          const data = docSnap.data();
          if (!data) {
            console.warn("Firestore document has no data.");
            return;
          }

          setSubscription(data.subscription || null);
          dispatch(setUserDetails({ subscription: data.subscription || null }));
        },
        (error) => {
          console.error("Firestore snapshot error:", error);
        }
      )
    return () => unsubscribe();
  }, [user?.uid, dispatch]);

  // ---------------- Compute next pickups ----------------
  useEffect(() => {
    if (!subscription || !user?.uid) return;
    let isMounted = true;

    (async () => {
      try {
        let pickups = [];
        const twiceAWeekPlans = ["Twice a week", "Twice a week Premium", "Twice a week Artificial Grass"];
        const onceAWeekPlans = [
          "Once a week Premium Friday",
          "Once a week Premium",
          "Once a week Artificial Grass",
          "Once a week Friday",
          "Once a week"
        ];

        if (twiceAWeekPlans.includes(subscription.plan)) {
          pickups = await getNextSixTwiceAWeekPickups(subscription);
        } else {
          pickups = await getNextSixPickups(subscription);
        }

        // Map features exactly like UserNextSixPickups
        pickups = pickups.map(p => {
          const planStartDate = p.planStart instanceof Date ? p.planStart : new Date(subscription.planStart);
          const dateObj = p.date instanceof Date ? p.date : new Date(p.date);

          const features = getPickupFeatures(subscription.plan, planStartDate, dateObj);

          // Artificial grass broom logic
          const showBroom =
            features.isArtificialGrass &&
            ((subscription.plan.includes("Once a week")) || (subscription.plan.includes("Twice a week") && dateObj.getDay() === 1));

          return { ...p, ...features, showBroom };
        });

        if (mode === "next") pickups = pickups.slice(0, 1);

        // Reset expired overrides
        if (pickups.length > 0) {
          const nextPickupDate = pickups[0].date instanceof Date ? pickups[0].date : new Date(pickups[0].date);
          await resetExpiredOverrides(user.uid, subscription, dispatch, new Date(), nextPickupDate);
        }

        if (isMounted) setNextSixDates(pickups);
      } catch (err) {
        console.error("Error generating pickups:", err);
      }
    })();

    return () => { isMounted = false; };
  }, [subscription, user?.uid, mode]);

  const formatDate = (date: Date) =>
    date.toLocaleDateString("en-NZ", { weekday: "long", day: "numeric", month: "long" });

  // ---------------- RENDER ----------------
  return (
    <StyledView style={{ borderRadius: 5, padding: 20, marginBottom: 40, backgroundColor: "#eeeeee" }}>
      <View style={{ paddingTop: 20, paddingBottom: 20 }}>
        <RNText style={{ fontFamily: fonts.bold, fontSize: 24, color: "#195E4B", marginBottom: 10 }}>
          {mode === "next" ? "Next subscription service" : "Next 6 subscriptiion services"}
        </RNText>

        {mode === "next" && (
          <RNText style={{ fontFamily: fonts.medium, fontSize: 16, color: "#999999", marginBottom: 8 }}>
            Current Plan: {subscription?.plan || "No plan"}
          </RNText>
        )}

        {subscription?.status === "planning" ? (
          <RNText style={{ fontFamily: fonts.bold, fontSize: 20, color: "#999999", marginBottom: 8 }}>
            Scheduling your Doozy. Check back soon
          </RNText>
        ) : (
          nextSixDates.map((item, idx) => {
            const o = item.override;
            return (
              <View key={idx} style={{ flexDirection: "row", alignItems: "center", marginBottom: 6, flexWrap: "wrap" }}>
                {o?.overrideIcons === 1 ? (
                  <>
                    {o.icons.doo === 1 && <Icon name="delete-circle" size={18} color="#195E4B" style={{ marginRight: 6}} />}
                    {o.icons.deod === 1 && <Icon name="spray" size={18} color="#195E4B" style={{ marginRight: 6}} />}
                    {o.icons.soilNeutraliser === 1 && <Icon name="leaf" size={18} color="#195E4B" style={{ marginRight: 6}} />}
                    {o.icons.fert === 1 && <Icon name="grass" size={18} color="#195E4B" style={{ marginRight: 6}} />}
                    {o.icons.aer === 1 && <Icon name="circle-slice-8" size={18} color="#195E4B" style={{ marginRight: 6}} />}
                    {o.icons.seed === 1 && <Icon name="flask-outline" size={18} color="#195E4B" style={{ marginRight: 6}} />}
                    {o.icons.repair === 1 && <Icon name="tools" size={18} color="#195E4B" style={{ marginRight: 6}} />}
                  </>
                ) : (
                  <>
                    <Icon name="delete-circle" size={18} color="#195E4B" style={{ marginRight: 6}} />
                    {(item.isPremium || item.isArtificialGrass) && <Icon name="spray" size={18} color="#195E4B" style={{ marginRight: 6}} />}
                    {item.isPremium && item.soilNeutraliser && <Icon name="leaf" size={18} color="#195E4B" style={{ marginRight: 6}} />}
                    {item.isPremium && item.fertiliser && <Icon name="grass" size={18} color="#195E4B" style={{ marginRight: 6}} />}
                    {item.isPremium && item.aeration && <Icon name="circle-slice-8" size={18} color="#195E4B" style={{ marginRight: 6}} />}
                    {item.isPremium && item.overseed && <Icon name="flask-outline" size={18} color="#195E4B" style={{ marginRight: 6}} />}
                    {item.isPremium && item.repair && <Icon name="tools" size={18} color="#195E4B" style={{ marginRight: 6}} />}
                    {item.showBroom && <Icon name="broom" size={18} color="#195E4B" style={{ marginRight: 6}} />}
                    {!item.isPremium && !item.isArtificialGrass && <Icon name="magnify" size={18} color="#195E4B" style={{ marginRight: 6}} />}
                  </>
                )}
                <RNText style={{ fontFamily: fonts.medium, fontSize: 15, color: "#195E4B", marginRight: 6 }}>
                  {formatDate(item.date)}
                </RNText>
                {o?.overrideCancel === 1 && <RNText style={{ fontFamily: fonts.bold, fontSize: 10, color: "#C00" }}>Cancelled. To be refunded</RNText>}
              </View>
            );
          })
        )}
      </View>
      {/* Legend / Key remains identical */}
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
            {(subscription?.plan || "").includes("Premium") && (
              <>
                <View style={{ flexDirection: "row", alignItems: "center", marginRight: 12 }}>
                  <Icon name="spray" size={14} color="#195E4B" style={{ marginRight: 4 }} />
                  <RNText style={{ fontSize: 10, color: "#555" }}>Deodorising spray</RNText>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", marginRight: 12 }}>
                  <Icon name="leaf" size={14} color="#195E4B" style={{ marginRight: 4 }} />
                  <RNText style={{ fontSize: 10, color: "#555" }}>Soil Neutraliser</RNText>
                </View>
                {/*
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
                  <RNText style={{ fontSize: 10, color: "#555" }}>Test Soil Levels</RNText>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", marginRight: 12 }}>
                  <Icon name="tools" size={14} color="#195E4B" style={{ marginRight: 4 }} />
                  <RNText style={{ fontSize: 10, color: "#555" }}>Repair bare spots</RNText>
                </View>
                */
                }
              </>
            )}

            {/* Artificial Grass plan */}
            {(subscription?.plan || "").includes("Artificial Grass") && (
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
            {subscription?.plan &&
             !((subscription?.plan || "").includes("Premium")) &&
             !((subscription?.plan || "").includes("Artificial Grass")) && (
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

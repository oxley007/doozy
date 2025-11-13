import React, { useMemo, useEffect, useState } from "react";
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

// --- Shared function ---
function getPickupFeatures(plan: string | null | undefined, planStartTs: number, date: Date) {
  const planStart = new Date(planStartTs * 1000);
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

interface DoozyPickupsProps {
  mode?: "nextSix" | "next"; // default is "nextSix"
}

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
      .onSnapshot((docSnap) => {
        if (!docSnap || !docSnap.exists) return;
        const data = docSnap.data();
        setSubscription(data?.subscription || null);
        dispatch(setUserDetails({ subscription: data?.subscription || null }));
      });

    return () => unsubscribe();
  }, [user?.uid, dispatch]);

  // ---------------- Compute next pickups + reset expired overrides ----------------
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
        } else if (onceAWeekPlans.includes(subscription.plan)) {
          pickups = await getNextSixPickups(subscription);
        } else {
          pickups = await getNextSixPickups(subscription);
        }

        // If mode="next", only keep the first pickup
        if (mode === "next") pickups = pickups.slice(0, 1);

        // ✅ Reset expired overrides here
        if (user?.uid && pickups.length > 0) {
          const nextPickupDate = pickups[0].date instanceof Date
            ? pickups[0].date
            : new Date(pickups[0].date);
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
          {mode === "next" ? "Next service" : "Next 6 services"}
        </RNText>

        {/* Only show Current Plan when mode = next */}
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

            // ✅ Determine if broom should show
            const showBroom =
              item.isArtificialGrass &&
              (
                (subscription?.plan?.includes("Once a week")) || // always show for once-a-week
                (subscription?.plan?.includes("Twice a week") && item.date.getDay() === 1) // Monday only
              );

            return (
              <View key={idx} style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
                {/* Override icons take priority */}
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
                    {/* Always show doo pickup */}
                    <Icon name="delete-circle" size={18} color="#195E4B" style={{ marginRight: 6}} />

                    {/* Spray for Premium or Artificial Grass */}
                    {(item.isPremium || item.isArtificialGrass) && (
                      <Icon name="spray" size={18} color="#195E4B" style={{ marginRight: 6}} />
                    )}

                    {/* Premium features */}
                    {item.isPremium && item.soilNeutraliser && <Icon name="leaf" size={18} color="#195E4B" style={{ marginRight: 6}} />}
                    {item.isPremium && item.fertiliser && <Icon name="grass" size={18} color="#195E4B" style={{ marginRight: 6}} />}
                    {item.isPremium && item.aeration && <Icon name="circle-slice-8" size={18} color="#195E4B" style={{ marginRight: 6}} />}
                    {item.isPremium && item.overseed && <Icon name="flask-outline" size={18} color="#195E4B" style={{ marginRight: 6}} />}
                    {item.isPremium && item.repair && <Icon name="tools" size={18} color="#195E4B" style={{ marginRight: 6}} />}

                    {/* Artificial Grass broom */}
                    {showBroom && <Icon name="broom" size={18} color="#195E4B" style={{ marginRight: 6}} />}

                    {/* Non-premium / non-artificial grass fallback */}
                    {!item.isPremium && !item.isArtificialGrass && (
                      <Icon name="magnify" size={18} color="#195E4B" style={{ marginRight: 6}} />
                    )}
                  </>
                )}

                {/* Date + cancelled label */}
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

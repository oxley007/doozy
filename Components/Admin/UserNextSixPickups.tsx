import React, { useEffect, useState } from "react";
import { View, Text as RNText, ScrollView, TouchableOpacity, Image, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import firestore from "@react-native-firebase/firestore";
import { useRoute, useNavigation } from "@react-navigation/native";
import { styled } from "nativewind";
import { getNextSixPickups } from "../../utils/getNextSixPickups";
import { getPickupFeatures } from "../../utils/getPickupFeatures";
import { resetExpiredOverrides } from "../../utils/resetExpiredOverrides";
import { useDispatch } from "react-redux";

import CustomerDetailsCardAdmin from './CustomerDetailsCardAdmin';
import PlanningVisitDetails from './PlanningVisitDetails';
import SoilTestGraph from '../SoilTest/SoilTestGraph';
import AdminBottomMenu from '../Menus/AdminBottomMenu';
import BottomMenu from "../Menus/BottomMenu";
import UserServiceNotes from '../ServiceNotes/UserServiceNotes';
import PickupGraph from '../PickUpCount/PickupGraph';
import fonts from "../../assets/fonts/fonts.js";

const StyledView = styled(View);

export default function UserNextSixPickups() {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();

  const { userId, userName, fromPlanningList } = route.params as {
    userId: string;
    userName: string;
    fromPlanningList?: boolean;
  };

  const [subscription, setSubscription] = useState<any | null>(null);
  const [nextSixDates, setNextSixDates] = useState<any[]>([]);
  const [userFromFirestore, setUserFromFirestore] = useState<any | null>(null);

  // ---------------- Firestore live listener ----------------
  useEffect(() => {
    if (!userId) return;

    const unsubscribe = firestore()
      .collection("users")
      .doc(userId)
      .onSnapshot((docSnap) => {
        if (!docSnap.exists) return;
        const data = docSnap.data();
        setUserFromFirestore(data);
        setSubscription(data?.subscription || null);
      });

    return () => unsubscribe();
  }, [userId]);

  // ---------------- Compute next six pickups ----------------
  useEffect(() => {
    if (!subscription || !userId) return;

    let isMounted = true;

    (async () => {
      try {
        let pickups: any[] = [];

        const twiceAWeekPlans = ["Twice a week", "Twice a week Premium", "Twice a week Artificial Grass"];
        const onceAWeekPlans = [
          "Once a week Premium Friday",
          "Once a week Premium",
          "Once a week Artificial Grass",
          "Once a week Friday",
          "Once a week"
        ];

        if (twiceAWeekPlans.includes(subscription.plan)) {
          const { getNextSixTwiceAWeekPickups } = await import("../../utils/getNextSixTwiceAWeekPickups");
          pickups = await getNextSixTwiceAWeekPickups(subscription);
        } else {
          pickups = await getNextSixPickups(subscription);
        }

        // --- Precompute feature flags per pickup ---
        pickups = pickups.map(p => {
          const planStartDate = p.planStart instanceof Date
            ? p.planStart
            : new Date(subscription.planStart); // always fallback to subscription.planStart

          const dateObj = p.date instanceof Date ? p.date : new Date(p.date);

          const features = getPickupFeatures(subscription.plan, planStartDate, dateObj);

          // Compute broom boolean
          const day = dateObj.getDay();
          const showBroom =
            features.isArtificialGrass &&
            ((subscription.plan.includes("Once a week") && day === 3) || // Wednesday for Once a week AG
             (subscription.plan.includes("Twice a week") && day === 1)); // Monday for Twice a week AG

          return { ...p, ...features, showBroom };
        });

        // ---- Call resetExpiredOverrides AFTER we've generated pickups ----
        if (pickups.length > 0) {
          const nextPickupDate =
            pickups[0].date instanceof Date ? pickups[0].date : new Date(pickups[0].date);
          await resetExpiredOverrides(userId, subscription, dispatch, new Date(), nextPickupDate);
        }

        if (isMounted) setNextSixDates(pickups);
      } catch (err) {
        console.error("Error generating next six pickups:", err);
      }
    })();

    return () => { isMounted = false; };
  }, [subscription, userId, dispatch]);

  const formatDate = (date?: Date) =>
    date ? date.toLocaleDateString("en-NZ", { weekday: "long", day: "numeric", month: "long" }) : "-";

  const renderIcons = (item: any) => {
    const o = item.override;
    const iconsArray: React.ReactNode[] = [];

    // ---------------- Overrides ----------------
    if (o?.overrideIcons === 1 && o.icons) {
      if (o.icons.doo === 1) iconsArray.push(<Icon key="doo" name="delete-circle" size={18} color="#195E4B" style={{ marginRight: 6 }} />);
      if (o.icons.deod === 1) iconsArray.push(<Icon key="deod" name="spray" size={18} color="#195E4B" style={{ marginRight: 6 }} />);
      if (o.icons.soilNeutraliser === 1) iconsArray.push(<Icon key="soil" name="leaf" size={18} color="#195E4B" style={{ marginRight: 6 }} />);
      if (o.icons.fert === 1) iconsArray.push(<Icon key="fert" name="grass" size={18} color="#195E4B" style={{ marginRight: 6 }} />);
      if (o.icons.aer === 1) iconsArray.push(<Icon key="aer" name="circle-slice-8" size={18} color="#195E4B" style={{ marginRight: 6 }} />);
      if (o.icons.seed === 1) iconsArray.push(<Icon key="seed" name="flask-outline" size={18} color="#195E4B" style={{ marginRight: 6 }} />);
      if (o.icons.repair === 1) iconsArray.push(<Icon key="repair" name="tools" size={18} color="#195E4B" style={{ marginRight: 6 }} />);
    } else {
      // ---------------- Default icons ----------------
      iconsArray.push(<Icon key="doo" name="delete-circle" size={18} color="#195E4B" style={{ marginRight: 6 }} />);

      if (item.isPremium || item.isArtificialGrass) {
        iconsArray.push(<Icon key="spray" name="spray" size={18} color="#195E4B" style={{ marginRight: 6 }} />);
      }

      if (item.isPremium) {
        if (item.soilNeutraliser) iconsArray.push(<Icon key="leaf" name="leaf" size={18} color="#195E4B" style={{ marginRight: 6 }} />);
        if (item.fertiliser) iconsArray.push(<Icon key="fert" name="grass" size={18} color="#195E4B" style={{ marginRight: 6 }} />);
        if (item.aeration) iconsArray.push(<Icon key="aeration" name="circle-slice-8" size={18} color="#195E4B" style={{ marginRight: 6 }} />);
        if (item.overseed) iconsArray.push(<Icon key="overseed" name="flask-outline" size={18} color="#195E4B" style={{ marginRight: 6 }} />);
        if (item.repair) iconsArray.push(<Icon key="repair-fallback" name="tools" size={18} color="#195E4B" style={{ marginRight: 6 }} />);
      }

      if (item.showBroom) {
        iconsArray.push(<Icon key="broom" name="broom" size={18} color="#195E4B" style={{ marginRight: 6 }} />);
      }

      if (!item.isPremium && !item.isArtificialGrass) {
        iconsArray.push(<Icon key="magnify" name="magnify" size={18} color="#195E4B" style={{ marginRight: 6 }} />);
      }
    }

    return iconsArray;
  };

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
          <RNText style={{ fontFamily: fonts.bold, fontSize: 32, color: "#195E4B" }}>User Details!</RNText>
          <RNText style={{ fontFamily: fonts.bold, fontSize: 28, color: "#999999", lineHeight: 28, textAlign: "center" }}>
            All the user details you need to know!
          </RNText>
        </View>

        <RNText style={{ fontFamily: fonts.bold, fontSize: 28, color: "#195E4B", marginBottom: 12 }}>
          {userName}'s Next 6 Services
        </RNText>

        <View style={styles.card}>
          {subscription?.status === "planning" ? (
            <RNText style={{ fontFamily: fonts.bold, fontSize: 20, color: "#999999", marginBottom: 8 }}>
              Scheduling their Doozy. Check back soon
            </RNText>
          ) : (
            nextSixDates.map((item, idx) => (
              <View key={idx} style={{ flexDirection: "row", alignItems: "center", marginBottom: 8, flexWrap: "wrap" }}>
                {renderIcons(item)}

                <RNText style={{ fontFamily: fonts.medium, fontSize: 15, color: "#195E4B", marginRight: 6 }}>
                  {formatDate(item.date)}
                </RNText>

                {item.override?.overrideCancel === 1 && (
                  <RNText style={{ fontFamily: fonts.bold, fontSize: 10, color: "#C00" }}>
                    Cancelled. To be refunded
                  </RNText>
                )}
              </View>
            ))
          )}
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
                      <RNText style={{ fontSize: 10, color: "#555" }}>Test Soil</RNText>
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
        </View>

        <StyledView style={{ borderRadius: 5, paddingLeft: 20, paddingRight: 20, paddingTop: 20, marginBottom: 40, backgroundColor: "#eeeeee" }}>
        <View style={{ marginBottom: 20 }}>
          <TouchableOpacity
            style={{ padding: 8, backgroundColor: "#195E4B", borderRadius: 6 }}
            onPress={() => {
              if (!userId) {
                Alert.alert("No user selected");
                return;
              }
              navigation.navigate("EditOverrides", { userId });
            }}
          >
            <RNText style={{ color: "#fff", textAlign: "center" }}>Override (Edit) Service Dates</RNText>
          </TouchableOpacity>

        </View>
        </StyledView >

        <RNText style={{ fontFamily: fonts.bold, fontSize: 28, color: "#195E4B", marginBottom: 12 }}>
          Edit Details
        </RNText>

        {!userFromFirestore ? (
          <RNText>Loading user details...</RNText>
        ) : (
          <CustomerDetailsCardAdmin
            user={userFromFirestore}
            onUserUpdate={(updatedUser) => setUserFromFirestore(updatedUser)}
          />
        )}

        {fromPlanningList && (
          <PlanningVisitDetails visitDetails={userFromFirestore?.visitDetails || null} />
        )}

        <StyledView style={{ borderRadius: 5, padding: 20, marginBottom: 40, backgroundColor: "#eeeeee" }}>
          <UserServiceNotes userId={userId} />
        </StyledView>

        <StyledView style={{ borderRadius: 5, padding: 20, marginBottom: 40, backgroundColor: "#eeeeee" }}>
          <PickupGraph userId={userId} />
        </StyledView>

        <StyledView style={{ borderRadius: 5, padding: 20, marginBottom: 40, backgroundColor: "#eeeeee" }}>
          <SoilTestGraph userId={userId} />
        </StyledView>



        <View style={{ paddingBottom: 280 }} />

      </ScrollView>
      <AdminBottomMenu />
      <BottomMenu />
    </StyledView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 8,
    padding: 15,
    backgroundColor: "#eee",
    marginBottom: 30,
    elevation: 1,
  },
});

import React, { useMemo, useEffect, useState } from 'react';
import { View, Text as RNText } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { styled } from 'nativewind';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import firestore from '@react-native-firebase/firestore'; // ✅ RN Firebase
import { RootState } from '../../store/store';
import { setUserDetails } from '../../store/store';
import fonts from '../../assets/fonts/fonts.js';

// --- PUT THE SHARED FUNCTION HERE ---
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
  const overseed = fertiliser; // same pattern
  const aeration = fertiliser && [2, 3, 4, 8, 9, 10].includes(month);
  const repair = isPremium && weeksSinceStart % 2 === 0;

  return { soilNeutraliser, fertiliser, overseed, aeration, repair, isPremium, isArtificialGrass };
}

const StyledView = styled(View);

interface Subscription {
  plan: string;
  planStart: number;
  planDay?: string;
  status?: string;
  dateOverrideOne?: { override: number; date?: number | null }[];
  [key: string]: any;
}

export default function DoozyNextPickup() {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user);
  const [subscription, setSubscription] = useState<Subscription | null>(user?.subscription || null);

  // ---------------- Firestore live listener ----------------
  useEffect(() => {
    if (!user?.uid) return;

    const userDocRef = firestore().collection('users').doc(user.uid);
    const unsubscribe = userDocRef.onSnapshot((docSnap) => {
      if (!docSnap || !docSnap.exists) return; // ✅ check docSnap first
      const data = docSnap.data();
      setSubscription(data?.subscription || null);
      dispatch(setUserDetails({ subscription: data?.subscription || null }));
      console.log('🔥 Firestore listener fired:', data?.subscription);
    });

    return () => unsubscribe();
  }, [user?.uid, dispatch]);

  /* Auto-reset any dateOverrideX when the date has passed */
  useEffect(() => {
    if (!user?.uid || !subscription) return;

    const now = new Date().getTime(); // current timestamp in ms
    const updates: Record<string, any> = {};

    ['dateOverrideOne', 'dateOverrideTwo', 'dateOverrideThree', 'dateOverrideFour', 'dateOverrideFive', 'dateOverrideSix'].forEach((key) => {
      const overrideArray = subscription[key as keyof Subscription] as { override: number; date?: number | null }[] | undefined;
      if (overrideArray?.length) {
        const item = overrideArray[0];
        if (item.override === 1 && item.date && item.date * 1000 < now) {
          // date has passed → reset
          updates[key] = [{ override: 0, date: null }];
        }
      }
    });

    if (Object.keys(updates).length > 0) {
      // Update Firebase
      firestore()
        .collection('users')
        .doc(user.uid)
        .update({ subscription: { ...subscription, ...updates } })
        .then(() => {
          console.log('✅ Overrides reset for past dates');
          // Update Redux
          dispatch(setUserDetails({ subscription: { ...subscription, ...updates } }));
        })
        .catch((err) => console.error('Error resetting overrides', err));
    }
  }, [subscription, user?.uid, dispatch]);



  const {
    nextPickupDate,
    soilNeutraliser: showNeutraliser,
    fertiliser: showFertiliser,
    overseed: showOverseed,
    aeration: showAeration,
    repair: showRepair,
    isPremium,
    isArtificialGrass
  } = useMemo(() => {
    if (!subscription?.planStart || !subscription?.plan) {
      return {
        nextPickupDate: null,
        soilNeutraliser: false,
        fertiliser: false,
        overseed: false,
        aeration: false,
        repair: false,
        isPremium: false,
        isArtificialGrass: false,
      };
    }

    const planStart = subscription.planStart;
    const today = new Date();
    const plan = subscription.plan;

    // ---------------- Overrides ----------------
    let next: Date | null = null;
    const overrideOne = subscription.dateOverrideOne?.[0];
    if (overrideOne?.override === 1 && overrideOne?.date != null) {
      next = new Date(overrideOne.date * 1000);
    } else {
      const getNextWeekday = (from: Date, weekday: number) => {
        const result = new Date(from);
        result.setDate(result.getDate() + ((7 + weekday - result.getDay()) % 7 || 7));
        return result;
      };

      switch (plan) {
        case 'Twice a week Premium':
        case 'Twice a week': {
          const day = today.getDay();
          next = day >= 2 && day <= 4 ? getNextWeekday(today, 5) : getNextWeekday(today, 1);
          break;
        }
        case 'Once a week Premium Friday':
        case 'Once a week Friday':
          next = getNextWeekday(today, 5);
          break;
        case 'Once a week Premium':
        case 'Once a week':
          next = subscription.planDay === 'mon' ? getNextWeekday(today, 1) : getNextWeekday(today, 3);
          break;
        case 'Once a week Artificial Grass':
          next = getNextWeekday(today, 3);
          break;
        default:
          next = null;
      }
    }

    const features = next ? getPickupFeatures(plan, planStart, next) : {
      soilNeutraliser: false,
      fertiliser: false,
      overseed: false,
      aeration: false,
      repair: false,
      isPremium: plan.includes("Premium"),
      isArtificialGrass: plan.includes("Artificial Grass"),
    };

    return { nextPickupDate: next, ...features };
  }, [subscription]);






  const formatDate = (date: Date) =>
    date.toLocaleDateString('en-NZ', { weekday: 'long', day: 'numeric', month: 'long' });

  const nextPickupLabel = useMemo(() => {
    const overrideOne = subscription?.dateOverrideOne?.[0];
    if (overrideOne?.override === 1 && overrideOne?.date != null) {
      return formatDate(new Date(overrideOne.date * 1000));
    } else if (subscription?.status === 'planning') {
      return 'Scheduling your Doozy. Check back soon';
    } else if (nextPickupDate) {
      return formatDate(nextPickupDate);
    } else {
      return 'No plan';
    }
  }, [subscription, nextPickupDate]);

  return (
    <StyledView style={{ borderRadius: 5, elevation: 0, shadowColor: 'transparent', padding: 20, marginBottom: 40, backgroundColor: '#eeeeee' }} className="flex-1 p-4 bg-white">
      <View style={{ paddingTop: 20, paddingBottom: 20 }}>
        <RNText style={{ fontFamily: fonts.bold, fontSize: 24, color: '#195E4B' }}>
          Next service
        </RNText>

        <RNText style={{ fontFamily: fonts.medium, fontSize: 16, color: '#999999', marginBottom: 8 }}>
          Current Plan: {subscription?.plan || 'No plan'}
        </RNText>

        <RNText style={{ fontFamily: fonts.bold, fontSize: 20, color: '#999999', lineHeight: 24, marginBottom: 8 }}>
          {nextPickupLabel}
        </RNText>

        {/* Standard pickup */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
          <Icon name="delete-circle" size={20} color="#195E4B" style={{ marginRight: 6 }} />
          <RNText style={{ fontFamily: 'Inter 24pt Regular', fontSize: 16, color: '#195E4B' }}>Doo pickup</RNText>
        </View>

        {/* Premium & Artificial Grass features */}
        {isPremium || isArtificialGrass ? (
          <>
            {/* Shared spray */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <Icon name="spray" size={20} color="#195E4B" style={{ marginRight: 6 }} />
              <RNText style={{ fontFamily: 'Inter 24pt Regular', fontSize: 16, color: '#195E4B' }}>
                Deodorising spray scheduled
              </RNText>
            </View>

            {/* Premium only */}
            {isPremium && showNeutraliser && (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <Icon name="leaf" size={20} color="#195E4B" style={{ marginRight: 6 }} />
                <RNText style={{ fontFamily: 'Inter 24pt Regular', fontSize: 16, color: '#195E4B' }}>
                  Soil Neutraliser scheduled
                </RNText>
              </View>
            )}

            {/* Artificial Grass only */}
            {isArtificialGrass && (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <Icon name="broom" size={20} color="#195E4B" style={{ marginRight: 6 }} />
                <RNText style={{ fontFamily: 'Inter 24pt Regular', fontSize: 16, color: '#195E4B' }}>
                  Artificial Grass clean scheduled
                </RNText>
              </View>
            )}
            {isPremium && (
              <>
                {showFertiliser && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                    <Icon name="grass" size={20} color="#195E4B" style={{ marginRight: 6 }} />
                    <RNText style={{ fontFamily: 'Inter 24pt Regular', fontSize: 16, color: '#195E4B' }}>
                      Fertiliser scheduled
                    </RNText>
                  </View>
                )}

                {showAeration && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                    <Icon name="circle-slice-8" size={20} color="#195E4B" style={{ marginRight: 6 }} />
                    <RNText style={{ fontFamily: 'Inter 24pt Regular', fontSize: 16, color: '#195E4B' }}>
                      Lawn aeration scheduled
                    </RNText>
                  </View>
                )}

                {showOverseed && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                    <Icon name="flask-outline" size={20} color="#195E4B" style={{ marginRight: 6 }} />
                    <RNText style={{ fontFamily: 'Inter 24pt Regular', fontSize: 16, color: '#195E4B' }}>
                      Overseeding scheduled
                    </RNText>
                  </View>
                )}

                {showRepair && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                    <Icon name="tools" size={20} color="#195E4B" style={{ marginRight: 6 }} />
                    <RNText style={{ fontFamily: 'Inter 24pt Regular', fontSize: 16, color: '#195E4B' }}>
                      Repair bare spots if needed
                    </RNText>
                  </View>
                )}
              </>
            )}
          </>
        ) : (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <Icon name="magnify" size={20} color="#195E4B" style={{ marginRight: 6 }} />
            <RNText style={{ fontFamily: 'Inter 24pt Regular', fontSize: 16, color: '#195E4B' }}>
              Spot check.
            </RNText>
          </View>
        )}
      </View>
    </StyledView>
  );
}

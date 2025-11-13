import React, { useMemo, useEffect, useState } from 'react';
import { View, Text as RNText } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { styled } from 'nativewind';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import firestore from '@react-native-firebase/firestore';
import { RootState } from '../../store/store';
import { setUserDetails } from '../../store/store';
import fonts from '../../assets/fonts/fonts.js';

// --- SHARED FUNCTION ---
function getPickupFeatures(plan: string, planStartTs: number, date: Date) {
  const planStart = new Date(planStartTs * 1000);
  const weeksSinceStart = Math.floor(
    (date.getTime() - planStart.getTime()) / (1000 * 60 * 60 * 24 * 7)
  );
  const month = date.getMonth();
  const isPremium = plan.includes('Premium');
  const isArtificialGrass = plan.includes('Artificial Grass');

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
  overrideIcons?: number;
  overrideCancel?: number;
  icons?: {
    doo?: number;
    deod?: number;
    soilNeutraliser?: number;
    fert?: number;
    aer?: number;
    seed?: number;
    repair?: number;
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

export default function DoozyNextPickup() {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user);
  const [subscription, setSubscription] = useState<Subscription | null>(user?.subscription || null);

  // ---------------- Firestore live listener ----------------
  useEffect(() => {
    if (!user?.uid) return;

    const userDocRef = firestore().collection('users').doc(user.uid);
    const unsubscribe = userDocRef.onSnapshot((docSnap) => {
      if (!docSnap || !docSnap.exists) return;
      const data = docSnap.data();
      setSubscription(data?.subscription || null);
      dispatch(setUserDetails({ subscription: data?.subscription || null }));
      console.log('🔥 Firestore listener fired:', data?.subscription);
    });

    return () => unsubscribe();
  }, [user?.uid, dispatch]);

  // ---------------- Reset expired overrides ----------------
  useEffect(() => {
    if (!user?.uid || !subscription) return;

    const now = Date.now();
    const updates: Record<string, any> = {};

    [
      'dateOverrideOne',
      'dateOverrideTwo',
      'dateOverrideThree',
      'dateOverrideFour',
      'dateOverrideFive',
      'dateOverrideSix',
    ].forEach((key) => {
      const overrideArray = subscription[key as keyof Subscription] as Override[] | undefined;
      if (overrideArray?.length) {
        const item = overrideArray[0];
        if (item.override === 1 && item.date && item.date * 1000 < now) {
          updates[key] = [{ override: 0, date: null }];
        }
      }
    });

    if (Object.keys(updates).length > 0) {
      firestore()
        .collection('users')
        .doc(user.uid)
        .update({ subscription: { ...subscription, ...updates } })
        .then(() => {
          console.log('✅ Overrides reset for past dates');
          dispatch(setUserDetails({ subscription: { ...subscription, ...updates } }));
        })
        .catch((err) => console.error('Error resetting overrides', err));
    }
  }, [subscription, user?.uid, dispatch]);

  // ---------------- Compute next pickup ----------------
  const {
    nextPickupDate,
    features,
  } = useMemo(() => {
    if (!subscription?.planStart || !subscription?.plan) {
      return {
        nextPickupDate: null,
        features: {
          soilNeutraliser: false,
          fertiliser: false,
          overseed: false,
          aeration: false,
          repair: false,
          isPremium: false,
          isArtificialGrass: false,
        },
      };
    }

    const planStart = subscription.planStart;
    const today = new Date();
    const plan = subscription.plan;

    // ---- check overrides ----
    const overrideOne = subscription.dateOverrideOne?.[0];
    let next: Date | null = null;
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

    const features = next
      ? getPickupFeatures(plan, planStart, next)
      : {
          soilNeutraliser: false,
          fertiliser: false,
          overseed: false,
          aeration: false,
          repair: false,
          isPremium: plan.includes('Premium'),
          isArtificialGrass: plan.includes('Artificial Grass'),
        };

    return { nextPickupDate: next, features };
  }, [subscription]);

  // ---------------- Label ----------------
  const formatDate = (date: Date) =>
    date.toLocaleDateString('en-NZ', { weekday: 'long', day: 'numeric', month: 'long' });

  const nextPickupLabel = useMemo(() => {
    const overrideOne = subscription?.dateOverrideOne?.[0];
    if (overrideOne?.overrideCancel === 1 && overrideOne?.date != null) {
      // Show the date first, then the skipped notice
      const dateStr = formatDate(new Date(overrideOne.date * 1000));
      return `${dateStr}\nService skipped this week`;
    }
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


  // ---------------- Build icons list ----------------
  const iconsToRender = useMemo(() => {
    const overrideOne = subscription?.dateOverrideOne?.[0];
    if (overrideOne?.overrideCancel === 1) {
      return [];
    }
    if (overrideOne?.overrideIcons === 1 && overrideOne.icons) {
      const out: { icon: string; label: string }[] = [];
      if (overrideOne.icons.doo) out.push({ icon: 'delete-circle', label: 'Doo pickup' });
      if (overrideOne.icons.deod) out.push({ icon: 'spray', label: 'Deodorising spray' });
      if (overrideOne.icons.soilNeutraliser)
        out.push({ icon: 'leaf', label: 'Soil Neutraliser' });
      if (overrideOne.icons.fert) out.push({ icon: 'grass', label: 'Fertiliser' });
      if (overrideOne.icons.aer) out.push({ icon: 'circle-slice-8', label: 'Lawn aeration' });
      if (overrideOne.icons.seed) out.push({ icon: 'flask-outline', label: 'Overseeding' });
      if (overrideOne.icons.repair) out.push({ icon: 'tools', label: 'Repair bare spots' });
      return out;
    }

    // ---- default automatic logic ----
    const { isPremium, isArtificialGrass, soilNeutraliser, fertiliser, overseed, aeration, repair } =
      features;
    const out: { icon: string; label: string }[] = [];

    out.push({ icon: 'delete-circle', label: 'Doo pickup' });

    if (isPremium || isArtificialGrass) {
      out.push({ icon: 'spray', label: 'Deodorising spray scheduled' });
      if (isPremium && soilNeutraliser) out.push({ icon: 'leaf', label: 'Soil Neutraliser scheduled' });
      if (isArtificialGrass) out.push({ icon: 'broom', label: 'Artificial Grass clean scheduled' });
      if (isPremium && fertiliser) out.push({ icon: 'grass', label: 'Fertiliser scheduled' });
      if (isPremium && aeration) out.push({ icon: 'circle-slice-8', label: 'Lawn aeration scheduled' });
      if (isPremium && overseed) out.push({ icon: 'flask-outline', label: 'Overseeding scheduled' });
      if (isPremium && repair) out.push({ icon: 'tools', label: 'Repair bare spots if needed' });
    } else {
      out.push({ icon: 'magnify', label: 'Spot check.' });
    }

    return out;
  }, [subscription, features]);

  // ---------------- Render ----------------
  return (
    <StyledView
      style={{
        borderRadius: 5,
        elevation: 0,
        shadowColor: 'transparent',
        padding: 20,
        marginBottom: 40,
        backgroundColor: '#eeeeee',
      }}
      className="flex-1 p-4 bg-white"
    >
      <View style={{ paddingTop: 20, paddingBottom: 20 }}>
        <RNText style={{ fontFamily: fonts.bold, fontSize: 24, color: '#195E4B' }}>
          Next service
        </RNText>

        <RNText
          style={{ fontFamily: fonts.medium, fontSize: 16, color: '#999999', marginBottom: 8 }}
        >
          Current Plan: {subscription?.plan || 'No plan'}
        </RNText>

        <RNText
          style={{
            fontFamily: fonts.bold,
            fontSize: 20,
            color:
              subscription?.dateOverrideOne?.[0]?.overrideCancel === 1 ? '#C00' : '#999999',
            lineHeight: 24,
            marginBottom: 8,
          }}
        >
          {nextPickupLabel}
        </RNText>

        {subscription?.dateOverrideOne?.[0]?.overrideCancel === 1 ? (
          <RNText style={{ fontFamily: fonts.bold, fontSize: 16, color: '#C00' }}>
            Refund will be given at next payment.
          </RNText>
        ) : (
          iconsToRender.map((item, idx) => (
            <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <Icon name={item.icon} size={20} color="#195E4B" style={{ marginRight: 6 }} />
              <RNText
                style={{
                  fontFamily: 'Inter 24pt Regular',
                  fontSize: 16,
                  color: '#195E4B',
                }}
              >
                {item.label}
              </RNText>
            </View>
          ))
        )}
      </View>
    </StyledView>
  );
}

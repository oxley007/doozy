import React, { useMemo, useEffect, useState } from 'react';
import { View, Text as RNText } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { styled } from 'nativewind';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import firestore from '@react-native-firebase/firestore';
import { RootState, setUserDetails } from '../../store/store';
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
  originalDate?: number | null;
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

    const unsubscribe = firestore()
      .collection('users')
      .doc(user.uid)
      .onSnapshot((docSnap) => {
        if (!docSnap || !docSnap.exists) return;
        const data = docSnap.data();
        setSubscription(data?.subscription || null);
        dispatch(setUserDetails({ subscription: data?.subscription || null }));
      });

    return () => unsubscribe();
  }, [user?.uid, dispatch]);

  // ---------------- Reset expired overrides ----------------
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
    const newOverrides = overrideKeys.map((key) => {
      const currentOverride = subscription[key as keyof Subscription]?.[0];
      if (currentOverride?.override === 1 && currentOverride.originalDate) {
        const originalTs = currentOverride.originalDate * 1000;
        if (now > originalTs) {
          updated = true;
          return { ...currentOverride, override: 0, date: null, overrideCancel: 0, overrideIcons: 0 };
        }
      }
      return currentOverride || { override: 0, date: null, overrideCancel: 0, overrideIcons: 0, icons: {} };
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

  // ---------------- Compute next pickup ----------------
  const { nextPickupDate, features } = useMemo(() => {
    if (!subscription?.planStart || !subscription?.plan) {
      return { nextPickupDate: null, features: getPickupFeatures('', 0, new Date()) };
    }

    const planStart = subscription.planStart;
    const today = new Date();
    const plan = subscription.plan;

    // ---- check first override ----
    const overrideOne = subscription.dateOverrideOne?.[0];
    let next: Date;
    if (overrideOne?.override === 1 && overrideOne?.date && overrideOne.originalDate) {
      const originalTs = overrideOne.originalDate * 1000;
      // Only use override if today is before original date
      next = Date.now() < originalTs ? new Date(overrideOne.date * 1000) : new Date(originalTs);
    } else {
      const getNextWeekday = (from: Date, weekday: number) => {
        const result = new Date(from);
        result.setDate(result.getDate() + ((7 + weekday - result.getDay()) % 7 || 7));
        return result;
      };
      switch (plan) {
        case 'Twice a week Premium':
        case 'Twice a week':
          const day = today.getDay();
          next = day >= 2 && day <= 4 ? getNextWeekday(today, 5) : getNextWeekday(today, 1);
          break;
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
          next = today;
      }
    }

    return { nextPickupDate: next, features: getPickupFeatures(plan, planStart, next) };
  }, [subscription]);

  // ---------------- Format date ----------------
  const formatDate = (date: Date) =>
    date.toLocaleDateString('en-NZ', { weekday: 'long', day: 'numeric', month: 'long' });

  // ---------------- Next pickup label ----------------
  const nextPickupLabel = useMemo(() => {
    const overrideOne = subscription?.dateOverrideOne?.[0];
    if (overrideOne?.overrideCancel === 1 && overrideOne.date) {
      return `${formatDate(new Date(overrideOne.date * 1000))}\nService skipped this week`;
    }
    if (overrideOne?.override === 1 && overrideOne.date) {
      return formatDate(new Date(overrideOne.date * 1000));
    }
    if (subscription?.status === 'planning') {
      return 'Scheduling your Doozy. Check back soon';
    }
    return nextPickupDate ? formatDate(nextPickupDate) : 'No plan';
  }, [subscription, nextPickupDate]);

  // ---------------- Build icons ----------------
  const iconsToRender = useMemo(() => {
    const overrideOne = subscription?.dateOverrideOne?.[0];
    if (overrideOne?.overrideCancel === 1) return [];

    if (overrideOne?.overrideIcons === 1 && overrideOne.icons) {
      const out: { icon: string; label: string }[] = [];
      if (overrideOne.icons.doo) out.push({ icon: 'delete-circle', label: 'Doo pickup' });
      if (overrideOne.icons.deod) out.push({ icon: 'spray', label: 'Deodorising spray' });
      if (overrideOne.icons.soilNeutraliser) out.push({ icon: 'leaf', label: 'Soil Neutraliser' });
      if (overrideOne.icons.fert) out.push({ icon: 'grass', label: 'Fertiliser' });
      if (overrideOne.icons.aer) out.push({ icon: 'circle-slice-8', label: 'Lawn aeration' });
      if (overrideOne.icons.seed) out.push({ icon: 'flask-outline', label: 'Overseeding' });
      if (overrideOne.icons.repair) out.push({ icon: 'tools', label: 'Repair bare spots' });
      return out;
    }

    // ---- default auto-generated icons ----
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
    <StyledView style={{ borderRadius: 5, padding: 20, marginBottom: 40, backgroundColor: '#eeeeee' }}>
      <View style={{ paddingTop: 20, paddingBottom: 20 }}>
        <RNText style={{ fontFamily: fonts.bold, fontSize: 24, color: '#195E4B' }}>
          Next service
        </RNText>

        <RNText style={{ fontFamily: fonts.medium, fontSize: 16, color: '#999999', marginBottom: 8 }}>
          Current Plan: {subscription?.plan || 'No plan'}
        </RNText>

        <RNText
          style={{
            fontFamily: fonts.bold,
            fontSize: 20,
            color: subscription?.dateOverrideOne?.[0]?.overrideCancel === 1 ? '#C00' : '#999999',
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
              <RNText style={{ fontFamily: 'Inter 24pt Regular', fontSize: 16, color: '#195E4B' }}>
                {item.label}
              </RNText>
            </View>
          ))
        )}
      </View>
    </StyledView>
  );
}

// utils/resetExpiredOverrides.ts
import firestore from "@react-native-firebase/firestore";
import { AppDispatch, setUserDetails } from "../store/store";

type Override = {
  override: number;
  date: any;
  originalDate?: number | null;
  overrideCancel: number;
  overrideIcons: number;
  icons: {
    doo: number;
    deod: number;
    soilNeutraliser: number;
    fert: number;
    aer: number;
    seed: number;
    repair: number;
  };
};

type Subscription = {
  [key: string]: any;
};

// reusable empty override
const emptyOverride = (): Override => ({
  override: 0,
  date: null,
  originalDate: null,
  overrideCancel: 0,
  overrideIcons: 0,
  icons: {
    doo: 0,
    deod: 0,
    soilNeutraliser: 0,
    fert: 0,
    aer: 0,
    seed: 0,
    repair: 0,
  },
});

function endOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

function toUnixSeconds(date: Date) {
  return Math.floor(date.getTime() / 1000);
}

export async function resetExpiredOverrides(
  userId: string,
  subscription: Subscription,
  dispatch: AppDispatch,
  today: Date,
  nextPickupDate?: Date // scheduled service date
) {
  const now = today.getTime();
  const overrideKeys = [
    "dateOverrideOne",
    "dateOverrideTwo",
    "dateOverrideThree",
    "dateOverrideFour",
    "dateOverrideFive",
    "dateOverrideSix",
  ];

  // normalize overrides to array
  const overrides: Override[] = overrideKeys.map(
    key => subscription[key]?.[0] || emptyOverride()
  );

  let shouldShift = false;

  // check if first override should trigger a shift
  const firstOverride = overrides[0];
  const originalTsMs = firstOverride.originalDate
    ? endOfDay(new Date(firstOverride.originalDate * 1000)).getTime()
    : null;
  const nextPickupMs = nextPickupDate ? endOfDay(nextPickupDate).getTime() : null;

  if (
    firstOverride.override === 1 &&
    ((originalTsMs !== null && now > originalTsMs) ||
      (nextPickupMs !== null && now > nextPickupMs))
  ) {
    shouldShift = true;
  }

  if (shouldShift) {
    // shift all overrides down by one
    for (let i = 0; i < overrides.length - 1; i++) {
      overrides[i] = { ...overrides[i + 1] };
    }
    // last override cleared
    overrides[overrides.length - 1] = emptyOverride();

    // rebuild Firestore object
    const updateObj: Record<string, any> = {};
    overrideKeys.forEach((key, idx) => {
      const o = overrides[idx];
      updateObj[key] = [
        o.originalDate
          ? { ...o, originalDate: toUnixSeconds(endOfDay(new Date(o.originalDate * 1000))) }
          : o,
      ];
    });

    try {
      await firestore().collection("users").doc(userId).update({
        subscription: { ...subscription, ...updateObj },
      });
      dispatch(setUserDetails({ subscription: { ...subscription, ...updateObj } }));
      console.log("✅ Overrides shifted successfully (triggered by originalDate or nextPickupDate)");
    } catch (err) {
      console.error("❌ Error resetting expired overrides:", err);
    }
  }
}

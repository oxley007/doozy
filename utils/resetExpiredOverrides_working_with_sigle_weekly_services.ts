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

export async function resetExpiredOverrides(
  userId: string,
  subscription: Subscription,
  dispatch: AppDispatch,
  today: Date,
  nextPickupDate?: Date
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

  let updated = false;

  // Copy current overrides into array
  const overrides: Override[] = overrideKeys.map(
    (key) =>
      subscription[key]?.[0] || {
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
      }
  );

  // Iterate backwards so we can shift expired overrides down
  for (let i = overrides.length - 1; i >= 0; i--) {
    const o = overrides[i];

    if (o.override === 1) {
      const originalTs = o.originalDate ? o.originalDate * 1000 : null;

      const expiredByOriginal = originalTs !== null && now > originalTs;
      const expiredByPickup = nextPickupDate && now > nextPickupDate.getTime();

      if (expiredByOriginal || expiredByPickup) {
        let shifted = false;

        // Shift override into earliest free previous slot
        for (let j = 0; j < i; j++) {
          const prev = overrides[j];
          if (!prev.override || prev.override === 0) {
            // Preserve originalDate when shifting down
            overrides[j] = { ...o, originalDate: o.originalDate };
            overrides[i] = {
              ...prev,
              override: 0,
              date: null,
              overrideCancel: 0,
              overrideIcons: 0,
              originalDate: null,
              icons: {
                doo: 0,
                deod: 0,
                soilNeutraliser: 0,
                fert: 0,
                aer: 0,
                seed: 0,
                repair: 0,
              },
            };
            updated = true;
            shifted = true;
            break;
          }
        }

        // If no earlier slot available, clear this one completely
        if (!shifted) {
          overrides[i] = {
            ...o,
            override: 0,
            date: null,
            overrideCancel: 0,
            overrideIcons: 0,
            originalDate: null,
            icons: {
              doo: 0,
              deod: 0,
              soilNeutraliser: 0,
              fert: 0,
              aer: 0,
              seed: 0,
              repair: 0,
            },
          };
          updated = true;
        }
      }
    }
  }

  // Write updates back to Firestore if any changes occurred
  if (updated) {
    const updateObj: any = {};
    overrideKeys.forEach((key, idx) => {
      updateObj[key] = [overrides[idx]];
    });

    try {
      await firestore().collection("users").doc(userId).update({
        subscription: { ...subscription, ...updateObj },
      });

      dispatch(setUserDetails({ subscription: { ...subscription, ...updateObj } }));
    } catch (err) {
      console.error("Error resetting expired overrides:", err);
    }
  }
}

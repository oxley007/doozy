// utils/getAdminPickups.test.ts
import { getNextSixPickups } from "./getNextSixPickups";
import type { AdminPickup } from "./getAdminPickups";
import { Timestamp } from "@react-native-firebase/firestore";

export async function getAdminPickupsTest(allUsers: any[]): Promise<AdminPickup[]> {
  if (!allUsers.length) return [];

  const user = allUsers[0]; // only first user
  const { subscription, uid } = user;
  if (!subscription || !subscription.planStart || !subscription.plan) return [];

  // Convert planStart from seconds to JS Date (milliseconds)
  let planStartDate: Date;
  if (typeof subscription.planStart === "number") {
    planStartDate = new Date(subscription.planStart * 1000);
  } else if (subscription.planStart instanceof Timestamp) {
    planStartDate = subscription.planStart.toDate();
  } else {
    planStartDate = new Date(subscription.planStart); // fallback
  }

  // Optional: convert other Firestore Timestamps to JS Date if needed
  if (subscription.trialUntil instanceof Timestamp) {
    subscription.trialUntil = subscription.trialUntil.toDate();
  }

  const safeSubscription = {
    ...subscription,
    planStart: planStartDate < new Date() ? new Date() : planStartDate,
  };

  console.log(`Generating pickups for user ${uid} WITHOUT touching Firestore`);
  const nextSix = await getNextSixPickups(safeSubscription);

  const pickups: AdminPickup[] = nextSix.map((pickup) => ({
    date: pickup.date,
    user: {
      uid,
      name: user.name || "",
      address: user.address || "",
      dogName: user.dogName || "",
      plan: subscription.plan,
    },
    icons: {
      doo: !!pickup.doo,
      deod: !!pickup.deod,
      soilNeutraliser: !!pickup.soilNeutraliser,
      fert: !!pickup.fert,
      aer: !!pickup.aer,
      seed: !!pickup.overseed,
      repair: !!pickup.repair,
    },
    override: pickup.override,
  }));

  console.log(`Pickups generated for user ${uid}:`, pickups.length);
  return pickups;
}

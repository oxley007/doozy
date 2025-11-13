// utils/getAdminPickups.ts
import { Timestamp } from "@react-native-firebase/firestore";

interface Override {
  override: number;
  originalDate?: number | null;
  date?: number | null;
  overrideCancel?: number;
}

interface Subscription {
  plan: string;
  planStart: number;
  planDay?: string;
  status?: string;
  dateOverrideOne?: Override[];
  [key: string]: any;
}

export interface AdminPickup {
  uid: string;
  plan: string;
  nextPickup: Date;
}

function getNextWeekday(from: Date, weekday: number): Date {
  const result = new Date(from);
  result.setDate(result.getDate() + ((7 + weekday - result.getDay()) % 7 || 7));
  return result;
}

function getNextPickupDate(subscription: Subscription, today: Date): Date {
  const overrideOne = subscription.dateOverrideOne?.[0];
  if (overrideOne?.override === 1 && overrideOne?.date && overrideOne.originalDate) {
    const originalTs = overrideOne.originalDate * 1000;
    return Date.now() < originalTs
      ? new Date(overrideOne.date * 1000)
      : new Date(originalTs);
  }

  let next: Date;
  switch (subscription.plan) {
    case "Twice a week Premium":
    case "Twice a week":
    case "Twice a week Artificial Grass": {
      const day = today.getDay();
      next = day >= 2 && day <= 4 ? getNextWeekday(today, 5) : getNextWeekday(today, 1);
      break;
    }
    case "Once a week Premium Friday":
    case "Once a week Friday":
      next = getNextWeekday(today, 5);
      break;
    case "Once a week Premium":
    case "Once a week":
      next =
        subscription.planDay === "mon"
          ? getNextWeekday(today, 1)
          : getNextWeekday(today, 3);
      break;
    case "Once a week Artificial Grass":
      next = getNextWeekday(today, 3);
      break;
    default:
      next = today;
  }

  return next;
}

function isToday(date: Date, today: Date): boolean {
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

export async function getAdminPickups(allUsers: any[]): Promise<AdminPickup[]> {
  if (!allUsers.length) return [];

  const today = new Date(
    new Date().toLocaleString("en-NZ", { timeZone: "Pacific/Auckland" })
  );

  const pickups: AdminPickup[] = [];

  for (const user of allUsers) {
    const subscription: Subscription = user.subscription;
    if (!subscription) continue;

    const { status, plan } = subscription;
    if (!["trial", "trialing", "active"].includes(status || "")) continue;

    const nextPickup = getNextPickupDate(subscription, today);
    if (isToday(nextPickup, today)) {
      pickups.push({
        uid: user.uid,
        plan,
        nextPickup,
      });
    }
  }

  return pickups;
}

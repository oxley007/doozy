import { Timestamp } from "@react-native-firebase/firestore";

export interface PickupFeatures {
  soilNeutraliser: boolean;
  isPremium: boolean;
}

function toDate(input: any): Date {
  if (!input) throw new Error("Invalid date");

  // Firestore Timestamp
  if (typeof input.toDate === "function") return input.toDate();

  // Raw Firestore object with seconds
  if (typeof input === "object" && "seconds" in input) return new Date(input.seconds * 1000);

  // Unix timestamp in seconds or milliseconds
  if (typeof input === "number") {
    // Heuristic: if less than 10^12, treat as seconds, else milliseconds
    return new Date(input < 1e12 ? input * 1000 : input);
  }

  // JS Date
  if (input instanceof Date) return input;

  throw new Error("Unknown date format");
}

export function getPickupFeatures(
  plan: string | undefined | null,
  planStart: any,
  date: any
): PickupFeatures {
  const planStr = typeof plan === "string" ? plan : "";
  const isPremium = planStr.includes("Premium");

  if (!isPremium || !planStart || !date) {
    return { soilNeutraliser: false, isPremium };
  }

  const planStartDate = toDate(planStart);
  const currentDate = toDate(date);

  const weeksSinceStart = Math.floor(
    (currentDate.getTime() - planStartDate.getTime()) / (1000 * 60 * 60 * 24 * 7)
  );

  return {
    soilNeutraliser: weeksSinceStart % 4 === 0,
    isPremium,
  };
}

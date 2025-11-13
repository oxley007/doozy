// utils/getNextSixPickups.ts
import { getPickupFeatures } from "./getPickupFeatures";
import { Timestamp } from "@react-native-firebase/firestore";

interface Override {
  override: number;
  date: number | null; // Unix seconds
  originalDate?: number | null;
}

interface Subscription {
  plan: string;
  planDay?: string;
  planStart: number | Date | Timestamp;
  dateOverrideOne?: Override[];
  dateOverrideTwo?: Override[];
  dateOverrideThree?: Override[];
  dateOverrideFour?: Override[];
  dateOverrideFive?: Override[];
  dateOverrideSix?: Override[];
  // other subscription fields...
}

export async function getNextSixPickups(subscription: Subscription) {
  if (!subscription?.planStart || !subscription?.plan) return [];

  const plan = subscription.plan;
  const planDay = subscription.planDay;

  // safely convert planStart to JS Date
  let planStart: Date;
  if (typeof subscription.planStart === "number") {
    planStart = new Date(subscription.planStart * 1000);
  } else if (subscription.planStart instanceof Timestamp) {
    planStart = subscription.planStart.toDate();
  } else {
    planStart = new Date(subscription.planStart);
  }

  const overrideArray: (Override | undefined)[] = [
    subscription.dateOverrideOne?.[0],
    subscription.dateOverrideTwo?.[0],
    subscription.dateOverrideThree?.[0],
    subscription.dateOverrideFour?.[0],
    subscription.dateOverrideFive?.[0],
    subscription.dateOverrideSix?.[0],
  ];

  const getNextWeekday = (from: Date, weekday: number, allowToday = true) => {
    const d = new Date(from);
    const today = d.getDay();
    let diff = (weekday - today + 7) % 7;
    if (diff === 0 && !allowToday) diff = 7;
    d.setDate(d.getDate() + diff);
    return d;
  };

  const generatedDates: { date: Date; original: Date; override?: Override }[] = [];
  let lastOriginal = new Date(planStart.getTime());
  if (lastOriginal < new Date()) lastOriginal = new Date(); // start from today
  const twiceAWeekSequence = [1, 3, 5]; // Mon, Wed, Fri
  let twiceIndex = 0;

  for (let i = 0; i < 6; i++) {
    await new Promise((res) => setTimeout(res, 0));

    let nextOriginal: Date;

    switch (plan) {
      case "Twice a week":
      case "Twice a week Premium": {
        const today = lastOriginal.getDay();
        while (twiceAWeekSequence[twiceIndex] < today) twiceIndex = (twiceIndex + 1) % 3;
        nextOriginal = getNextWeekday(lastOriginal, twiceAWeekSequence[twiceIndex]);
        twiceIndex = (twiceIndex + 1) % 3;
        break;
      }
      case "Once a week Friday":
      case "Once a week Premium Friday":
        nextOriginal = getNextWeekday(lastOriginal, 5); // Friday
        break;
      case "Once a week":
      case "Once a week Premium":
        nextOriginal = planDay === "mon" ? getNextWeekday(lastOriginal, 1) : getNextWeekday(lastOriginal, 3); // Mon or Wed
        break;
      case "Once a week Artificial Grass":
        nextOriginal = getNextWeekday(lastOriginal, 3); // Wed
        break;
      default:
        nextOriginal = new Date(lastOriginal.getTime() + 7 * 24 * 60 * 60 * 1000); // +7 days
    }

    const override = overrideArray[i];
    const now = Date.now();

    let finalDate: Date;
    if (override?.override === 1 && override.date) {
      const originalTs = override.originalDate ? override.originalDate * 1000 : nextOriginal.getTime();
      finalDate = now < originalTs ? new Date(override.date * 1000) : nextOriginal;
    } else {
      finalDate = nextOriginal;
    }

    generatedDates.push({ original: nextOriginal, date: finalDate, override });

    lastOriginal = new Date(nextOriginal.getTime() + 24 * 60 * 60 * 1000);
  }

  // --- Only soilNeutraliser for Premium plans ---
  return generatedDates.map((item) => ({
    date: item.date,
    ...getPickupFeatures(plan, planStart, item.date),
    override: item.override,
  }));
}

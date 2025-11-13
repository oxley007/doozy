// utils/getNextSixTwiceAWeekPickups.ts
import { getPickupFeatures } from "./getPickupFeatures";

interface Override {
  override: number;
  date?: number | null; // Unix timestamp in seconds
  originalDate?: number | null;
}

interface Subscription {
  plan: string;
  planStart: number | Date;
  dateOverrideOne?: Override[];
  dateOverrideTwo?: Override[];
  dateOverrideThree?: Override[];
  dateOverrideFour?: Override[];
  dateOverrideFive?: Override[];
  dateOverrideSix?: Override[];
}

export async function getNextSixTwiceAWeekPickups(subscription: Subscription) {
  if (!subscription?.planStart) return [];

  // --- Convert planStart to JS Date ---
  const planStart =
    typeof subscription.planStart === "number"
      ? new Date(subscription.planStart * 1000)
      : new Date(subscription.planStart);

  const overrides: (Override | undefined)[] = [
    subscription.dateOverrideOne?.[0],
    subscription.dateOverrideTwo?.[0],
    subscription.dateOverrideThree?.[0],
    subscription.dateOverrideFour?.[0],
    subscription.dateOverrideFive?.[0],
    subscription.dateOverrideSix?.[0],
  ];

  const pickups: { date: Date; original: Date; override?: Override }[] = [];

  // --- Helpers ---
  const now = new Date();
  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);

  const getNextWeekday = (from: Date, weekday: number) => {
    const d = new Date(from);
    let diff = (weekday - d.getDay() + 7) % 7;
    if (diff === 0 && from > endOfToday) {
      diff = 7; // already past today → jump to next week
    }
    d.setDate(d.getDate() + diff);
    return d;
  };

  const twiceAWeekSequence = [1, 5]; // Monday, Friday

  // --- Decide starting sequence ---
  let seqIndex = 0; // default Monday
  if (now.getDay() >= 2 && now.getDay() < 5) {
    // Tue–Thu → next Friday
    seqIndex = 1;
  } else if (now.getDay() >= 5) {
    // Fri–Sun → next Monday
    seqIndex = 0;
  }

  // --- Calculate next 6 pickups ---
  let current = new Date(Math.max(planStart.getTime(), now.getTime()));

  for (let i = 0; i < 6; i++) {
    await new Promise((res) => setTimeout(res, 0));

    const nextOriginal = getNextWeekday(current, twiceAWeekSequence[seqIndex]);
    seqIndex = (seqIndex + 1) % twiceAWeekSequence.length;

    const override = overrides[i];

    let finalDate: Date;
    if (override?.override === 1 && override.date) {
      const originalTs =
        override.originalDate ? override.originalDate * 1000 : nextOriginal.getTime();
      finalDate =
        now.getTime() < originalTs ? new Date(override.date * 1000) : nextOriginal;
    } else {
      finalDate = nextOriginal;
    }

    pickups.push({ original: nextOriginal, date: finalDate, override });

    // Move current forward past this pickup
    current = new Date(nextOriginal.getTime() + 24 * 60 * 60 * 1000);
  }

  return pickups.map((item) => ({
    date: item.date,
    ...getPickupFeatures(subscription.plan, planStart, item.date),
    override: item.override,
  }));
}

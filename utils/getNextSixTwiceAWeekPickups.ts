import { getPickupFeatures } from "./getPickupFeatures";

interface Override {
  override: number;
  date?: number | null;
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

  const pickups: { date: Date; override?: Override }[] = [];

  const now = new Date();
  const twiceAWeekSequence = [1, 5]; // Monday, Friday
  let seqIndex = now.getDay() >= 2 && now.getDay() < 5 ? 1 : now.getDay() >= 5 ? 0 : 0;

  const getNextWeekday = (from: Date, weekday: number) => {
    const d = new Date(from);
    let diff = (weekday - d.getDay() + 7) % 7;
    if (diff === 0 && from > d) diff = 7;
    d.setDate(d.getDate() + diff);
    return d;
  };

  let current = new Date(Math.max(planStart.getTime(), now.getTime()));

  for (let i = 0; i < 6; i++) {
    const nextOriginal = getNextWeekday(current, twiceAWeekSequence[seqIndex]);
    seqIndex = (seqIndex + 1) % twiceAWeekSequence.length;

    const override = overrides[i];
    const finalDate =
      override?.override === 1 && override.date
        ? new Date(override.date * 1000)
        : nextOriginal;

    pickups.push({ date: finalDate, override });

    current = new Date(nextOriginal.getTime() + 24 * 60 * 60 * 1000);
  }

  return pickups.map((item) => ({
    date: item.date,
    ...getPickupFeatures(subscription.plan, planStart, item.date),
    override: item.override,
  }));
}

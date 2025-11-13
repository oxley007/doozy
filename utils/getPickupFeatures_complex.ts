// src/utils/getPickupFeatures.ts
export interface PickupFeatures {
  soilNeutraliser: boolean;
  fertiliser: boolean;
  overseed: boolean;
  aeration: boolean;
  repair: boolean;
  isPremium: boolean;
  isArtificialGrass: boolean;
}

export function getPickupFeatures(
  plan: any,
  planStartTs: number | undefined,
  date: Date | undefined
): PickupFeatures {
  const planStr = typeof plan === "string" ? plan : "";

  const isPremium = planStr.includes("Premium");
  const isArtificialGrass = planStr.includes("Artificial Grass");

  if (!planStartTs || !date) {
    return {
      soilNeutraliser: false,
      fertiliser: false,
      overseed: false,
      aeration: false,
      repair: false,
      isPremium,
      isArtificialGrass,
    };
  }

  const planStart = new Date(planStartTs * 1000);
  if (isNaN(planStart.getTime())) {
    return {
      soilNeutraliser: false,
      fertiliser: false,
      overseed: false,
      aeration: false,
      repair: false,
      isPremium,
      isArtificialGrass,
    };
  }

  const weeksSinceStart = Math.floor(
    (date.getTime() - planStart.getTime()) / (1000 * 60 * 60 * 24 * 7)
  );

  const month = date.getMonth();

  const soilNeutraliser = isPremium && weeksSinceStart % 4 === 0;
  const fertiliser = isPremium && ![0, 1, 5, 6, 7].includes(month) && weeksSinceStart % 8 === 0;
  const overseed = fertiliser;
  const aeration = fertiliser && [2, 3, 4, 8, 9, 10].includes(month);
  const repair = isPremium && weeksSinceStart % 2 === 0;

  return { soilNeutraliser, fertiliser, overseed, aeration, repair, isPremium, isArtificialGrass };
}

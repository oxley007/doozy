// utils/renderPickupIcons.ts
import { getPickupFeatures } from "./getPickupFeatures";
import { PickupFeatures } from "./getPickupFeatures";

interface OverrideIcons {
  doo: number;
  deod: number;
  soilNeutraliser: number;
  fert: number;
  aer: number;
  seed: number;
  repair: number;
}

interface Override {
  overrideIcons?: number;
  overrideCancel?: number;
  icons?: OverrideIcons;
}

interface PickupItem {
  subscription: any;
  date: Date;
  override?: Override;
}

export function renderPickupIcons(item: PickupItem) {
  const { subscription, date, override } = item;

  const icons: { icon: string; label: string }[] = [];

  if (!subscription) {
    icons.push({ icon: "delete-circle", label: "Doo pickup" });
    return icons;
  }

  // ----------------- 1. Overrides take priority -----------------
  if (override?.overrideIcons === 1 && override.icons) {
    const o = override.icons;
    if (o.doo === 1) icons.push({ icon: "delete-circle", label: "Doo pickup" });
    if (o.deod === 1) icons.push({ icon: "spray", label: "Deodorising spray" });
    if (o.soilNeutraliser === 1) icons.push({ icon: "leaf", label: "Soil Neutraliser" });
    if (o.fert === 1) icons.push({ icon: "grass", label: "Fertiliser" });
    if (o.aer === 1) icons.push({ icon: "circle-slice-8", label: "Lawn aeration" });
    if (o.seed === 1) icons.push({ icon: "flask-outline", label: "Overseeding" });
    if (o.repair === 1) icons.push({ icon: "tools", label: "Repair bare spots" });
  } else {
    // ----------------- 2. Compute plan-based features -----------------
    const features: PickupFeatures = getPickupFeatures(subscription.plan, subscription.planStart, date);

    // Always Doo pickup
    icons.push({ icon: "delete-circle", label: "Doo pickup" });

    if (features.isPremium || features.isArtificialGrass) {
      if (features.isPremium || features.isArtificialGrass)
        icons.push({ icon: "spray", label: "Deodorising spray" });
      if (features.isPremium && features.soilNeutraliser)
        icons.push({ icon: "leaf", label: "Soil Neutraliser" });
      if (features.isArtificialGrass)
        icons.push({ icon: "broom", label: "Artificial Grass clean" });
      if (features.isPremium && features.fertiliser)
        icons.push({ icon: "grass", label: "Fertiliser" });
      if (features.isPremium && features.aeration)
        icons.push({ icon: "circle-slice-8", label: "Lawn aeration" });
      if (features.isPremium && features.overseed)
        icons.push({ icon: "flask-outline", label: "Overseeding" });
      if (features.isPremium && features.repair)
        icons.push({ icon: "tools", label: "Repair bare spots" });
    } else {
      // Non-premium / non-artificial grass
      icons.push({ icon: "magnify", label: "Spot check" });
    }
  }

  return icons;
}

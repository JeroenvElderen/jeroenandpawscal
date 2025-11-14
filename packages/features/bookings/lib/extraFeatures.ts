import type { TFunction } from "next-i18next";

export const EXTRA_FEATURE_OPTIONS = [
  {
    value: "pickup",
    translationKey: "feature_pickup_service",
    defaultLabel: "Pickup service",
  },
  {
    value: "dropoff",
    translationKey: "feature_dropoff_service",
    defaultLabel: "Drop-off service",
  },
  {
    value: "equipment",
    translationKey: "feature_equipment_setup",
    defaultLabel: "Equipment setup",
  },
] as const;

export type ExtraFeatureValue = (typeof EXTRA_FEATURE_OPTIONS)[number]["value"];

const extraFeatureLabels = new Map(
  EXTRA_FEATURE_OPTIONS.map((option) => [option.value, option] as const)
);

export const parseExtraFeaturesFromMetadata = (serialized?: string | null): string[] => {
  if (!serialized) return [];

  try {
    const parsed = JSON.parse(serialized);

    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((value) => {
        if (typeof value === "string") return value;
        if (value == null) return null;
        return String(value);
      })
      .filter((value): value is string => Boolean(value));
  } catch {
    return [];
  }
};

export const getExtraFeatureLabels = (values: string[], t: TFunction): string[] => {
  return values.map((value) => {
    const match = extraFeatureLabels.get(value as ExtraFeatureValue);

    if (!match) {
      return value;
    }

    return t(match.translationKey, { defaultValue: match.defaultLabel });
  });
};
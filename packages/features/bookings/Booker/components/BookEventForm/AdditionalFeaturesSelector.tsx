import { useMemo } from "react";

import { useBookerStoreContext } from "@calcom/features/bookings/Booker/BookerStoreProvider";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { Button } from "@calcom/ui/components/button";
import {
  Dropdown,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@calcom/ui/components/dropdown";

const FEATURE_OPTIONS = [
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
];

export const AdditionalFeaturesSelector = () => {
  const { t } = useLocale();
  const extraFeatures = useBookerStoreContext((state) => state.extraFeatures);
  const setExtraFeatures = useBookerStoreContext((state) => state.setExtraFeatures);

  const featureOptions = useMemo(
    () =>
      FEATURE_OPTIONS.map((option) => ({
        ...option,
        label: t(option.translationKey, { defaultValue: option.defaultLabel }),
      })),
    [t]
  );

  const summaryText = extraFeatures.length
    ? t("extra_features_selected_summary", {
        defaultValue: "Selected add-ons: {{count}}",
        count: extraFeatures.length,
      })
    : t("extra_features_helper_text", {
        defaultValue: "Select add-ons like pickup or dropoff",
      });

  return (
    <div className="mb-4">
      <Dropdown>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            color="minimal"
            variant="button"
            StartIcon="sparkles"
            className="mr-auto h-fit whitespace-normal text-left">
            <span className="flex flex-col items-start text-left">
              <span className="text-emphasis text-sm font-medium flex items-center gap-1">
                {t("extra_features_button_label", { defaultValue: "Add extra options" })}

                {extraFeatures.length > 0 && (
                  <span className="text-xs text-subtle">({extraFeatures.length})</span>
                )}
              </span>
              <span className="text-subtle text-xs">{summaryText}</span>
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="my-dropdown">
          {featureOptions.map((option) => (
            <DropdownMenuCheckboxItem
              key={option.value}
              checked={extraFeatures.includes(option.value)}
              onSelect={(e) => e.preventDefault()} // ← prevents closing
              onCheckedChange={(checked) => {
                setExtraFeatures((current) => {
                  if (checked) {
                    if (current.includes(option.value)) return current;
                    return [...current, option.value];
                  }
                  return current.filter((value) => value !== option.value);
                });
              }}>
              {option.label}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </Dropdown>
      {extraFeatures.length ? (
        <div className="text-subtle mt-2 text-xs">
          {featureOptions
            .filter((option) => extraFeatures.includes(option.value))
            .map((option) => option.label)
            .join(", ")}
        </div>
      ) : null}
    </div>
  );
};

export default AdditionalFeaturesSelector;

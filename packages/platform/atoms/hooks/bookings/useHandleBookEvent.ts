import { useSearchParams } from "next/navigation";

import { useIsPlatform } from "@calcom/atoms/hooks/useIsPlatform";
import { useBookerStoreContext } from "@calcom/features/bookings/Booker/BookerStoreProvider";
import { useBookerTime } from "@calcom/features/bookings/Booker/components/hooks/useBookerTime";
import type { UseBookingFormReturnType } from "@calcom/features/bookings/Booker/components/hooks/useBookingForm";
import { mapBookingToMutationInput, mapRecurringBookingToMutationInput } from "@calcom/features/bookings/lib";
import type { BookingCreateBody } from "@calcom/features/bookings/lib/bookingCreateBodySchema";
import type { BookerEvent } from "@calcom/features/bookings/types";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import type { RoutingFormSearchParams } from "@calcom/platform-types";
import { showToast } from "@calcom/ui/components/toast";

import { getUtmTrackingParameters } from "../../lib/getUtmTrackingParameters";
import type { UseCreateBookingInput } from "./useCreateBooking";

type Callbacks = { onSuccess?: () => void; onError?: (err: unknown) => void };

type UseHandleBookingProps = {
  bookingForm: UseBookingFormReturnType["bookingForm"];
  event?: {
    data?: Pick<
      BookerEvent,
      "id" | "isDynamic" | "metadata" | "recurringEvent" | "length" | "slug" | "schedulingType"
    > | null;
  };
  metadata: Record<string, string>;
  hashedLink?: string | null;
  handleBooking: (input: UseCreateBookingInput, callbacks?: Callbacks) => void;
  handleInstantBooking: (input: BookingCreateBody, callbacks?: Callbacks) => void;
  handleRecBooking: (input: BookingCreateBody[], callbacks?: Callbacks) => void;
  locationUrl?: string;
  routingFormSearchParams?: RoutingFormSearchParams;
  isBookingDryRun?: boolean;
};

/**
 * ES5-safe + TS-safe
 * Ensures metadata contains only string values (required by BookingOptions)
 */
const sanitizeMetadata = (m: Record<string, unknown>): Record<string, string> => {
  return Object.fromEntries(
    Object.entries(m).filter(([, v]) => typeof v === "string")
  ) as Record<string, string>;
};

export const useHandleBookEvent = ({
  bookingForm,
  event,
  metadata,
  hashedLink,
  handleBooking,
  handleInstantBooking,
  handleRecBooking,
  locationUrl,
  routingFormSearchParams,
  isBookingDryRun,
}: UseHandleBookingProps) => {
  const isPlatform = useIsPlatform();
  const setFormValues = useBookerStoreContext((state) => state.setFormValues);
  const storeTimeSlot = useBookerStoreContext((state) => state.selectedTimeslot);
  const duration = useBookerStoreContext((state) => state.selectedDuration);
  const { timezone } = useBookerTime();
  const rescheduleUid = useBookerStoreContext((state) => state.rescheduleUid);
  const rescheduledBy = useBookerStoreContext((state) => state.rescheduledBy);
  const { t, i18n } = useLocale();
  const username = useBookerStoreContext((state) => state.username);
  const recurringEventCount = useBookerStoreContext((state) => state.recurringEventCount);
  const bookingData = useBookerStoreContext((state) => state.bookingData);
  const seatedEventData = useBookerStoreContext((state) => state.seatedEventData);
  const isInstantMeeting = useBookerStoreContext((state) => state.isInstantMeeting);
  const orgSlug = useBookerStoreContext((state) => state.org);
  const teamMemberEmail = useBookerStoreContext((state) => state.teamMemberEmail);
  const crmOwnerRecordType = useBookerStoreContext((state) => state.crmOwnerRecordType);
  const crmAppSlug = useBookerStoreContext((state) => state.crmAppSlug);
  const crmRecordId = useBookerStoreContext((state) => state.crmRecordId);
  const verificationCode = useBookerStoreContext((state) => state.verificationCode);
  const extraFeatures = useBookerStoreContext((state) => state.extraFeatures);
  const setExtraFeatures = useBookerStoreContext((state) => state.setExtraFeatures);
  const searchParams = useSearchParams();

  const handleError = (err: unknown) => {
    const errorMessage = err instanceof Error ? t(err.message) : t("can_you_try_again");
    showToast(errorMessage, "error");
  };

  const handleBookEvent = (inputTimeSlot?: string) => {
    const values = bookingForm.getValues();
    const timeslot = inputTimeSlot ?? storeTimeSlot;
    const callbacks = inputTimeSlot && !isPlatform ? { onError: handleError } : undefined;

    if (!timeslot) return;

    // Clean state
    setFormValues({});
    bookingForm.clearErrors();

    if (!event?.data) {
      bookingForm.setError("globalError", { message: t("error_booking_event") });
      return;
    }

    // Validate duration
    const validDuration = event.data.isDynamic
      ? duration || event.data.length
      : duration && event.data.metadata?.multipleDuration?.includes(duration)
      ? duration
      : event.data.length;

    // Extra features metadata
    const extraFeaturesMetadata =
      extraFeatures.length > 0
        ? { extraFeatures: JSON.stringify(extraFeatures) }
        : {};

    // Merge & sanitize metadata to ensure Record<string, string>
    const combinedMetadata = sanitizeMetadata({
      ...metadata,
      ...extraFeaturesMetadata,
    });

    const bookingInput = {
      values,
      duration: validDuration,
      event: event.data,
      date: timeslot,
      timeZone: timezone,
      language: i18n.language,
      rescheduleUid: rescheduleUid || undefined,
      rescheduledBy: rescheduledBy || undefined,
      bookingUid: bookingData?.uid || seatedEventData?.bookingUid || undefined,
      username: username || "",
      metadata: combinedMetadata,
      hashedLink,
      teamMemberEmail,
      crmOwnerRecordType,
      crmAppSlug,
      crmRecordId,
      orgSlug: orgSlug || undefined,
      routingFormSearchParams,
      isDryRunProp: isBookingDryRun,
      verificationCode: verificationCode || undefined,
    };

    const tracking = getUtmTrackingParameters(searchParams);

    if (isInstantMeeting) {
      handleInstantBooking(mapBookingToMutationInput(bookingInput), callbacks);
    } else if (event.data.recurringEvent?.freq != null && recurringEventCount && !rescheduleUid) {
      handleRecBooking(
        mapRecurringBookingToMutationInput(bookingInput, recurringEventCount, tracking),
        callbacks
      );
    } else {
      handleBooking(
        { ...mapBookingToMutationInput(bookingInput), locationUrl, tracking },
        callbacks
      );
    }

    // Reset state
    setFormValues({});
    bookingForm.clearErrors();
    setExtraFeatures([]);
  };

  return handleBookEvent;
};

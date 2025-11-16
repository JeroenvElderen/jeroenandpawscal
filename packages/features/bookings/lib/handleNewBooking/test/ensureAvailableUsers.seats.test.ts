import dayjs from "@calcom/dayjs";
import type { GetUserAvailabilityResult } from "@calcom/features/availability/lib/getUserAvailability";
import type { Logger } from "tslog";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { getEventTypeResponse } from "../getEventTypesFromDB";
import type { IsFixedAwareUser } from "../types";
import * as conflictChecker from "../../conflictChecker/checkForConflicts";

const getUsersAvailabilityMock = vi.fn();
const getBusyTimesForLimitChecksMock = vi.fn();

vi.mock("@calcom/features/di/containers/GetUserAvailability", () => ({
  getUserAvailabilityService: () => ({
    getUsersAvailability: getUsersAvailabilityMock,
  }),
}));

vi.mock("@calcom/features/di/containers/BusyTimes", () => ({
  getBusyTimesService: () => ({
    getBusyTimesForLimitChecks: getBusyTimesForLimitChecksMock,
  }),
}));

describe("ensureAvailableUsers", () => {
  beforeEach(() => {
    getUsersAvailabilityMock.mockReset();
    getBusyTimesForLimitChecksMock.mockReset();
  });

  it("allows bookings when current seats still have capacity", async () => {
    const { ensureAvailableUsers } = await import("../ensureAvailableUsers");

    const checkForConflictsSpy = vi.spyOn(conflictChecker, "checkForConflicts");

    const slotStart = dayjs.utc("2024-01-01T10:00:00Z");
    const slotEnd = slotStart.add(1, "hour");

    const userAvailability = {
      busy: [
        {
          start: slotStart.toISOString(),
          end: slotEnd.toISOString(),
        },
      ],
      dateRanges: [
        {
          start: slotStart,
          end: slotEnd,
        },
      ],
      oooExcludedDateRanges: [
        {
          start: slotStart,
          end: slotEnd,
        },
      ],
      workingHours: [],
      dateOverrides: [],
      timeZone: "UTC",
      currentSeats: [
        {
          uid: "existing-booking",
          startTime: slotStart.toDate(),
          _count: { attendees: 1 },
        },
      ],
      datesOutOfOffice: {},
    } as unknown as GetUserAvailabilityResult;

    getUsersAvailabilityMock.mockResolvedValue([userAvailability]);
    getBusyTimesForLimitChecksMock.mockResolvedValue([]);

    const eventType = {
      id: 1,
      users: [
        {
          id: 10,
          isFixed: true,
          credentials: [],
          userLevelSelectedCalendars: [],
          allSelectedCalendars: [],
        } as unknown as IsFixedAwareUser,
      ],
      restrictionScheduleId: null,
      useBookerTimezone: false,
      beforeEventBuffer: 0,
      afterEventBuffer: 0,
      bookingLimits: null,
      durationLimits: null,
      recurringEvent: null,
    } as unknown as Omit<getEventTypeResponse, "users"> & { users: IsFixedAwareUser[] };

    const logger = {
      debug: vi.fn(),
      error: vi.fn(),
    } as unknown as Logger<unknown>;

    try {
      const result = await ensureAvailableUsers(
        eventType,
        { dateFrom: slotStart.toISOString(), dateTo: slotEnd.toISOString(), timeZone: "UTC" },
        logger
      );

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(10);
      expect(result[0].availabilityData?.currentSeats?.[0].startTime.toISOString()).toBe(
        slotStart.toISOString()
      );
      expect(checkForConflictsSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          currentSeats: userAvailability.currentSeats,
        })
      );
    } finally {
      checkForConflictsSpy.mockRestore();
    }
  });

  it("allows multi day bookings when only the start time is inside the availability window", async () => {
    const { ensureAvailableUsers } = await import("../ensureAvailableUsers");

    const slotStart = dayjs.utc("2024-01-01T10:00:00Z");
    const slotEnd = slotStart.add(2, "day");

    const userAvailability = {
      busy: [],
      dateRanges: [
        {
          start: slotStart,
          end: slotStart.add(1, "hour"),
        },
      ],
      oooExcludedDateRanges: [
        {
          start: slotStart,
          end: slotStart.add(1, "hour"),
        },
      ],
      workingHours: [],
      dateOverrides: [],
      timeZone: "UTC",
      currentSeats: [],
      datesOutOfOffice: {},
    } as unknown as GetUserAvailabilityResult;

    getUsersAvailabilityMock.mockResolvedValue([userAvailability]);
    getBusyTimesForLimitChecksMock.mockResolvedValue([]);

    const eventType = {
      id: 1,
      metadata: { multiDayBooking: true },
      users: [
        {
          id: 10,
          isFixed: true,
          credentials: [],
          userLevelSelectedCalendars: [],
          allSelectedCalendars: [],
        } as unknown as IsFixedAwareUser,
      ],
      restrictionScheduleId: null,
      useBookerTimezone: false,
      beforeEventBuffer: 0,
      afterEventBuffer: 0,
      bookingLimits: null,
      durationLimits: null,
      recurringEvent: null,
    } as unknown as Omit<getEventTypeResponse, "users"> & { users: IsFixedAwareUser[] };

    const logger = {
      debug: vi.fn(),
      error: vi.fn(),
    } as unknown as Logger<unknown>;

    const result = await ensureAvailableUsers(
      eventType,
      { dateFrom: slotStart.toISOString(), dateTo: slotEnd.toISOString(), timeZone: "UTC" },
      logger
    );

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(10);
  });
});

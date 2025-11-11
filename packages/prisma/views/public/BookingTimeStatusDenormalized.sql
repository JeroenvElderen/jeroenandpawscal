SELECT
  id,
  uid,
  "eventTypeId",
  title,
  description,
  "startTime",
  "endTime",
  "createdAt",
  "updatedAt",
  location,
  paid,
  STATUS,
  rescheduled,
  "userId",
  "teamId",
  "eventLength",
  "eventParentId",
  "userEmail",
  "userName",
  "userUsername",
  "ratingFeedback",
  rating,
  "noShowHost",
  "isTeamBooking",
  CASE
    WHEN (rescheduled IS TRUE) THEN 'rescheduled' :: text
    WHEN (
      (STATUS = 'cancelled' :: "BookingStatus")
      AND (rescheduled IS NULL)
    ) THEN 'cancelled' :: text
    WHEN ("endTime" < NOW()) THEN 'completed' :: text
    WHEN ("endTime" > NOW()) THEN 'uncompleted' :: text
    ELSE NULL :: text
  END AS "timeStatus"
FROM
  "BookingDenormalized";
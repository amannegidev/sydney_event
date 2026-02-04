export const getEventStatus = ({ existingEvent, incomingEvent }) => {
  if (!existingEvent) {
    return "new";
  }

  const fieldsToCompare = [
    "title",
    "description",
    "shortSummary",
    "dateTime",
    "venueName",
    "venueAddress",
    "city",
    "category",
    "imageUrl",
    "sourceName",
  ];

  const hasChanged = fieldsToCompare.some((field) => {
    const existingValue = existingEvent[field];
    const incomingValue = incomingEvent[field];

    if (Array.isArray(existingValue) || Array.isArray(incomingValue)) {
      return JSON.stringify(existingValue ?? []) !== JSON.stringify(incomingValue ?? []);
    }

    if (existingValue instanceof Date || incomingValue instanceof Date) {
      return new Date(existingValue).getTime() !== new Date(incomingValue).getTime();
    }

    return (existingValue ?? "") !== (incomingValue ?? "");
  });

  if (hasChanged) {
    return "updated";
  }

  return existingEvent.status === "imported" ? "imported" : "new";
};

export const isInactive = ({
  eventDate,
  lastSeenAt,
  now = new Date(),
  inactiveAfterDays = 7,
}) => {
  if (eventDate && new Date(eventDate).getTime() < now.getTime()) {
    return true;
  }

  if (lastSeenAt) {
    const diffMs = now.getTime() - new Date(lastSeenAt).getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    return diffDays >= inactiveAfterDays;
  }

  return false;
};

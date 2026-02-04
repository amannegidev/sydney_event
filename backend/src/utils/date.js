export const parseDateFromText = (dateText) => {
  if (!dateText) {
    return null;
  }

  const parsed = Date.parse(dateText);
  if (!Number.isNaN(parsed)) {
    return new Date(parsed);
  }

  return null;
};

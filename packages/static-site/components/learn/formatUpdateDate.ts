/**
 * Formats a `YYYY-MM-DD` content date as "Month D, YYYY" (e.g. "May 19, 2026").
 *
 * Parses as UTC and formats in the UTC timezone so the displayed day never
 * shifts based on the reader's local timezone offset.
 */
export const formatUpdateDate = (date: string): string => {
  const parsed = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
};

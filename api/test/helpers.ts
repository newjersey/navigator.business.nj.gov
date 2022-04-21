import { getCurrentDate, parseDate } from "@shared/dateHelpers";
import { createHmac } from "crypto";

export const determineAnnualFilingDate = (dateOfFormation: string) => {
  const currentDate = getCurrentDate();
  const dateOfFormationDate = parseDate(dateOfFormation);
  let year = currentDate.year();
  if (dateOfFormationDate.month() < currentDate.month()) {
    year = year + 1;
  }
  const nextMonth = dateOfFormationDate.month() + 2;
  return parseDate(`${year}-${nextMonth}-01`).add(-1, "day").format("YYYY-MM-DD");
};

export const generateHashedKey = (key: string) =>
  createHmac("sha256", process.env.INTERCOM_HASH_SECRET || "")
    .update(key)
    .digest("hex");

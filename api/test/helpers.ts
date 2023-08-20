import { TaxFilingCalendarEvent } from "@shared/taxFiling";
import { createHmac } from "node:crypto";

export const generateAnnualFilings = (dueDates: string[]): TaxFilingCalendarEvent[] => {
  return dueDates.map((dueDate: string) => ({
    identifier: "ANNUAL_FILING",
    calendarEventType: "TAX-FILING",
    dueDate,
  }));
};

export const generateHashedKey = (key: string): string => {
  return createHmac("sha256", process.env.INTERCOM_HASH_SECRET || "")
    .update(key)
    .digest("hex");
};

export const randomElementFromArray = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

export const getRandomDateInBetween = (start: string, end: string): Date => {
  const startDate = Date.parse(start);
  const endDate = Date.parse(end);
  return new Date(Math.floor(Math.random() * (endDate - startDate + 1) + startDate));
};

export const getLastCalledWith = <T, R>(fn: jest.MockInstance<T, R[]>): R[] => {
  const lastIndex = fn.mock.calls.length - 1;
  return fn.mock.calls[lastIndex];
};

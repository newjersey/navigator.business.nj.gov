/* eslint-disable unicorn/no-null */
import { TaxFilingCalendarEvent } from "@shared/calendarEvent";
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

export const BILL_LICENSE_UUID = "07d21d75-8a26-ec11-b6e6-001dd804b17d";
export const CAREER_CONSULTING_LICENSE_UUID = "8d648d56-5f41-ec11-8c62-001dd805064d";
export const CONSULTING_FIRM_LICENSE_UUID = "ab1479ff-045c-ec11-8f8e-001dd80506d4";
export const EPS_LICENSE_UUID = "94b36669-e15b-ec11-8f8e-001dd8050971";
export const HEALTH_CARE_LICENSE_UUID = "3ac8456a-53df-eb11-bacb-001dd8028561";
export const HEALTH_CLUB_LICENSE_UUID = "af8e3564-53df-eb11-bacb-001dd8028561";
export const HOME_ELEVATION_LICENSE_UUID = "bc492345-53df-eb11-bacb-001dd8028561";
export const HOME_IMPROVEMENT_LICENSE_UUID = "7a391a3f-53df-eb11-bacb-001dd8028561";
export const LABOR_MATCHING_LICENSE_UUID = "b7f1016b-0b25-ec11-b6e6-001dd804a0a4";
export const PUBLIC_MOVERS_LICENSE_UUID = "19391a3f-53df-eb11-bacb-001dd8028561";
export const TELEMARKETERS_LICENSE_UUID = "7e957057-53df-eb11-bacb-001dd8028561";
export const TICKET_BROKERS_LICENSE_UUID = "538e3564-53df-eb11-bacb-001dd8028561";
export const VEHICLE_PROTECTION_LICENSE_UUID = "f6a4335e-53df-eb11-bacb-001dd8028561";

export const RGB_LICENSE_APPLICATION_INFORMATION = [
  {
    uuid: BILL_LICENSE_UUID,
    appTypeCode: null,
    expectedProfession: "Bill",
  },
  {
    uuid: CAREER_CONSULTING_LICENSE_UUID,
    appTypeCode: 100000000,
    expectedProfession: "Career Consulting/Outplacement-Career Consulting/Outplacement",
  },
  {
    uuid: CAREER_CONSULTING_LICENSE_UUID,
    appTypeCode: 100000001,
    expectedProfession: "Career Consulting/Outplacement-Prepaid Computer Job Matching Service",
  },
  {
    uuid: CAREER_CONSULTING_LICENSE_UUID,
    appTypeCode: 100000002,
    expectedProfession: "Career Consulting/Outplacement-Job Listing Service",
  },
  {
    uuid: CONSULTING_FIRM_LICENSE_UUID,
    appTypeCode: 100000000,
    expectedProfession: "Consulting Firms/Temporary Help Services-Consulting Firm",
  },
  {
    uuid: CONSULTING_FIRM_LICENSE_UUID,
    appTypeCode: 100000001,
    expectedProfession: "Consulting Firms/Temporary Help Services-Consulting Firm/Temporary Help Service",
  },
  {
    uuid: CONSULTING_FIRM_LICENSE_UUID,
    appTypeCode: 100000002,
    expectedProfession: "Consulting Firms/Temporary Help Services-Temporary Help Service",
  },
  {
    uuid: EPS_LICENSE_UUID,
    appTypeCode: 100000000,
    expectedProfession: "Employment & Personnel Service-Employment Agency",
  },
  {
    uuid: EPS_LICENSE_UUID,
    appTypeCode: 100000001,
    expectedProfession: "Employment & Personnel Service-Entertainment/Booking Agency",
  },
  {
    uuid: EPS_LICENSE_UUID,
    appTypeCode: 100000002,
    expectedProfession: "Employment & Personnel Service-Nurses Registry",
  },
  {
    uuid: EPS_LICENSE_UUID,
    appTypeCode: 100000003,
    expectedProfession: "Employment & Personnel Service-Career Counseling Service",
  },
  {
    uuid: EPS_LICENSE_UUID,
    appTypeCode: 100000004,
    expectedProfession: "Employment & Personnel Service-Resume Service",
  },
  {
    uuid: HEALTH_CARE_LICENSE_UUID,
    appTypeCode: null,
    expectedProfession: "Health Care Services",
  },
  {
    uuid: HEALTH_CLUB_LICENSE_UUID,
    appTypeCode: null,
    expectedProfession: "Health Club Services",
  },
  {
    uuid: HOME_ELEVATION_LICENSE_UUID,
    appTypeCode: null,
    expectedProfession: "Home Elevation Contractor",
  },
  {
    uuid: HOME_IMPROVEMENT_LICENSE_UUID,
    appTypeCode: null,
    expectedProfession: "Home Improvement Contractor",
  },
  {
    uuid: LABOR_MATCHING_LICENSE_UUID,
    appTypeCode: null,
    expectedProfession: "International Labor Matching/Matchmaking Organization",
  },
  {
    uuid: PUBLIC_MOVERS_LICENSE_UUID,
    appTypeCode: 100000000,
    expectedProfession: "Public Movers and Warehousemen-Moving Only",
  },
  {
    uuid: PUBLIC_MOVERS_LICENSE_UUID,
    appTypeCode: 100000001,
    expectedProfession: "Public Movers and Warehousemen-Warehousing Only",
  },
  {
    uuid: PUBLIC_MOVERS_LICENSE_UUID,
    appTypeCode: 100000002,
    expectedProfession: "Public Movers and Warehousemen-Moving and Warehouse",
  },
  {
    uuid: TELEMARKETERS_LICENSE_UUID,
    appTypeCode: null,
    expectedProfession: "Telemarketers",
  },
  {
    uuid: TICKET_BROKERS_LICENSE_UUID,
    appTypeCode: null,
    expectedProfession: "Ticket Brokers",
  },
  {
    uuid: VEHICLE_PROTECTION_LICENSE_UUID,
    appTypeCode: null,
    expectedProfession: "Vehicle Protection Product Warrantor",
  },
];

export const RGB_APP_TYPE_KEYS: Record<string, string> = {
  "8d648d56-5f41-ec11-8c62-001dd805064d": "rgb_careerconsultingapptypecode",
  "ab1479ff-045c-ec11-8f8e-001dd80506d4": "rgb_cfthsapptypecode",
  "94b36669-e15b-ec11-8f8e-001dd8050971": "rgb_epsapptypecode",
  "19391a3f-53df-eb11-bacb-001dd8028561": "rgb_publicmoverscode",
};

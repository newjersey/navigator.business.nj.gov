import { LicenseName } from "@businessnjgovnavigator/shared/license";

export type CalendarEvent = {
  readonly dueDate: string; // YYYY-MM-DD
  readonly calendarEventType: "TAX-FILING" | "LICENSE" | "XRAY";
};

export interface TaxFilingCalendarEvent extends CalendarEvent {
  readonly identifier: string;
  readonly calendarEventType: "TAX-FILING";
}

export type LicenseEventSubtype = "expiration" | "renewal";

export interface LicenseCalendarEvent extends CalendarEvent {
  readonly licenseEventSubtype: LicenseEventSubtype;
  readonly calendarEventType: "LICENSE";
  licenseName: LicenseName;
}

export interface XrayRegistrationCalendarEvent extends CalendarEvent {
  readonly calendarEventType: "XRAY";
}

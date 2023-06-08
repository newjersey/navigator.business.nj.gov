export type TaxFilingLookupState = "SUCCESS" | "FAILED" | "API_ERROR" | "PENDING" | "UNREGISTERED";
export type TaxFilingOnboardingState = "SUCCESS" | "FAILED" | "API_ERROR";
export type TaxFilingState = TaxFilingLookupState | TaxFilingOnboardingState;
export type TaxFilingErrorFields = "businessName" | "formFailure";
export type TaxFilingData = {
  readonly state?: TaxFilingState;
  readonly businessName?: string;
  readonly errorField?: TaxFilingErrorFields;
  readonly lastUpdatedISO?: string;
  readonly registeredISO?: string;
  readonly filings: TaxFilingCalendarEvent[];
};

export type TaxFilingLookUpRequest = {
  readonly businessName: string;
  readonly taxId: string;
  readonly encryptedTaxId: string;
};

export type CalendarEvent = {
  readonly dueDate: string; // YYYY-MM-DD
  readonly calendarEventType: "TAX-FILING" | "LICENSE";
};

export interface TaxFilingCalendarEvent extends CalendarEvent {
  readonly identifier: string;
  readonly calendarEventType: "TAX-FILING";
}

export type LicenseEventSubtype = "expiration" | "renewal";

export interface LicenseCalendarEvent extends CalendarEvent {
  readonly licenseEventSubtype: LicenseEventSubtype;
  readonly calendarEventType: "LICENSE";
}

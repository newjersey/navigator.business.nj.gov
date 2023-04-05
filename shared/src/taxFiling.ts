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
  readonly filings: TaxFiling[];
};

export type TaxFilingLookUpRequest = {
  readonly businessName: string;
  readonly taxId: string;
  readonly encryptedTaxId: string;
};

export type TaxFiling = {
  readonly identifier: string;
  readonly dueDate: string; // YYYY-MM-DD
};

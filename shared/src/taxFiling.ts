export type TaxFilingState = "SUCCESS" | "FAILED" | "PENDING" | "API_ERROR";

export type TaxFilingData = {
  readonly state?: TaxFilingState;
  readonly businessName?: string;
  readonly lastUpdatedISO?: string;
  readonly registered: boolean;
  readonly filings: TaxFiling[];
};

export type TaxFilingLookUpRequest = {
  readonly businessName: string;
  readonly taxId: string;
};

export type TaxFiling = {
  readonly identifier: string;
  readonly dueDate: string;
};

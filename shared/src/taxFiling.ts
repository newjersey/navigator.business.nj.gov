export type TaxFilingState = "SUCCESS" | "FAILED" | "PENDING" | "API_ERROR";

export type TaxFilingData = {
  readonly state?: TaxFilingState;
  readonly businessName?: string;
  readonly lastUpdated?: string; // ISOString
  readonly filings: TaxFiling[];
};

export type TaxFiling = {
  readonly identifier: string;
  readonly dueDate: string;
};

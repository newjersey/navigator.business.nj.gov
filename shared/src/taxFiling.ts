export type TaxFilingState = "SUCCESS" | "FAILED" | "PENDING" | "API_ERROR";

export type TaxFilingData = {
  readonly state?: TaxFilingState;
  readonly filings: TaxFiling[];
};

export type TaxFiling = {
  readonly identifier: string;
  readonly dueDate: string;
};

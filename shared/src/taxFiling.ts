export type TaxFilingData = {
  filings: TaxFiling[];
};

export type TaxFiling = {
  readonly identifier: string;
  readonly dueDate: string;
};

export type TaxFilingData = {
  readonly filings: readonly TaxFiling[];
};

export type TaxFiling = {
  readonly identifier: string;
  readonly dueDate: string;
};

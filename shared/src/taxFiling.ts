export type TaxFilingData = {
  filings: TaxFiling[];
};

export type TaxFiling = {
  identifier: string;
  dueDate: string;
};

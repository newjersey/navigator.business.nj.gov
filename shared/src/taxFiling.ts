export type TaxFilingData = {
  entityIdStatus: EntityIdStatus;
  filings: TaxFiling[];
};

export type EntityIdStatus = "UNKNOWN" | "EXISTS_AND_REGISTERED" | "EXISTS_NOT_REGISTERED" | "NOT_FOUND";

export type TaxFiling = {
  identifier: string;
  dueDate: string;
};

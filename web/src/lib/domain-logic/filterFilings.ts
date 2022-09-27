import { getCurrentDate, parseDateWithFormat, TaxFiling } from "@businessnjgovnavigator/shared";

export const sortFilingsEarliestToLatest = (filings: TaxFiling[]): TaxFiling[] => {
  return filings.sort((a, b) =>
    parseDateWithFormat(a.dueDate, "YYYY-MM-DD").isBefore(parseDateWithFormat(b.dueDate, "YYYY-MM-DD"))
      ? -1
      : 1
  );
};

export const deadlinesWithinAYear = (filings: TaxFiling[]): TaxFiling[] => {
  return filings.filter(
    (it) => parseDateWithFormat(it.dueDate, "YYYY-MM-DD").diff(getCurrentDate(), "month") <= 11
  );
};

export const sortFilterFilingsWithinAYear = (filings: TaxFiling[]): TaxFiling[] => {
  return sortFilingsEarliestToLatest(deadlinesWithinAYear(filings));
};

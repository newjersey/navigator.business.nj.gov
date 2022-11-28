import {
  defaultDateFormat,
  getCurrentDate,
  parseDateWithFormat,
  TaxFiling,
} from "@businessnjgovnavigator/shared";

export const sortFilingsEarliestToLatest = (filings: TaxFiling[]): TaxFiling[] => {
  return filings.sort((a, b) => {
    return parseDateWithFormat(a.dueDate, defaultDateFormat).isBefore(
      parseDateWithFormat(b.dueDate, defaultDateFormat)
    )
      ? -1
      : 1;
  });
};

export const deadlinesWithinAYear = (filings: TaxFiling[]): TaxFiling[] => {
  return filings.filter((it) => {
    return parseDateWithFormat(it.dueDate, defaultDateFormat).diff(getCurrentDate(), "month") <= 11;
  });
};

export const sortFilterFilingsWithinAYear = (filings: TaxFiling[]): TaxFiling[] => {
  return sortFilingsEarliestToLatest(deadlinesWithinAYear(filings));
};

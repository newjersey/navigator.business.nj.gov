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

export const upcomingDeadlinesWithinAYear = (filings: TaxFiling[]): TaxFiling[] => {
  return filings.filter((it) => {
    const date = parseDateWithFormat(it.dueDate, defaultDateFormat);
    return (
      date.isSame(getCurrentDate(), "year") &&
      (date.isSame(getCurrentDate(), "month") || date.isAfter(getCurrentDate(), "month"))
    );
  });
};

export const sortFilterFilingsWithinAYear = (filings: TaxFiling[]): TaxFiling[] => {
  return sortFilingsEarliestToLatest(upcomingDeadlinesWithinAYear(filings));
};

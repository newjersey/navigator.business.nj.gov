import {
  defaultDateFormat,
  getCurrentDate,
  parseDateWithFormat,
  TaxFiling,
} from "@businessnjgovnavigator/shared";
import { getJanOfYear } from "@businessnjgovnavigator/shared/index";

export const sortFilingsEarliestToLatest = (filings: TaxFiling[]): TaxFiling[] => {
  return filings.sort((a, b) => {
    return parseDateWithFormat(a.dueDate, defaultDateFormat).isBefore(
      parseDateWithFormat(b.dueDate, defaultDateFormat)
    )
      ? -1
      : 1;
  });
};

export const upcomingDeadlinesWithinAYear = (filings: TaxFiling[], year: string): TaxFiling[] => {
  return filings.filter((it) => {
    const date = parseDateWithFormat(it.dueDate, defaultDateFormat);
    return (
      date.isSame(year, "year") &&
      (date.isSame(getCurrentDate(), "month") || date.isAfter(getCurrentDate(), "month"))
    );
  });
};

export const sortFilterFilingsWithinAYear = (filings: TaxFiling[], year: string): TaxFiling[] => {
  return sortFilingsEarliestToLatest(upcomingDeadlinesWithinAYear(filings, year));
};

export const isCalendarMonthLessThanCurrentMonth = (month: number) => {
  const date = getJanOfYear().add(month, "months");
  return date.month() < getCurrentDate().month();
};

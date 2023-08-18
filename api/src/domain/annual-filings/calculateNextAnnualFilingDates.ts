import { getCurrentDate, parseDateWithFormat } from "@shared/dateHelpers";
import { defaultDateFormat } from "@shared/defaultConstants";

export const calculateNextAnnualFilingDates = (dateOfFormation: string): string[] => {
  const today = getCurrentDate();
  const currentYear = today.year();
  const currentMonth = today.month();
  const nextYear = today.add(1, "year").year();
  const formationDate = parseDateWithFormat(dateOfFormation, defaultDateFormat);

  const wasFormedThisMonth = formationDate.year() === currentYear && formationDate.month() === today.month();
  const isFormedInTheFuture =
    formationDate.year() > currentYear ||
    (formationDate.year() === currentYear && formationDate.month() > currentMonth);

  let dueDateYear = currentYear;
  const currentYearFilingDate = formationDate.endOf("month").year(currentYear);

  if (isFormedInTheFuture) {
    dueDateYear = formationDate.add(1, "year").year();
  } else if (currentYearFilingDate.isBefore(today) || wasFormedThisMonth) {
    dueDateYear = nextYear;
  }

  const baseFilingDate = formationDate.year(dueDateYear).endOf("month");

  return [
    baseFilingDate.format(defaultDateFormat),
    baseFilingDate.add(1, "year").format(defaultDateFormat),
    baseFilingDate.add(2, "year").format(defaultDateFormat)
  ];
};

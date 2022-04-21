import { getCurrentDate, parseDateWithFormat } from "@shared/dateHelpers";

export const calculateNextAnnualFilingDate = (dateOfFormation: string): string => {
  const today = getCurrentDate();
  const currentYear = today.year();
  const nextYear = today.add(1, "year").year();
  const formationDate = parseDateWithFormat(dateOfFormation, "YYYY-MM-DD");

  const wasFormedThisMonth = formationDate.year() === currentYear && formationDate.month() === today.month();

  let dueDateYear = currentYear;
  const currentYearFilingDate = formationDate.endOf("month").year(currentYear);
  if (currentYearFilingDate.isBefore(today) || wasFormedThisMonth) {
    dueDateYear = nextYear;
  }

  return formationDate.year(dueDateYear).endOf("month").format("YYYY-MM-DD");
};

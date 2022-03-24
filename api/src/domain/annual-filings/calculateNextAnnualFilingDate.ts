import dayjs from "dayjs";
import { getCurrentDate } from "../getCurrentDate";

export const calculateNextAnnualFilingDate = (dateOfFormation: string): string => {
  const today = getCurrentDate();
  const currentYear = today.year();
  const nextYear = today.add(1, "year").year();
  const formationDayjs = dayjs(dateOfFormation, "YYYY-MM-DD");

  const wasFormedThisMonth =
    formationDayjs.year() === currentYear && formationDayjs.month() === today.month();

  let dueDateYear = currentYear;
  const currentYearFilingDate = formationDayjs.endOf("month").year(currentYear);
  if (currentYearFilingDate.isBefore(today) || wasFormedThisMonth) {
    dueDateYear = nextYear;
  }

  return formationDayjs.year(dueDateYear).endOf("month").format("YYYY-MM-DD");
};

import { getDateInCurrentYear, isDateAfterCurrentDate } from "../dateHelpers";
import { defaultDateFormat } from "../defaultConstants";

export const getFirstAnnualFiling = (formationDate: string): string => {
  return isDateAfterCurrentDate(formationDate)
    ? getDateInCurrentYear(formationDate).endOf("month").format(defaultDateFormat)
    : getDateInCurrentYear(formationDate).endOf("month").add(1, "year").format(defaultDateFormat);
};

export const getSecondAnnualFiling = (formationDate: string): string => {
  return isDateAfterCurrentDate(formationDate)
    ? getDateInCurrentYear(formationDate).endOf("month").add(1, "year").format(defaultDateFormat)
    : getDateInCurrentYear(formationDate).endOf("month").add(2, "year").format(defaultDateFormat);
};

export const getThirdAnnualFiling = (formationDate: string): string => {
  return isDateAfterCurrentDate(formationDate)
    ? getDateInCurrentYear(formationDate).endOf("month").add(2, "year").format(defaultDateFormat)
    : getDateInCurrentYear(formationDate).endOf("month").add(3, "year").format(defaultDateFormat);
};

import dayjs, { Dayjs } from "dayjs";
import { getMergedConfig } from "@businessnjgovnavigator/shared/contexts";

const Config = getMergedConfig();

export interface EmployerRatesQuarterObject {
  label: string;
  quarter: number;
  year: number;
}

const getLatestYear = (currentDate?: Dayjs): number => {
  const today = currentDate || dayjs();
  const currentYear = today.year();

  // If October (month 10) or later, the latest year is next year
  return today.month() >= 9 ? currentYear + 1 : currentYear;
};

const getEarliestYear = (currentDate?: Dayjs): number => getLatestYear(currentDate) - 4;

const generateQuartersForYear = (year: number): EmployerRatesQuarterObject[] => {
  return [4, 3, 2, 1].map((quarter) => {
    const quarterToConfigMapping = {
      1: Config.employerRates.quarterOneLabel,
      2: Config.employerRates.quarterTwoLabel,
      3: Config.employerRates.quarterThreeLabel,
      4: Config.employerRates.quarterFourLabel,
    } as const;

    return {
      label: `${quarterToConfigMapping[quarter as keyof typeof quarterToConfigMapping]} ${year}`,
      quarter: quarter,
      year: year,
    };
  });
};

export const getEmployerAccessQuarterlyDropdownOptions = (
  currentDate?: Dayjs,
): EmployerRatesQuarterObject[] => {
  const latestYear = getLatestYear(currentDate);
  const earliestYear = getEarliestYear(currentDate);

  const results = [];

  for (let year = latestYear; year >= earliestYear; year--) {
    results.push(...generateQuartersForYear(year));
  }

  return results;
};

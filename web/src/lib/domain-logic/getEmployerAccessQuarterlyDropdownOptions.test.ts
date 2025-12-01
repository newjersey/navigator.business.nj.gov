import dayjs from "dayjs";
import { getMergedConfig } from "@businessnjgovnavigator/shared/contexts";
import { getEmployerAccessQuarterlyDropdownOptions } from "@/lib/domain-logic/getEmployerAccessQuarterlyDropdownOptions";

const Config = getMergedConfig();
Config.employerRates.quarterOneLabel = "q1";
Config.employerRates.quarterTwoLabel = "q2";
Config.employerRates.quarterThreeLabel = "q3";
Config.employerRates.quarterFourLabel = "q4";

describe("getEmployerAccessQuarterlyDropdownOptions", () => {
  it("returns correct quarters when current month is before October", () => {
    const result = getEmployerAccessQuarterlyDropdownOptions(dayjs("2024-09-15"));
    expect(result).toHaveLength(20);
    expect(result[0]).toEqual({ label: "q4 2024", quarter: 4, year: 2024 });
    expect(result[result.length - 1]).toEqual({ label: "q1 2020", quarter: 1, year: 2020 });
  });

  it("returns correct quarters when current month is October or later", () => {
    const result = getEmployerAccessQuarterlyDropdownOptions(dayjs("2024-10-15"));
    expect(result).toHaveLength(20);
    expect(result[0]).toEqual({ label: "q4 2025", quarter: 4, year: 2025 });
    expect(result[result.length - 1]).toEqual({ label: "q1 2021", quarter: 1, year: 2021 });
  });

  it("returns quarters in correct order", () => {
    const result = getEmployerAccessQuarterlyDropdownOptions(dayjs("2024-03-15"));
    expect(result.slice(0, 4)).toEqual([
      { label: "q4 2024", quarter: 4, year: 2024 },
      { label: "q3 2024", quarter: 3, year: 2024 },
      { label: "q2 2024", quarter: 2, year: 2024 },
      { label: "q1 2024", quarter: 1, year: 2024 },
    ]);
    expect(result.slice(4, 8)).toEqual([
      { label: "q4 2023", quarter: 4, year: 2023 },
      { label: "q3 2023", quarter: 3, year: 2023 },
      { label: "q2 2023", quarter: 2, year: 2023 },
      { label: "q1 2023", quarter: 1, year: 2023 },
    ]);
  });

  it("handles December edge case", () => {
    const result = getEmployerAccessQuarterlyDropdownOptions(dayjs("2024-12-15"));
    expect(result[0]).toEqual({ label: "q4 2025", quarter: 4, year: 2025 });
  });

  it("handles September edge case", () => {
    const result = getEmployerAccessQuarterlyDropdownOptions(dayjs("2024-09-30"));
    expect(result[0]).toEqual({ label: "q4 2024", quarter: 4, year: 2024 });
  });

  it("handles September to October boundary transition", () => {
    const septResult = getEmployerAccessQuarterlyDropdownOptions(dayjs("2024-09-30"));
    const octResult = getEmployerAccessQuarterlyDropdownOptions(dayjs("2024-10-01"));
    expect(septResult[0]).toEqual({ label: "q4 2024", quarter: 4, year: 2024 });
    expect(octResult[0]).toEqual({ label: "q4 2025", quarter: 4, year: 2025 });
  });

  it("returns exactly 5 years of quarters", () => {
    const result = getEmployerAccessQuarterlyDropdownOptions(dayjs("2024-06-15"));
    expect(result).toHaveLength(20);
    const uniqueYears = [...new Set(result.map((q) => q.year))];
    expect(uniqueYears).toHaveLength(5);
    expect(uniqueYears).toEqual([2024, 2023, 2022, 2021, 2020]);
  });
});

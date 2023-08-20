import { getMergedConfig } from "@/contexts/configContext";
import {
  defaultDateDelimiter,
  defaultDateFormat,
  FormationLegalType,
  getCurrentDate,
  parseDateWithFormat,
} from "@businessnjgovnavigator/shared/index";
import dayjs from "dayjs";

const Config = getMergedConfig();

export const isDateValid = (value?: string): boolean => {
  if (!value) return false;
  if (value.split(defaultDateDelimiter).length > 8) return false;
  return parseDateWithFormat(value, defaultDateFormat, true).isValid();
};

export const isBusinessStartDateValid = (
  value: string,
  legalType: FormationLegalType | undefined
): boolean => {
  if (!isDateValid(value) || !legalType) return false;
  const date = parseDateWithFormat(value, defaultDateFormat);
  const rule = getBusinessStartDateRule(legalType);
  switch (rule) {
    case "90":
      return (
        date.isAfter(getCurrentDate().subtract(1, "day"), "day") &&
        date.isBefore(getCurrentDate().add(90, "day"), "day")
      );
    case "30":
      return (
        date.isAfter(getCurrentDate().subtract(1, "day"), "day") &&
        date.isBefore(getCurrentDate().add(30, "day"), "day")
      );
    case "Future":
      return date.isAfter(getCurrentDate().subtract(1, "day"), "day");
    case "Today":
      return date.isSame(getCurrentDate(), "day");
  }
};

type StartDateError = "90" | "30" | "Future" | "Today";

export const getBusinessStartDateRule = (legalType: FormationLegalType): StartDateError => {
  switch (legalType) {
    case "c-corporation":
    case "s-corporation":
      return "90";
    case "limited-partnership":
    case "nonprofit":
    case "foreign-nonprofit":
      return "30";
    case "limited-liability-company":
    case "limited-liability-partnership":
    case "foreign-limited-liability-partnership":
      return "Future";
    case "foreign-limited-liability-company":
    case "foreign-limited-partnership":
    case "foreign-c-corporation":
    case "foreign-s-corporation":
      return "Today";
  }
};

export const getBusinessStartDateMaxDate = (legalType: FormationLegalType): dayjs.Dayjs => {
  const rule = getBusinessStartDateRule(legalType);
  switch (rule) {
    case "90":
      return getCurrentDate().add(90, "days");
    case "30":
      return getCurrentDate().add(30, "days");
    case "Future":
      return getCurrentDate().add(100, "years");
    case "Today":
      return getCurrentDate();
  }
};

export const getBusinessStartDateHelperText = (legalType: FormationLegalType): string => {
  const rule = getBusinessStartDateRule(legalType);
  switch (rule) {
    case "90":
      return Config.formation.fields.businessStartDate.error90Days;
    case "30":
      return Config.formation.fields.businessStartDate.error30Days;
    case "Future":
      return Config.formation.fields.businessStartDate.errorFuture;
    case "Today":
      return Config.formation.fields.businessStartDate.errorToday;
  }
};

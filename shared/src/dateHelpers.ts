import dayjs, { Dayjs } from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import customParseFormat from "dayjs/plugin/customParseFormat";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { LicenseEntity } from "./license";

export type DateObject = Dayjs;

export const getCurrentDate = (): Dayjs => {
  return dayjs();
};

export const getJanOfYear = (date?: Dayjs): Dayjs => {
  return (date ?? dayjs()).startOf("year");
};

export const getCurrentDateInNewJersey = (): Dayjs => {
  dayjs.extend(utc);
  dayjs.extend(timezone);
  return dayjs().tz("America/New_York");
};

export const getCurrentDateInNewJerseyISOFormatted = (): string => {
  return getCurrentDateInNewJersey().toISOString();
};

export const getCurrentDateFormatted = (format: string): string => {
  return dayjs().format(format);
};

export const getDateInCurrentYear = (date: string): Dayjs => {
  return dayjs(date).year(dayjs().year());
};

export const isDateAfterCurrentDate = (date: string): boolean => {
  return dayjs().isBefore(getDateInCurrentYear(date));
};

export const getCurrentDateISOString = (): string => {
  return dayjs().toISOString();
};

export const parseDate = (date: string | number | undefined): Dayjs => {
  return dayjs(date);
};

export const parseDateWithFormat = (date: string, format: string, strict?: boolean): Dayjs => {
  dayjs.extend(customParseFormat);
  return dayjs(date, format, strict);
};

export const getLicenseDate = (entity: LicenseEntity): dayjs.Dayjs => {
  if (entity.issueDate) {
    return parseDateWithFormat(entity.issueDate, "YYYYMMDD X");
  } else if (entity.dateThisStatus) {
    return parseDateWithFormat(entity.dateThisStatus, "YYYYMMDD X");
  } else {
    return parseDateWithFormat(entity.expirationDate, "YYYYMMDD X");
  }
};

export const advancedDateLibrary = (): void => {
  dayjs.extend(advancedFormat);
};

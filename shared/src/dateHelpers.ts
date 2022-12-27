import dayjs, { Dayjs } from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { LicenseEntity } from "./license";

export type DateObject = Dayjs;

export const getCurrentDate = (): Dayjs => {
  return dayjs();
};

export const getJanOfCurrentYear = (): Dayjs => {
  return dayjs().month(0);
};

export const getCurrentDateInNewJersey = (): Dayjs => {
  dayjs.extend(utc);
  dayjs.extend(timezone);
  return dayjs().tz("America/New_York");
};

export const getCurrentDateFormatted = (format: string): string => {
  return dayjs().format(format);
};

export const getCurrentDateISOString = (): string => {
  return dayjs().toISOString();
};

export const parseDate = (date: string | number | undefined): Dayjs => {
  return dayjs(date);
};

export const parseDateWithFormat = (date: string, format: string): Dayjs => {
  return dayjs(date, format);
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

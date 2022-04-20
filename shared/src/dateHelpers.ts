import dayjs, { Dayjs } from "dayjs";

export const getCurrentDate = (): Dayjs => dayjs();

export const getCurrentDateFormatted = (format: string): string => dayjs().format(format);

export const getCurrentDateISOString = (): string => dayjs().toISOString();

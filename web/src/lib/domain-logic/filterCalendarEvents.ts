import { defaultDateFormat, getCurrentDate, parseDateWithFormat } from "@businessnjgovnavigator/shared";
import { getJanOfYear } from "@businessnjgovnavigator/shared/index";

type CalendarEvent = {
  dueDate: string;
};
export const sortCalendarEventsEarliestToLatest = <T>(calendarEvents: T[]): T[] => {
  return (calendarEvents as CalendarEvent[]).sort((a, b) => {
    return parseDateWithFormat(a.dueDate, defaultDateFormat).isBefore(
      parseDateWithFormat(b.dueDate, defaultDateFormat)
    )
      ? -1
      : 1;
  }) as T[];
};

export const upcomingDeadlinesWithinAYear = <T>(calendarEvents: T[], year: string): T[] => {
  return (calendarEvents as CalendarEvent[]).filter((it) => {
    const date = parseDateWithFormat(it.dueDate, defaultDateFormat);
    return (
      date.isSame(year, "year") &&
      (date.isSame(getCurrentDate(), "month") || date.isAfter(getCurrentDate(), "month"))
    );
  }) as T[];
};

export const sortFilterCalendarEventsWithinAYear = <T>(calendarEvents: T[], year: string): T[] => {
  return sortCalendarEventsEarliestToLatest<T>(upcomingDeadlinesWithinAYear<T>(calendarEvents, year));
};

export const isCalendarMonthLessThanCurrentMonth = (month: number): boolean => {
  const date = getJanOfYear().add(month, "months");
  return date.month() < getCurrentDate().month();
};

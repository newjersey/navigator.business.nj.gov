import {
  CalendarEvent,
  defaultDateFormat,
  getCurrentDate,
  parseDateWithFormat,
} from "@businessnjgovnavigator/shared";
import { getJanOfYear } from "@businessnjgovnavigator/shared/index";

export const sortCalendarEventsEarliestToLatest = <T extends CalendarEvent>(calendarEvents: T[]): T[] => {
  return calendarEvents.sort((a, b) => {
    return parseDateWithFormat(a.dueDate, defaultDateFormat).isBefore(
      parseDateWithFormat(b.dueDate, defaultDateFormat)
    )
      ? -1
      : 1;
  });
};

const upcomingDeadlinesWithinAYear = <T extends CalendarEvent>(calendarEvents: T[], year: string): T[] => {
  return calendarEvents.filter((it) => {
    const date = parseDateWithFormat(it.dueDate, defaultDateFormat);
    return (
      date.isSame(year, "year") &&
      (date.isSame(getCurrentDate(), "month") || date.isAfter(getCurrentDate(), "month"))
    );
  });
};

export const sortFilterCalendarEventsWithinAYear = <T extends CalendarEvent>(
  calendarEvents: T[],
  year: string
): T[] => {
  return sortCalendarEventsEarliestToLatest(upcomingDeadlinesWithinAYear(calendarEvents, year));
};

export const isCalendarMonthLessThanCurrentMonth = (month: number): boolean => {
  const date = getJanOfYear().add(month, "months");
  return date.month() < getCurrentDate().month();
};

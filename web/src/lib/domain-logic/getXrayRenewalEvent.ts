import { XrayRegistrationCalendarEvent } from "@businessnjgovnavigator/shared/calendarEvent";
import { XrayData } from "@businessnjgovnavigator/shared/xray";
import dayjs from "dayjs";

export const getXrayRenewalEvent = (
  xrayRegistrationData: XrayData | undefined,
  year: number,
  month?: number,
): XrayRegistrationCalendarEvent | undefined => {
  if (xrayRegistrationData === undefined) return;

  if (dayjs(xrayRegistrationData.expirationDate).year() !== year) return;

  const isMonthDefined = month !== undefined;
  if (isMonthDefined && dayjs(xrayRegistrationData.expirationDate).month() !== month) return;

  const isActiveOrExpired =
    xrayRegistrationData.status === "ACTIVE" || xrayRegistrationData.status === "EXPIRED";
  if (!isActiveOrExpired) return;

  return {
    dueDate: dayjs(xrayRegistrationData.expirationDate).format("YYYY-MM-DD"),
    calendarEventType: "XRAY",
  };
};

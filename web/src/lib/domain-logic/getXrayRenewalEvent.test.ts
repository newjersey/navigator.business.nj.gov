import { getXrayRenewalEvent } from "@/lib/domain-logic/getXrayRenewalEvent";
import { getCurrentDate } from "@businessnjgovnavigator/shared/dateHelpers";
import { generateXrayRegistrationData } from "@businessnjgovnavigator/shared/test";

describe("getXrayRenewalEvent", () => {
  const currentDate = getCurrentDate();

  it("returns undefined when xrayRegistrationData is undefined", () => {
    expect(getXrayRenewalEvent(undefined, currentDate.year(), currentDate.month())).toBeUndefined();
  });

  it("returns undefined when month is defined and doesn't match the expiration date month", () => {
    const xrayRegistrationData = generateXrayRegistrationData({
      status: "ACTIVE",
      expirationDate: currentDate.format("YYYY-MM-DD"),
    });

    expect(
      getXrayRenewalEvent(
        xrayRegistrationData,
        currentDate.year(),
        currentDate.add(1, "month").month(),
      ),
    ).toBeUndefined();
  });

  it("returns undefined when xrayRegistrationData is not active or expired", () => {
    const xrayRegistrationData = generateXrayRegistrationData({
      status: "INACTIVE",
      expirationDate: currentDate.subtract(2, "year").format("YYYY-MM-DD"),
    });

    expect(
      getXrayRenewalEvent(xrayRegistrationData, currentDate.year(), currentDate.month()),
    ).toBeUndefined();
  });

  it("return a xray renewal event when status is active and has an expiration date in the same month if defined", () => {
    const xrayRegistrationData = generateXrayRegistrationData({
      status: "ACTIVE",
      expirationDate: currentDate.format("YYYY-MM-DD"),
    });

    expect(
      getXrayRenewalEvent(xrayRegistrationData, currentDate.year(), currentDate.month()),
    ).toEqual({
      dueDate: currentDate.format("YYYY-MM-DD"),
      calendarEventType: "XRAY",
    });
  });

  it("return a xray renewal event when status is active and has an expiration date in the same year if month is not defined", () => {
    const xrayRegistrationData = generateXrayRegistrationData({
      status: "ACTIVE",
      expirationDate: currentDate.format("YYYY-MM-DD"),
    });

    expect(getXrayRenewalEvent(xrayRegistrationData, currentDate.year())).toEqual({
      dueDate: currentDate.format("YYYY-MM-DD"),
      calendarEventType: "XRAY",
    });
  });
});

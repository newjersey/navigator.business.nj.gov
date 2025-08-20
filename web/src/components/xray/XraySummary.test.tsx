import { XraySummary } from "@/components/xray/XraySummary";
import { templateEval } from "@/lib/utils/helpers";
import { getMergedConfig } from "@businessnjgovnavigator/shared/contexts";
import { getCurrentDate } from "@businessnjgovnavigator/shared/dateHelpers";
import type { XrayRegistrationStatus } from "@businessnjgovnavigator/shared/xray";
import { fireEvent, render, screen } from "@testing-library/react";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";

const Config = getMergedConfig();

describe("<XraySummary />", () => {
  dayjs.extend(localizedFormat);
  const futureDate = getCurrentDate().add(2, "month").format("L");
  const fifteenDaysInTheFutureDate = getCurrentDate().add(15, "days").format("L");
  const pastDate = getCurrentDate().subtract(2, "month").format("L");

  const renderComponent = (status: string, date: string, lastUpdatedISODate?: string): void => {
    render(
      <XraySummary
        xrayRegistrationData={{
          facilityDetails: {
            businessName: "Brick and Mortar Store",
            addressLine1: "123 Main St Apt 1",
            addressLine2: "",
            addressZipCode: "12345",
          },
          machines: [
            {
              name: "CORP",
              registrationNumber: "12345A",
              roomId: "01",
              registrationCategory: "DENTIST",
              modelNumber: "123-1234567AB",
              serialNumber: "12-123456AB",
              annualFee: 94,
            },
            {
              name: "GENDEX CORP",
              registrationNumber: "12345B",
              roomId: "01",
              registrationCategory: "DENTIST",
              modelNumber: "123-1234567AB",
              serialNumber: undefined,
              annualFee: 94,
            },
          ],
          status: status as XrayRegistrationStatus,
          expirationDate: date,
          lastUpdatedISO: lastUpdatedISODate,
        }}
        edit={() => {}}
        goToRegistrationTab={() => {}}
      />,
    );
  };

  it.each([
    ["ACTIVE", Config.xrayRegistrationTask.activeStatusStatusText, futureDate],
    ["INACTIVE", Config.xrayRegistrationTask.inactiveDescription, pastDate],
    ["EXPIRED", Config.xrayRegistrationTask.expiredDescription, pastDate],
  ])("displays %s status", (status: string, statusText: string, date: string) => {
    renderComponent(status, date);
    fireEvent.click(screen.getByText(Config.xrayRegistrationTask.accordionHeader));
    expect(screen.getByText(statusText)).toBeInTheDocument();
  });

  it("displays future expiration date", () => {
    renderComponent("ACTIVE", futureDate);
    expect(screen.getByText(`Expires on ${dayjs(futureDate).format("LL")}`)).toBeInTheDocument();
  });

  it("displays expired date", () => {
    renderComponent("EXPIRED", pastDate);
    expect(screen.getByText(`Expired on ${dayjs(pastDate).format("LL")}`)).toBeInTheDocument();
  });

  it("displays upcoming expiration date within 30 days as `Expires in X days`", () => {
    renderComponent("ACTIVE", fifteenDaysInTheFutureDate);
    const daysToExpiration = dayjs(fifteenDaysInTheFutureDate).diff(getCurrentDate(), "day");
    expect(
      screen.getByText(
        `Expires in ${daysToExpiration} days (${dayjs(fifteenDaysInTheFutureDate).format("LL")})`,
      ),
    ).toBeInTheDocument();
  });

  it("displays all the equipment at a facility", () => {
    renderComponent("ACTIVE", futureDate);
    fireEvent.click(screen.getByText(Config.xrayRegistrationTask.accordionHeader));
    expect(screen.getByText("GENDEX CORP")).toBeInTheDocument();
    expect(screen.getByText("CORP")).toBeInTheDocument();
  });

  it("displays 'No information available' if a machine detail is undefined", () => {
    renderComponent("ACTIVE", futureDate);
    fireEvent.click(screen.getByText(Config.xrayRegistrationTask.accordionHeader));
    expect(
      screen.getByText(`Serial Number: ${Config.xrayRegistrationTask.noInformationAvailable}`),
    ).toBeInTheDocument();
  });

  it("does not display `Last Updated` if lastUpdatedISO is undefined", () => {
    renderComponent("ACTIVE", futureDate, undefined);
    fireEvent.click(screen.getByText(Config.xrayRegistrationTask.accordionHeader));
    expect(
      screen.queryByText(
        templateEval(Config.xrayRegistrationTask.lastUpdatedText, {
          lastUpdatedFormattedValue: dayjs(futureDate).format("MMMM Do, YYYY [at] ha"),
        }),
      ),
    ).not.toBeInTheDocument();
  });

  it("displays `Last Updated` if lastUpdatedISO is defined", () => {
    renderComponent("ACTIVE", futureDate, pastDate);
    fireEvent.click(screen.getByText(Config.xrayRegistrationTask.accordionHeader));
    expect(
      screen.getByText(
        templateEval(Config.xrayRegistrationTask.lastUpdatedText, {
          lastUpdatedFormattedValue: dayjs(pastDate).format("MMMM Do, YYYY [at] ha"),
        }),
      ),
    ).toBeInTheDocument();
  });
});

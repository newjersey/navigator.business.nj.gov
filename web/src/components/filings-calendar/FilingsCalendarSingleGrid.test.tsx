import { generateLicenseEvent, generateXrayRenewalCalendarEvent } from "@/test/factories";
import * as shared from "@businessnjgovnavigator/shared";
import {
  defaultDateFormat,
  generateBusiness,
  generateLicenseDetails,
  generateTaxFilingCalendarEvent,
  generateTaxFilingData,
  parseDateWithFormat,
  randomElementFromArray,
} from "@businessnjgovnavigator/shared";
import { taskIdLicenseNameMapping } from "@businessnjgovnavigator/shared/";
import { getMergedConfig } from "@businessnjgovnavigator/shared/contexts";
import {
  generateLicenseData,
  generateXrayRegistrationData,
} from "@businessnjgovnavigator/shared/test";
import { OperateReference } from "@businessnjgovnavigator/shared/types";
import { fireEvent, render, screen } from "@testing-library/react";
import { Dayjs } from "dayjs";
import { FilingsCalendarSingleGrid } from "./FilingsCalendarSingleGrid";

const Config = getMergedConfig();
const fixedFebruaryDate = parseDateWithFormat(`2024-02-15`, "YYYY-MM-DD");
const year = fixedFebruaryDate.year().toString();
const month: number = Number.parseInt(fixedFebruaryDate.month().toString());

function mockShared(): typeof shared {
  return {
    ...jest.requireActual("@businessnjgovnavigator/shared"),
    getCurrentDate: (): Dayjs => fixedFebruaryDate,
  };
}

jest.mock("@businessnjgovnavigator/shared", () => mockShared());

const taxFilingOne = generateTaxFilingCalendarEvent({
  identifier: "tax-filing-one",
  dueDate: fixedFebruaryDate.format(defaultDateFormat),
});

const taxFilingTwo = generateTaxFilingCalendarEvent({
  identifier: "tax-filing-two",
  dueDate: fixedFebruaryDate.format(defaultDateFormat),
});

const taxFilingThree = generateTaxFilingCalendarEvent({
  identifier: "tax-filing-three",
  dueDate: fixedFebruaryDate.format(defaultDateFormat),
});

const operateReferences: Record<string, OperateReference> = {
  "tax-filing-one": {
    name: "Tax Filing One",
    urlSlug: "tax-filing-one-url",
    urlPath: "tax-filing-one-url-path",
  },
  "tax-filing-two": {
    name: "Tax Filing Two",
    urlSlug: "tax-filing-two-url",
    urlPath: "tax-filing-two-url-path",
  },
  "tax-filing-three": {
    name: "Tax Filing Three",
    urlSlug: "tax-filing-three-url",
    urlPath: "tax-filing-three-url-path",
  },
};

describe("<FilingsCalendarSingleGrid />", () => {
  it("renders a tax filings", () => {
    const taxFilingData = generateTaxFilingData({ filings: [taxFilingOne] });
    const business = generateBusiness({
      taxFilingData: taxFilingData,
    });
    render(
      <FilingsCalendarSingleGrid
        business={business}
        operateReferences={operateReferences}
        num={month}
        activeYear={year}
        licenseEvents={[generateLicenseEvent({})]}
        xrayRenewalEvent={generateXrayRenewalCalendarEvent({})}
      />,
    );
    expect(screen.getByText("Tax Filing One")).toBeInTheDocument();
  });

  it("does not render tax filing if it's in a month that has elapsed", () => {
    const business = generateBusiness({
      taxFilingData: generateTaxFilingData({
        filings: [
          generateTaxFilingCalendarEvent({
            identifier: "tax-filing-old",
            dueDate: fixedFebruaryDate.subtract(1, "month").format(defaultDateFormat),
          }),
        ],
      }),
    });
    render(
      <FilingsCalendarSingleGrid
        business={business}
        operateReferences={{
          "tax-filing-old": {
            name: "Tax Filing Old",
            urlSlug: "tax-filing-old-url",
            urlPath: "tax-filing-old-url-path",
          },
        }}
        num={month - 1}
        activeYear={year}
        licenseEvents={[generateLicenseEvent({})]}
        xrayRenewalEvent={generateXrayRenewalCalendarEvent({})}
      />,
    );
    expect(screen.queryByText("Tax Filing Old")).not.toBeInTheDocument();
  });

  it("renders tax filing when on a future year in a month that has elapsed", () => {
    const business = generateBusiness({
      taxFilingData: generateTaxFilingData({
        filings: [
          generateTaxFilingCalendarEvent({
            identifier: "tax-filing-old",
            dueDate: fixedFebruaryDate
              .add(1, "year")
              .subtract(1, "month")
              .format(defaultDateFormat),
          }),
        ],
      }),
    });
    render(
      <FilingsCalendarSingleGrid
        business={business}
        licenseEvents={[generateLicenseEvent({})]}
        xrayRenewalEvent={generateXrayRenewalCalendarEvent({})}
        operateReferences={{
          "tax-filing-old": {
            name: "Tax Filing Old",
            urlSlug: "tax-filing-old-url",
            urlPath: "tax-filing-old-url-path",
          },
        }}
        num={month - 1}
        activeYear={fixedFebruaryDate.add(1, "year").year().toString()}
      />,
    );
    expect(screen.getByText("Tax Filing Old")).toBeInTheDocument();
  });

  it("does not render tax filing when on a future year", () => {
    const taxFilingData = generateTaxFilingData({ filings: [taxFilingOne] });
    const business = generateBusiness({
      taxFilingData: taxFilingData,
    });
    render(
      <FilingsCalendarSingleGrid
        licenseEvents={[generateLicenseEvent({})]}
        business={business}
        operateReferences={operateReferences}
        num={month}
        activeYear={fixedFebruaryDate.add(1, "year").year().toString()}
        xrayRenewalEvent={generateXrayRenewalCalendarEvent({})}
      />,
    );

    expect(screen.queryByText("Tax Filing One")).not.toBeInTheDocument();
  });

  it("renders a licenseEvent expiration task", () => {
    const licenseName = randomElementFromArray(Object.values(taskIdLicenseNameMapping));
    const licenseEvent = generateLicenseEvent({ licenseName });
    const business = generateBusiness({
      taxFilingData: generateTaxFilingData({ filings: [] }),
      licenseData: generateLicenseData({
        licenses: {
          [licenseName]: generateLicenseDetails({
            expirationDateISO: fixedFebruaryDate.add(4, "days").toISOString(),
          }),
        },
      }),
    });

    render(
      <FilingsCalendarSingleGrid
        licenseEvents={[licenseEvent]}
        business={business}
        operateReferences={operateReferences}
        num={month}
        activeYear={fixedFebruaryDate.year().toString()}
        xrayRenewalEvent={generateXrayRenewalCalendarEvent({})}
      />,
    );

    expect(screen.getByText(licenseEvent.expirationEventDisplayName)).toBeInTheDocument();
    expect(screen.getByTestId("calendar-event-anchor")).toHaveAttribute(
      "href",
      `license-calendar-event/${licenseEvent.urlSlug}-expiration`,
    );
  });

  it("renders a licenseEvent renewal task", () => {
    const licenseName = randomElementFromArray(Object.values(taskIdLicenseNameMapping));
    const licenseEvent = generateLicenseEvent({ licenseName });
    const business = generateBusiness({
      taxFilingData: generateTaxFilingData({ filings: [] }),
      licenseData: generateLicenseData({
        licenses: {
          [licenseName]: generateLicenseDetails({
            expirationDateISO: fixedFebruaryDate.add(4, "days").toISOString(),
          }),
        },
      }),
    });

    render(
      <FilingsCalendarSingleGrid
        licenseEvents={[licenseEvent]}
        business={business}
        operateReferences={operateReferences}
        num={fixedFebruaryDate.add(1, "month").month()}
        activeYear={fixedFebruaryDate.year().toString()}
        xrayRenewalEvent={generateXrayRenewalCalendarEvent({})}
      />,
    );
    expect(screen.getByText(licenseEvent.renewalEventDisplayName)).toBeInTheDocument();
    expect(screen.getByTestId("calendar-event-anchor")).toHaveAttribute(
      "href",
      `license-calendar-event/${licenseEvent.urlSlug}-renewal`,
    );
  });

  it("renders expiration event and renewal event in the same month when expiration is on the 1st of a 31-day month", () => {
    const licenseName = randomElementFromArray(Object.values(taskIdLicenseNameMapping));
    const licenseEvent = generateLicenseEvent({ licenseName });
    const business = generateBusiness({
      taxFilingData: generateTaxFilingData({ filings: [] }),
      licenseData: generateLicenseData({
        licenses: {
          [licenseName]: generateLicenseDetails({
            expirationDateISO: fixedFebruaryDate.add(1, "year").month(0).date(1).toISOString(),
          }),
        },
      }),
    });

    render(
      <FilingsCalendarSingleGrid
        licenseEvents={[licenseEvent]}
        business={business}
        operateReferences={operateReferences}
        num={0}
        activeYear={fixedFebruaryDate.add(1, "year").year().toString()}
        xrayRenewalEvent={generateXrayRenewalCalendarEvent({})}
      />,
    );

    expect(screen.getByText(licenseEvent.expirationEventDisplayName)).toBeInTheDocument();
    expect(screen.getAllByTestId("calendar-event-anchor")[0]).toHaveAttribute(
      "href",
      `license-calendar-event/${licenseEvent.urlSlug}-expiration`,
    );

    expect(screen.getByText(licenseEvent.renewalEventDisplayName)).toBeInTheDocument();
    expect(screen.getAllByTestId("calendar-event-anchor")[1]).toHaveAttribute(
      "href",
      `license-calendar-event/${licenseEvent.urlSlug}-renewal`,
    );
  });

  it("does not render expand collapse button when there are only two tax filings", () => {
    const business = generateBusiness({
      taxFilingData: generateTaxFilingData({ filings: [taxFilingOne, taxFilingTwo] }),
    });
    render(
      <FilingsCalendarSingleGrid
        licenseEvents={[]}
        business={business}
        operateReferences={operateReferences}
        num={month}
        activeYear={year}
        xrayRenewalEvent={generateXrayRenewalCalendarEvent({})}
      />,
    );

    expect(screen.getByText("Tax Filing One")).toBeInTheDocument();
    expect(screen.getByText("Tax Filing Two")).toBeInTheDocument();
    expect(
      screen.queryByText(Config.dashboardDefaults.viewMoreFilingsButton),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(Config.dashboardDefaults.viewLessFilingsButton),
    ).not.toBeInTheDocument();
  });

  it("shows a licenseEvent and exactly 2 tax filings in order by due date", () => {
    const first = {
      ...taxFilingOne,
      dueDate: fixedFebruaryDate.toISOString(),
    };
    const last = {
      ...taxFilingTwo,
      dueDate: fixedFebruaryDate.add(2, "days").toISOString(),
    };

    const licenseName = randomElementFromArray(Object.values(taskIdLicenseNameMapping));
    const licenseEvent = generateLicenseEvent({ licenseName });
    const business = generateBusiness({
      taxFilingData: generateTaxFilingData({ filings: [last, first] }),
      licenseData: generateLicenseData({
        licenses: {
          [licenseName]: generateLicenseDetails({
            expirationDateISO: fixedFebruaryDate.add(1, "days").toISOString(),
            licenseStatus: "ACTIVE",
          }),
        },
      }),
    });

    render(
      <FilingsCalendarSingleGrid
        business={business}
        licenseEvents={[licenseEvent]}
        operateReferences={operateReferences}
        num={month}
        activeYear={year}
        xrayRenewalEvent={generateXrayRenewalCalendarEvent({})}
      />,
    );

    expect(screen.getByText("Tax Filing One")).toBeInTheDocument();
    expect(screen.getByText(licenseEvent.expirationEventDisplayName)).toBeInTheDocument();
    expect(screen.queryByText("Tax Filing Two")).not.toBeInTheDocument();

    fireEvent.click(screen.getByText(Config.dashboardDefaults.viewMoreFilingsButton));
    expect(screen.getByText("Tax Filing One")).toBeInTheDocument();
    expect(screen.getByText(licenseEvent.expirationEventDisplayName)).toBeInTheDocument();
    expect(screen.getByText("Tax Filing Two")).toBeInTheDocument();
  });

  it("shows a licenseEvent and 2+ tax filings in order by due date", () => {
    const first = {
      ...taxFilingOne,
      dueDate: fixedFebruaryDate.toISOString(),
    };
    const second = {
      ...taxFilingTwo,
      dueDate: fixedFebruaryDate.add(1, "day").toISOString(),
    };
    const last = {
      ...taxFilingThree,
      dueDate: fixedFebruaryDate.add(3, "days").toISOString(),
    };

    const licenseName = randomElementFromArray(Object.values(taskIdLicenseNameMapping));
    const licenseEvent = generateLicenseEvent({ licenseName });
    const business = generateBusiness({
      taxFilingData: generateTaxFilingData({ filings: [first, last, second] }),
      licenseData: generateLicenseData({
        licenses: {
          [licenseName]: generateLicenseDetails({
            expirationDateISO: fixedFebruaryDate.add(2, "days").toISOString(),
            licenseStatus: "ACTIVE",
          }),
        },
      }),
    });

    render(
      <FilingsCalendarSingleGrid
        licenseEvents={[licenseEvent]}
        business={business}
        operateReferences={operateReferences}
        num={month}
        activeYear={year}
        xrayRenewalEvent={generateXrayRenewalCalendarEvent({})}
      />,
    );

    expect(screen.getByText("Tax Filing One")).toBeInTheDocument();
    expect(screen.getByText("Tax Filing Two")).toBeInTheDocument();
    expect(screen.queryByText(licenseEvent.expirationEventDisplayName)).not.toBeInTheDocument();

    fireEvent.click(screen.getByText(Config.dashboardDefaults.viewMoreFilingsButton));
    expect(screen.getByText("Tax Filing One")).toBeInTheDocument();
    expect(screen.getByText("Tax Filing Two")).toBeInTheDocument();
    expect(screen.getByText("Tax Filing Three")).toBeInTheDocument();
    expect(screen.getByText(licenseEvent.expirationEventDisplayName)).toBeInTheDocument();
  });

  it("shows and hides the additional tax filings when the view more / view less button is clicked", () => {
    const business = generateBusiness({
      taxFilingData: generateTaxFilingData({
        filings: [taxFilingOne, taxFilingTwo, taxFilingThree],
      }),
    });
    render(
      <FilingsCalendarSingleGrid
        licenseEvents={[]}
        business={business}
        operateReferences={operateReferences}
        num={month}
        activeYear={year}
        xrayRenewalEvent={generateXrayRenewalCalendarEvent({})}
      />,
    );

    expect(screen.getByText("Tax Filing One")).toBeInTheDocument();
    expect(screen.getByText("Tax Filing Two")).toBeInTheDocument();
    expect(screen.queryByText("Tax Filing Three")).not.toBeInTheDocument();
    expect(screen.getByText(Config.dashboardDefaults.viewMoreFilingsButton)).toBeInTheDocument();
    expect(
      screen.queryByText(Config.dashboardDefaults.viewLessFilingsButton),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByText(Config.dashboardDefaults.viewMoreFilingsButton));
    expect(screen.getByText("Tax Filing Three")).toBeInTheDocument();
    expect(
      screen.queryByText(Config.dashboardDefaults.viewMoreFilingsButton),
    ).not.toBeInTheDocument();
    expect(screen.getByText(Config.dashboardDefaults.viewLessFilingsButton)).toBeInTheDocument();

    fireEvent.click(screen.getByText(Config.dashboardDefaults.viewLessFilingsButton));
    expect(screen.queryByText("Tax Filing Three")).not.toBeInTheDocument();
    expect(screen.getByText(Config.dashboardDefaults.viewMoreFilingsButton)).toBeInTheDocument();
    expect(
      screen.queryByText(Config.dashboardDefaults.viewLessFilingsButton),
    ).not.toBeInTheDocument();
  });

  it("renders an active xray renewal event", () => {
    const xrayRenewalEvent = generateXrayRenewalCalendarEvent({
      id: "xray-renewal",
      eventDisplayName: "Xray Renewal",
      urlSlug: "xray-renewal",
    });
    const business = generateBusiness({
      xrayRegistrationData: generateXrayRegistrationData({
        expirationDate: fixedFebruaryDate.add(1, "month").format("YYYY-MM-DD").toString(),
        status: "ACTIVE",
      }),
    });

    render(
      <FilingsCalendarSingleGrid
        licenseEvents={[]}
        business={business}
        operateReferences={operateReferences}
        num={fixedFebruaryDate.add(1, "month").month()}
        activeYear={fixedFebruaryDate.year().toString()}
        xrayRenewalEvent={xrayRenewalEvent}
      />,
    );
    expect(screen.getByText(xrayRenewalEvent.eventDisplayName)).toBeInTheDocument();
    expect(screen.getByTestId("calendar-event-anchor")).toHaveAttribute(
      "href",
      `${xrayRenewalEvent.urlSlug}`,
    );
  });

  it("renders an expired xray renewal event", () => {
    const renewalEvent = generateXrayRenewalCalendarEvent({
      id: "xray-renewal",
      eventDisplayName: "Xray Renewal",
      urlSlug: "xray-renewal",
    });
    const business = generateBusiness({
      xrayRegistrationData: generateXrayRegistrationData({
        expirationDate: fixedFebruaryDate.subtract(1, "day").format("YYYY-MM-DD").toString(),
        status: "EXPIRED",
      }),
    });

    render(
      <FilingsCalendarSingleGrid
        licenseEvents={[]}
        business={business}
        operateReferences={operateReferences}
        num={fixedFebruaryDate.month()}
        activeYear={fixedFebruaryDate.year().toString()}
        xrayRenewalEvent={renewalEvent}
      />,
    );
    expect(screen.getByText(renewalEvent.eventDisplayName)).toBeInTheDocument();
    expect(screen.getByTestId("calendar-event-anchor")).toHaveAttribute(
      "href",
      `${renewalEvent.urlSlug}`,
    );
  });
});

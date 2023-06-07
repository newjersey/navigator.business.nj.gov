import { getMergedConfig } from "@/contexts/configContext";
import { OperateReference } from "@/lib/types/types";
import * as shared from "@businessnjgovnavigator/shared";
import {
  defaultDateFormat,
  generateTaxFilingData,
  generateUserData,
  parseDateWithFormat,
} from "@businessnjgovnavigator/shared";
import { generateLicenseData, generateTaxFiling } from "@businessnjgovnavigator/shared/test";
import { fireEvent, render, screen } from "@testing-library/react";
import { Dayjs } from "dayjs";
import { FilingsCalendarSingleGrid } from "./FilingsCalendarSingleGrid";

const Config = getMergedConfig();
const currentDate = parseDateWithFormat(`2024-02-15`, "YYYY-MM-DD");
const year = currentDate.year().toString();
const month: number = Number.parseInt(currentDate.month().toString());

function mockShared(): typeof shared {
  return {
    ...jest.requireActual("@businessnjgovnavigator/shared"),
    getCurrentDate: (): Dayjs => currentDate,
  };
}

jest.mock("@businessnjgovnavigator/shared", () => mockShared());

const taxFilingOne = generateTaxFiling({
  identifier: "tax-filing-one",
  dueDate: currentDate.format(defaultDateFormat),
});

const taxFilingTwo = generateTaxFiling({
  identifier: "tax-filing-two",
  dueDate: currentDate.format(defaultDateFormat),
});

const taxFilingThree = generateTaxFiling({
  identifier: "tax-filing-three",
  dueDate: currentDate.format(defaultDateFormat),
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
    const userData = generateUserData({
      taxFilingData: taxFilingData,
    });
    render(
      <FilingsCalendarSingleGrid
        userData={userData}
        operateReferences={operateReferences}
        num={month}
        activeYear={year}
      />
    );
    expect(screen.getByText("Tax Filing One")).toBeInTheDocument();
  });

  it("does not render tax filing if it's in a month that has elapsed", () => {
    const userData = generateUserData({
      taxFilingData: generateTaxFilingData({
        filings: [
          generateTaxFiling({
            identifier: "tax-filing-old",
            dueDate: currentDate.subtract(1, "month").format(defaultDateFormat),
          }),
        ],
      }),
    });
    render(
      <FilingsCalendarSingleGrid
        userData={userData}
        operateReferences={{
          "tax-filing-old": {
            name: "Tax Filing Old",
            urlSlug: "tax-filing-old-url",
            urlPath: "tax-filing-old-url-path",
          },
        }}
        num={month - 1}
        activeYear={year}
      />
    );
    expect(screen.queryByText("Tax Filing Old")).not.toBeInTheDocument();
  });

  it("renders tax filing when on a future year in a month that has elapsed", () => {
    const userData = generateUserData({
      taxFilingData: generateTaxFilingData({
        filings: [
          generateTaxFiling({
            identifier: "tax-filing-old",
            dueDate: currentDate.add(1, "year").subtract(1, "month").format(defaultDateFormat),
          }),
        ],
      }),
    });
    render(
      <FilingsCalendarSingleGrid
        userData={userData}
        operateReferences={{
          "tax-filing-old": {
            name: "Tax Filing Old",
            urlSlug: "tax-filing-old-url",
            urlPath: "tax-filing-old-url-path",
          },
        }}
        num={month - 1}
        activeYear={currentDate.add(1, "year").year().toString()}
      />
    );
    expect(screen.getByText("Tax Filing Old")).toBeInTheDocument();
  });

  it("does not render tax filing when on a future year", () => {
    const taxFilingData = generateTaxFilingData({ filings: [taxFilingOne] });
    const userData = generateUserData({
      taxFilingData: taxFilingData,
    });
    render(
      <FilingsCalendarSingleGrid
        userData={userData}
        operateReferences={operateReferences}
        num={month}
        activeYear={currentDate.add(1, "year").year().toString()}
      />
    );

    expect(screen.queryByText("Tax Filing One")).not.toBeInTheDocument();
  });

  it("renders a licenseEvent expiration task", () => {
    const licenseData = generateLicenseData({
      expirationISO: currentDate.add(4, "days").toISOString(),
      status: "ACTIVE",
    });
    const userData = generateUserData({
      licenseData,
    });
    render(
      <FilingsCalendarSingleGrid
        userData={userData}
        operateReferences={operateReferences}
        num={month}
        activeYear={currentDate.year().toString()}
      />
    );

    expect(screen.getByTestId("license-expiration")).toBeInTheDocument();
  });

  it("renders a licenseEvent renewal task", () => {
    const licenseData = generateLicenseData({
      expirationISO: currentDate.add(4, "days").toISOString(),
      status: "ACTIVE",
    });
    const userData = generateUserData({ licenseData });
    render(
      <FilingsCalendarSingleGrid
        userData={userData}
        operateReferences={operateReferences}
        num={currentDate.add(1, "month").month()}
        activeYear={currentDate.year().toString()}
      />
    );

    expect(screen.getByTestId("license-renewal")).toBeInTheDocument();
  });

  it("does not render expand collapse button when there are only two tax filings", () => {
    const userData = generateUserData({
      taxFilingData: generateTaxFilingData({ filings: [taxFilingOne, taxFilingTwo] }),
    });
    render(
      <FilingsCalendarSingleGrid
        userData={userData}
        operateReferences={operateReferences}
        num={month}
        activeYear={year}
      />
    );

    expect(screen.getByText("Tax Filing One")).toBeInTheDocument();
    expect(screen.getByText("Tax Filing Two")).toBeInTheDocument();
    expect(screen.queryByText(Config.dashboardDefaults.viewMoreFilingsButton)).not.toBeInTheDocument();
    expect(screen.queryByText(Config.dashboardDefaults.viewLessFilingsButton)).not.toBeInTheDocument();
  });

  it("always shows a licenseEvent even with 2+ tax filings", () => {
    const userData = generateUserData({
      licenseData: generateLicenseData({
        expirationISO: currentDate.add(4, "days").toISOString(),
        status: "ACTIVE",
      }),
      taxFilingData: generateTaxFilingData({ filings: [taxFilingOne, taxFilingTwo, taxFilingThree] }),
    });
    render(
      <FilingsCalendarSingleGrid
        userData={userData}
        operateReferences={operateReferences}
        num={month}
        activeYear={year}
      />
    );

    expect(screen.getByText("Tax Filing One")).toBeInTheDocument();
    expect(screen.getByTestId("license-expiration")).toBeInTheDocument();
    expect(screen.queryByText("Tax Filing Two")).not.toBeInTheDocument();
    fireEvent.click(screen.getByText(Config.dashboardDefaults.viewMoreFilingsButton));
    expect(screen.getByText("Tax Filing Two")).toBeInTheDocument();
    expect(screen.getByText("Tax Filing Three")).toBeInTheDocument();
  });

  it("shows and hides the additional tax filings when the view more / view less button is clicked", () => {
    const userData = generateUserData({
      taxFilingData: generateTaxFilingData({ filings: [taxFilingOne, taxFilingTwo, taxFilingThree] }),
    });
    render(
      <FilingsCalendarSingleGrid
        userData={userData}
        operateReferences={operateReferences}
        num={month}
        activeYear={year}
      />
    );

    expect(screen.getByText("Tax Filing One")).toBeInTheDocument();
    expect(screen.getByText("Tax Filing Two")).toBeInTheDocument();
    expect(screen.queryByText("Tax Filing Three")).not.toBeInTheDocument();
    expect(screen.getByText(Config.dashboardDefaults.viewMoreFilingsButton)).toBeInTheDocument();
    expect(screen.queryByText(Config.dashboardDefaults.viewLessFilingsButton)).not.toBeInTheDocument();

    fireEvent.click(screen.getByText(Config.dashboardDefaults.viewMoreFilingsButton));
    expect(screen.getByText("Tax Filing Three")).toBeInTheDocument();
    expect(screen.queryByText(Config.dashboardDefaults.viewMoreFilingsButton)).not.toBeInTheDocument();
    expect(screen.getByText(Config.dashboardDefaults.viewLessFilingsButton)).toBeInTheDocument();

    fireEvent.click(screen.getByText(Config.dashboardDefaults.viewLessFilingsButton));
    expect(screen.queryByText("Tax Filing Three")).not.toBeInTheDocument();
    expect(screen.getByText(Config.dashboardDefaults.viewMoreFilingsButton)).toBeInTheDocument();
    expect(screen.queryByText(Config.dashboardDefaults.viewLessFilingsButton)).not.toBeInTheDocument();
  });
});

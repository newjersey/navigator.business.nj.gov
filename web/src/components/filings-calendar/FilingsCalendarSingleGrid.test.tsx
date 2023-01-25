import { getMergedConfig } from "@/contexts/configContext";
import { OperateReference } from "@/lib/types/types";
import { generateTaxFiling, generateTaxFilingData, generateUserData } from "@/test/factories";
import { defaultDateFormat, getJanOfCurrentYear } from "@businessnjgovnavigator/shared";
import { fireEvent, render, screen } from "@testing-library/react";
import { FilingsCalendarSingleGrid } from "./FilingsCalendarSingleGrid";

const Config = getMergedConfig();

const taxFilingOne = generateTaxFiling({
  identifier: "tax-filing-one",
  dueDate: getJanOfCurrentYear().format(defaultDateFormat),
});

const taxFilingTwo = generateTaxFiling({
  identifier: "tax-filing-two",
  dueDate: getJanOfCurrentYear().format(defaultDateFormat),
});

const taxFilingThree = generateTaxFiling({
  identifier: "tax-filing-three",
  dueDate: getJanOfCurrentYear().format(defaultDateFormat),
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
  it("renders a single tax filing tax filings", () => {
    const userData = generateUserData({
      taxFilingData: generateTaxFilingData({ filings: [taxFilingOne] }),
    });
    render(<FilingsCalendarSingleGrid userData={userData} operateReferences={operateReferences} num={0} />);

    expect(screen.getByText("Tax Filing One")).toBeInTheDocument();
    expect(screen.queryByText("Tax Filing Two")).not.toBeInTheDocument();
    expect(screen.queryByText("Tax Filing Three")).not.toBeInTheDocument();
  });

  it("does not render expand collapse button when there are only two tax filings", () => {
    const userData = generateUserData({
      taxFilingData: generateTaxFilingData({ filings: [taxFilingOne, taxFilingTwo] }),
    });
    render(<FilingsCalendarSingleGrid userData={userData} operateReferences={operateReferences} num={0} />);

    expect(screen.getByText("Tax Filing One")).toBeInTheDocument();
    expect(screen.getByText("Tax Filing Two")).toBeInTheDocument();
    expect(screen.queryByText("Tax Filing Three")).not.toBeInTheDocument();
    expect(screen.queryByText(Config.dashboardDefaults.viewMoreFilingsButton)).not.toBeInTheDocument();
    expect(screen.queryByText(Config.dashboardDefaults.viewLessFilingsButton)).not.toBeInTheDocument();
  });

  it("shows and hides the additional tax filings when the view more / view less button is clicked", () => {
    const userData = generateUserData({
      taxFilingData: generateTaxFilingData({ filings: [taxFilingOne, taxFilingTwo, taxFilingThree] }),
    });
    render(<FilingsCalendarSingleGrid userData={userData} operateReferences={operateReferences} num={0} />);

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

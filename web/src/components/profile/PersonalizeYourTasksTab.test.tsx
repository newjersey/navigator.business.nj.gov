import { PersonalizeYourTasksTab } from "@/components/profile/PersonalizeYourTasksTab";
import { getMergedConfig } from "@/contexts/configContext";
import { render, screen } from "@testing-library/react";
import React from "react";

jest.mock("@/components/profile/ProfileTabHeader", () => ({
  ProfileTabHeader: (() => <div data-testid="profile-tab-header" />) as React.FC,
}));

jest.mock("@/components/njwds-extended/Heading", () => ({
  Heading: ({ children }: { children: React.ReactNode }): React.ReactElement => (
    <div>{children}</div>
  ),
}));

jest.mock("@/components/njwds/Icon", () => ({
  Icon: (({ iconName }: { iconName: string }) => <span>{iconName}</span>) as React.FC<{
    iconName: string;
  }>,
}));

jest.mock("@/components/Content", () => ({
  Content: (({ children }) => <div>{children}</div>) as React.FC<{ children: React.ReactNode }>,
}));

const Config = getMergedConfig();

describe("PersonalizeYourTasksTab", () => {
  it("renders the tab panel with correct attributes", () => {
    render(<PersonalizeYourTasksTab />);
    const tabPanel = screen.getByRole("tabpanel");
    expect(tabPanel).toHaveAttribute("id", "tabpanel-personalize");
  });

  it("renders the ProfileTabHeader", () => {
    render(<PersonalizeYourTasksTab />);
    expect(screen.getByTestId("profile-tab-header")).toBeInTheDocument();
  });

  it("renders 4 accordions", () => {
    render(<PersonalizeYourTasksTab />);
    const accordions = screen.getAllByRole("button", { expanded: false });
    expect(accordions).toHaveLength(4);
  });

  it("renders all accordion headers with correct text", () => {
    render(<PersonalizeYourTasksTab />);
    expect(
      screen.getByText(Config.profileDefaults.default.annualReportDeadlineHeader),
    ).toBeInTheDocument();
    expect(
      screen.getByText(Config.profileDefaults.default.filterCertificationsAndFundingHeader),
    ).toBeInTheDocument();
    expect(
      screen.getByText(Config.profileDefaults.default.locationBasedRequirementsHeader),
    ).toBeInTheDocument();
    expect(
      screen.getByText(Config.profileDefaults.fields.nonEssentialQuestions.default.sectionHeader),
    ).toBeInTheDocument();
  });

  it("renders accordion descriptions", () => {
    render(<PersonalizeYourTasksTab />);
    expect(
      screen.getByText(Config.profileDefaults.default.annualReportDeadlineSubText),
    ).toBeInTheDocument();
    expect(
      screen.getByText(Config.profileDefaults.default.filterCertificationsAndFundingSubText),
    ).toBeInTheDocument();
    expect(
      screen.getByText(Config.profileDefaults.default.locationBasedRequirementsSubText),
    ).toBeInTheDocument();
    expect(
      screen.getByText(Config.profileDefaults.fields.nonEssentialQuestions.default.sectionSubText),
    ).toBeInTheDocument();
  });
});

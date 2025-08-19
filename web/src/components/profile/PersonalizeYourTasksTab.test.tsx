import { PersonalizeYourTasksTab } from "@/components/profile/PersonalizeYourTasksTab";
import { WithStatefulProfileData } from "@/test/mock/withStatefulProfileData";
import { getMergedConfig } from "@businessnjgovnavigator/shared/contexts";
import { ProfileData } from "@businessnjgovnavigator/shared/profileData";
import { generateProfileData } from "@businessnjgovnavigator/shared/test";
import { fireEvent, render, screen, within } from "@testing-library/react";
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

jest.mock("@/lib/utils/useIntersectionOnElement", () => ({
  useIntersectionOnElement: jest.fn(),
}));

const Config = getMergedConfig();

const renderPersonalizeYourTasksTab = ({
  profileData,
  fieldErrors,
  isFormationDateFieldVisible,
  futureAllowed,
}: {
  profileData?: ProfileData;
  fieldErrors?: string[];
  isFormationDateFieldVisible?: boolean;
  futureAllowed?: boolean;
}): void => {
  const initialProfileData = profileData ?? generateProfileData({});
  render(
    <WithStatefulProfileData initialData={initialProfileData}>
      <PersonalizeYourTasksTab
        fieldErrors={fieldErrors}
        isFormationDateFieldVisible={isFormationDateFieldVisible}
        futureAllowed={futureAllowed}
      />
    </WithStatefulProfileData>,
  );
};

describe("PersonalizeYourTasksTab", () => {
  it("renders the tab panel with correct attributes", () => {
    renderPersonalizeYourTasksTab({});
    const tabPanel = screen.getByRole("tabpanel");
    expect(tabPanel).toHaveAttribute("id", "tabpanel-personalize");
  });

  it("renders the ProfileTabHeader", () => {
    renderPersonalizeYourTasksTab({});
    expect(screen.getByTestId("profile-tab-header")).toBeInTheDocument();
  });

  it("renders 4 accordions", () => {
    renderPersonalizeYourTasksTab({});
    const accordions = screen.getAllByRole("button", { expanded: false });
    expect(accordions).toHaveLength(4);
  });

  it("renders all accordion headers with correct text", () => {
    renderPersonalizeYourTasksTab({});
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
    renderPersonalizeYourTasksTab({});
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

  describe("Annual Report Deadline Accordian", () => {
    it("does display a chevron for the annualReportDeadlineAccordianSection section if dateOfFormation has value", () => {
      const profileData = generateProfileData({
        businessPersona: "STARTING",
        sectorId: "unknown",
        dateOfFormation: "10/2024",
      });

      renderPersonalizeYourTasksTab({
        profileData,
        isFormationDateFieldVisible: true,
        futureAllowed: true,
      });

      const accordion = screen.getByTestId("annualReportDeadlineAccordianSection");
      expect(within(accordion).getByTestId("ExpandMoreIcon")).toBeInTheDocument();
    });

    it("does not display a chevron for the annualReportDeadlineAccordianSection section if dateOfFormation not visible", () => {
      const profileData = generateProfileData({
        businessPersona: "STARTING",
        sectorId: "unknown",
        dateOfFormation: "10/2024",
      });

      renderPersonalizeYourTasksTab({
        profileData,
        isFormationDateFieldVisible: false,
        futureAllowed: false,
      });

      const accordion = screen.getByTestId("annualReportDeadlineAccordianSection");
      expect(within(accordion).queryByTestId("ExpandMoreIcon")).not.toBeInTheDocument();
    });
  });

  describe("nonEssential Questions Accordian", () => {
    it("renders nonEssentialQuestion content", () => {
      const profileData = generateProfileData({
        businessPersona: "STARTING",
        industryId: "photography",
      });

      renderPersonalizeYourTasksTab({ profileData });

      fireEvent.click(
        within(screen.getByTestId("nonEssentialQuestionsAccordianSection")).getByTestId(
          "ExpandMoreIcon",
        ),
      );

      expect(screen.queryAllByTestId("non-essential-questions-wrapper").length).toBeGreaterThan(0);
    });

    it("does not display a chevron for the nonEssentialQuestions section if the user has no tasks", () => {
      const profileData = generateProfileData({
        businessPersona: "OWNING",
        sectorId: "unknown",
      });

      renderPersonalizeYourTasksTab({ profileData });

      expect(
        within(screen.getByTestId("nonEssentialQuestionsAccordianSection")).queryByTestId(
          "ExpandMoreIcon",
        ),
      ).not.toBeInTheDocument();
    });

    it("does display a chevron for the nonEssentialQuestions section if the user has tasks", () => {
      const profileData = generateProfileData({
        businessPersona: "STARTING",
        industryId: "photography",
      });

      renderPersonalizeYourTasksTab({ profileData });

      expect(
        within(screen.getByTestId("nonEssentialQuestionsAccordianSection")).getByTestId(
          "ExpandMoreIcon",
        ),
      ).toBeInTheDocument();
    });
  });
});

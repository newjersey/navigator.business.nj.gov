import { getMergedConfig } from "@/contexts/configContext";
import { ROUTES } from "@/lib/domain-logic/routes";
import { Funding } from "@/lib/types/types";
import FundingsPage from "@/pages/fundings";
import { generateFunding } from "@/test/factories";
import { mockPush, useMockRouter } from "@/test/mock/mockRouter";
import { useMockRoadmap } from "@/test/mock/mockUseRoadmap";
import { setupStatefulUserDataContext, WithStatefulUserData } from "@/test/mock/withStatefulUserData";
import { selectByValue } from "@/test/pages/profile/profile-helpers";
import {
  generateBusiness,
  generateProfileData,
  generateUserDataForBusiness,
} from "@businessnjgovnavigator/shared/test";
import { Business } from "@businessnjgovnavigator/shared/userData";
import { createTheme, ThemeProvider } from "@mui/material";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

jest.mock("next/compat/router", () => ({ useRouter: jest.fn() }));
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));
jest.mock("@/lib/roadmap/buildUserRoadmap", () => ({ buildUserRoadmap: jest.fn() }));

const Config = getMergedConfig();

const renderStatefulFundingsPageComponent = (business: Business, fundings: Funding[]): void => {
  setupStatefulUserDataContext();

  render(
    <WithStatefulUserData initialUserData={generateUserDataForBusiness(business ?? generateBusiness({}))}>
      <ThemeProvider theme={createTheme()}>
        <FundingsPage fundings={fundings} />
      </ThemeProvider>
    </WithStatefulUserData>
  );
};

describe("fundings onboarding", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockRouter({});
    useMockRoadmap({});
  });

  it("renders the radio buttons", async () => {
    useMockRouter({});
    const business = generateBusiness({});
    renderStatefulFundingsPageComponent(business, []);
    expect(
      screen.getByText(Config.fundingsOnboardingModal.nonProfitQuestion.questionText)
    ).toBeInTheDocument();
    expect(
      screen.getByText(Config.fundingsOnboardingModal.businessOperatingLengthQuestion.questionText)
    ).toBeInTheDocument();
  });

  it("closes the modal when all questions are answered", async () => {
    useMockRouter({});
    const business = generateBusiness({});
    renderStatefulFundingsPageComponent(business, []);
    expect(
      screen.getByText(Config.fundingsOnboardingModal.nonProfitQuestion.questionText)
    ).toBeInTheDocument();
    fireEvent.click(screen.getByText(Config.fundingsOnboardingModal.nonProfitQuestion.responses.yes));
    fireEvent.click(
      screen.getByText(Config.fundingsOnboardingModal.businessOperatingLengthQuestion.responses.long)
    );
    await waitFor(() => {
      selectByValue("Sector", "clean-energy");
    });
    fireEvent.click(screen.getByText("Save"));
    fireEvent.click(screen.getByText(Config.fundingsOnboardingModal.pageHeader.buttonText));
    expect(mockPush).toHaveBeenCalledWith(ROUTES.dashboard);
  });

  it("triggers validation when questions are unanswered and Save is pressed", async () => {
    useMockRouter({});
    const business = generateBusiness({});
    renderStatefulFundingsPageComponent(business, []);
    expect(
      screen.getByText(Config.fundingsOnboardingModal.nonProfitQuestion.questionText)
    ).toBeInTheDocument();
    expect(
      screen.getByText(Config.fundingsOnboardingModal.businessOperatingLengthQuestion.questionText)
    ).toBeInTheDocument();
    fireEvent.click(screen.getByText("Save"));
    expect(
      screen.getByText(Config.fundingsOnboardingModal.incompleteWarningMultipleText)
    ).toBeInTheDocument();
  });

  it("triggers validation when sector question is unanswered and Save is pressed", async () => {
    useMockRouter({});
    const business = generateBusiness({});
    renderStatefulFundingsPageComponent(business, []);
    fireEvent.click(screen.getByText(Config.fundingsOnboardingModal.nonProfitQuestion.responses.yes));
    fireEvent.click(
      screen.getByText(Config.fundingsOnboardingModal.businessOperatingLengthQuestion.responses.long)
    );
    fireEvent.click(screen.getByText("Save"));
    expect(
      screen.getByText(Config.fundingsOnboardingModal.incompleteWarningSingularText)
    ).toBeInTheDocument();
  });

  it("navigates to funding when clicked", async () => {
    useMockRouter({});
    const profileData = generateProfileData({ sectorId: "" });
    const business = generateBusiness({ profileData: profileData });
    const fundings = [
      generateFunding({
        isNonprofitOnly: false,
        sector: ["clean-energy"],
        employeesRequired: "n/a",
        county: ["All"],
        homeBased: "yes",
      }),
    ];
    renderStatefulFundingsPageComponent(business, fundings);
    fireEvent.click(screen.getByText(Config.fundingsOnboardingModal.nonProfitQuestion.responses.yes));
    fireEvent.click(
      screen.getByText(Config.fundingsOnboardingModal.businessOperatingLengthQuestion.responses.long)
    );
    fireEvent.click(screen.getByText("Save"));
    await waitFor(() => {
      selectByValue("Sector", "clean-energy");
    });
    expect(
      screen.queryByText(Config.fundingsOnboardingModal.incompleteWarningSingularText)
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByTestId(`${fundings[0].id}-button`));
    expect(mockPush).toHaveBeenCalled();
  });

  it("filters out unrelated fundings", async () => {
    useMockRouter({});
    const profileData = generateProfileData({ sectorId: "" });
    const business = generateBusiness({ profileData: profileData });
    const fundings = [
      generateFunding({
        isNonprofitOnly: true,
        sector: ["clean-energy"],
        employeesRequired: "n/a",
        county: ["All"],
        homeBased: "yes",
      }),
    ];
    renderStatefulFundingsPageComponent(business, fundings);
    fireEvent.click(screen.getByText(Config.fundingsOnboardingModal.nonProfitQuestion.responses.no));
    fireEvent.click(
      screen.getByText(Config.fundingsOnboardingModal.businessOperatingLengthQuestion.responses.long)
    );
    fireEvent.click(screen.getByText("Save"));
    await waitFor(() => {
      selectByValue("Sector", "clean-energy");
    });
    expect(
      screen.queryByText(Config.fundingsOnboardingModal.incompleteWarningSingularText)
    ).not.toBeInTheDocument();
    expect(screen.queryByTestId(`${fundings[0].id}-button`)).not.toBeInTheDocument();
  });
});

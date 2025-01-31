import { getMergedConfig } from "@/contexts/configContext";
import { ROUTES } from "@/lib/domain-logic/routes";
import { Funding } from "@/lib/types/types";
import FundingsPage from "@/pages/fundings";
import { generateFunding } from "@/test/factories";
import { mockPush, useMockRouter } from "@/test/mock/mockRouter";
import { setupStatefulUserDataContext, WithStatefulUserData } from "@/test/mock/withStatefulUserData";
import { selectByValue } from "@/test/pages/profile/profile-helpers";
import {
  generateBusiness,
  generateProfileData,
  generateUserDataForBusiness,
} from "@businessnjgovnavigator/shared/test";
import { Business } from "@businessnjgovnavigator/shared/userData";
import { createTheme, ThemeProvider } from "@mui/material";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

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
        <FundingsPage fundings={fundings} noAuth={true} />
      </ThemeProvider>
    </WithStatefulUserData>
  );
};

describe("fundings onboarding", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockRouter({});
  });

  it("closes the modal when all questions are answered", async () => {
    const user = userEvent.setup();
    const business = generateBusiness({});
    renderStatefulFundingsPageComponent(business, []);
    expect(
      screen.getByText(Config.fundingsOnboardingModal.nonProfitQuestion.questionText)
    ).toBeInTheDocument();
    await user.click(screen.getByText(Config.fundingsOnboardingModal.nonProfitQuestion.responses.yes));
    await user.click(
      screen.getByText(Config.fundingsOnboardingModal.businessOperatingLengthQuestion.responses.long)
    );
    await waitFor(() => {
      selectByValue("Sector", "clean-energy");
    });
    await user.click(screen.getByText(Config.fundingsOnboardingModal.saveButtonText));
    await user.click(screen.getByText(Config.fundingsOnboardingModal.pageHeader.buttonText));
    expect(mockPush).toHaveBeenCalledWith(ROUTES.dashboard);
  });

  it("triggers validation when questions are unanswered and Save is pressed", async () => {
    const user = userEvent.setup();
    const business = generateBusiness({});
    renderStatefulFundingsPageComponent(business, []);
    expect(
      screen.getByText(Config.fundingsOnboardingModal.nonProfitQuestion.questionText)
    ).toBeInTheDocument();
    expect(
      screen.getByText(Config.fundingsOnboardingModal.businessOperatingLengthQuestion.questionText)
    ).toBeInTheDocument();
    await user.click(screen.getByText(Config.fundingsOnboardingModal.saveButtonText));
    expect(
      screen.getByText(Config.fundingsOnboardingModal.incompleteWarningMultipleText)
    ).toBeInTheDocument();
  });

  it("navigates to funding when clicked", async () => {
    const user = userEvent.setup();
    const profileData = generateProfileData({ sectorId: "" });
    const business = generateBusiness({ profileData: profileData });
    const fundings = [
      generateFunding({
        isNonprofitOnly: false,
        sector: ["clean-energy"],
        employeesRequired: "n/a",
        county: ["All"],
        homeBased: "yes",
        publishStageArchive: null,
        dueDate: undefined,
        status: "rolling application",
        certifications: null,
        agency: ["njeda"],
      }),
    ];
    renderStatefulFundingsPageComponent(business, fundings);

    await user.click(screen.getByText(Config.fundingsOnboardingModal.nonProfitQuestion.responses.yes));
    await user.click(
      screen.getByText(Config.fundingsOnboardingModal.businessOperatingLengthQuestion.responses.long)
    );

    await waitFor(() => {
      selectByValue("Sector", "clean-energy");
    });
    await user.click(screen.getByText(Config.fundingsOnboardingModal.saveButtonText));
    await user.click(screen.getByTestId(`${fundings[0].id}-button`));

    expect(
      screen.queryByText(Config.fundingsOnboardingModal.incompleteWarningSingularText)
    ).not.toBeInTheDocument();

    expect(mockPush).toHaveBeenCalled();
  });

  it("filters out non-njeda fundings", async () => {
    const user = userEvent.setup();
    const profileData = generateProfileData({ sectorId: "" });
    const business = generateBusiness({ profileData: profileData });
    const fundings = [
      generateFunding({
        isNonprofitOnly: false,
        sector: ["clean-energy"],
        employeesRequired: "n/a",
        county: ["All"],
        homeBased: "yes",
        publishStageArchive: null,
        dueDate: undefined,
        status: "rolling application",
        certifications: null,
        agency: ["njeda"],
      }),
      generateFunding({
        isNonprofitOnly: false,
        sector: ["clean-energy"],
        employeesRequired: "n/a",
        county: ["All"],
        homeBased: "yes",
        publishStageArchive: null,
        dueDate: undefined,
        status: "rolling application",
        certifications: null,
        agency: ["other-cool-agency"],
      }),
    ];
    renderStatefulFundingsPageComponent(business, fundings);

    await user.click(screen.getByText(Config.fundingsOnboardingModal.nonProfitQuestion.responses.yes));
    await user.click(
      screen.getByText(Config.fundingsOnboardingModal.businessOperatingLengthQuestion.responses.long)
    );

    await waitFor(() => {
      selectByValue("Sector", "clean-energy");
    });
    await user.click(screen.getByText(Config.fundingsOnboardingModal.saveButtonText));

    expect(screen.getByTestId(`${fundings[0].id}-button`)).toBeInTheDocument();
    expect(screen.queryByTestId(`${fundings[1].id}-button`)).not.toBeInTheDocument();
  });
});

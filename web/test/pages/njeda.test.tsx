import { ROUTES } from "@/lib/domain-logic/routes";
import NJEDAFundingsOnboardingPage from "@/pages/njeda";
import { generateFunding } from "@/test/factories";
import { mockPush, useMockRouter } from "@/test/mock/mockRouter";
import {
  setupStatefulUserDataContext,
  WithStatefulUserData,
} from "@/test/mock/withStatefulUserData";
import { selectByValue } from "@/test/pages/profile/profile-helpers";
import { getMergedConfig } from "@businessnjgovnavigator/shared/contexts";
import {
  generateBusiness,
  generateProfileData,
  generateUserDataForBusiness,
} from "@businessnjgovnavigator/shared/test";
import { Funding } from "@businessnjgovnavigator/shared/types";
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
    <WithStatefulUserData
      initialUserData={generateUserDataForBusiness(business ?? generateBusiness({}))}
    >
      <ThemeProvider theme={createTheme()}>
        <NJEDAFundingsOnboardingPage fundings={fundings} noAuth={true} />
      </ThemeProvider>
    </WithStatefulUserData>,
  );
};

describe("njeda fundings onboarding", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockRouter({});
  });

  it("closes the modal when all questions are answered and routes to dashboard", async () => {
    const user = userEvent.setup();
    const business = generateBusiness({});
    renderStatefulFundingsPageComponent(business, []);
    expect(
      screen.getByText(Config.fundingsOnboardingModal.nonProfitQuestion.questionText),
    ).toBeInTheDocument();
    await user.click(
      screen.getByText(Config.fundingsOnboardingModal.nonProfitQuestion.responses.yes),
    );
    await user.type(screen.getByRole("textbox", { name: "Existing employees" }), "35");
    await waitFor(() => {
      selectByValue("Sector", "clean-energy");
    });
    await user.click(screen.getByText(Config.fundingsOnboardingModal.saveButtonText));
    await user.click(screen.getByText(Config.fundingsOnboardingModal.pageHeader.buttonText));
    expect(mockPush).toHaveBeenCalledWith(ROUTES.dashboard);
  });

  it("closes the modal when all questions are answered and routes to njeda when logo is clicked", async () => {
    const user = userEvent.setup();
    const business = generateBusiness({});
    renderStatefulFundingsPageComponent(business, []);
    expect(
      screen.getByText(Config.fundingsOnboardingModal.nonProfitQuestion.questionText),
    ).toBeInTheDocument();
    await user.click(
      screen.getByText(Config.fundingsOnboardingModal.nonProfitQuestion.responses.yes),
    );
    await user.type(screen.getByRole("textbox", { name: "Existing employees" }), "35");
    await waitFor(() => {
      selectByValue("Sector", "clean-energy");
    });
    await user.click(screen.getByText(Config.fundingsOnboardingModal.saveButtonText));
    await user.click(screen.getByTestId("njeda-logo-button"));
    expect(mockPush).toHaveBeenCalledWith(Config.fundingsOnboardingModal.pageHeader.logoLink);
  });

  it("triggers validation when questions are unanswered and Save is pressed", async () => {
    const user = userEvent.setup();
    const business = generateBusiness({
      profileData: generateProfileData({
        existingEmployees: "",
      }),
    });
    renderStatefulFundingsPageComponent(business, []);
    expect(
      screen.getByText(Config.fundingsOnboardingModal.nonProfitQuestion.questionText),
    ).toBeInTheDocument();
    expect(
      screen.getByText(Config.fundingsOnboardingModal.numberOfEmployeesQuestion.questionText),
    ).toBeInTheDocument();
    await user.click(screen.getByText(Config.fundingsOnboardingModal.saveButtonText));
    expect(
      screen.getByText(Config.fundingsOnboardingModal.incompleteWarningMultipleText),
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

    await user.click(
      screen.getByText(Config.fundingsOnboardingModal.nonProfitQuestion.responses.yes),
    );
    await user.type(screen.getByRole("textbox", { name: "Existing employees" }), "2000");

    await waitFor(() => {
      selectByValue("Sector", "clean-energy");
    });
    await user.click(screen.getByText(Config.fundingsOnboardingModal.saveButtonText));
    await user.click(screen.getByTestId(`${fundings[0].id}-button`));

    expect(
      screen.queryByText(Config.fundingsOnboardingModal.incompleteWarningSingularText),
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

    await user.click(
      screen.getByText(Config.fundingsOnboardingModal.nonProfitQuestion.responses.yes),
    );
    await user.type(screen.getByRole("textbox", { name: "Existing employees" }), "2");

    await waitFor(() => {
      selectByValue("Sector", "clean-energy");
    });
    await user.click(screen.getByText(Config.fundingsOnboardingModal.saveButtonText));

    expect(screen.getByTestId(`${fundings[0].id}-button`)).toBeInTheDocument();
    expect(screen.queryByTestId(`${fundings[1].id}-button`)).not.toBeInTheDocument();
  });

  it("sorts priority fundings to top", async () => {
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
        name: "funding-1",
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
        agency: ["njeda"],
        name: "funding-2",
      }),
    ];
    renderStatefulFundingsPageComponent(business, fundings);

    await user.click(
      screen.getByText(Config.fundingsOnboardingModal.nonProfitQuestion.responses.yes),
    );
    await user.type(screen.getByRole("textbox", { name: "Existing employees" }), "2");

    await waitFor(() => {
      selectByValue("Sector", "clean-energy");
    });
    await user.click(screen.getByText(Config.fundingsOnboardingModal.saveButtonText));

    expect(screen.getByTestId(`${fundings[0].id}-button`)).toBeInTheDocument();
    expect(screen.getByTestId(`${fundings[1].id}-button`)).toBeInTheDocument();
    expect(
      screen.getByText("funding-2").compareDocumentPosition(screen.getByText("funding-1")),
    ).toBe(Node.DOCUMENT_POSITION_PRECEDING);
  });

  it("displays alert when no fundings provided", async () => {
    const user = userEvent.setup();
    const profileData = generateProfileData({ sectorId: "" });
    const business = generateBusiness({ profileData: profileData });
    const fundings: Funding[] = [];
    renderStatefulFundingsPageComponent(business, fundings);

    await user.click(
      screen.getByText(Config.fundingsOnboardingModal.nonProfitQuestion.responses.yes),
    );
    await user.type(screen.getByRole("textbox", { name: "Existing employees" }), "2");

    await waitFor(() => {
      selectByValue("Sector", "cannabis");
    });
    await user.click(screen.getByText(Config.fundingsOnboardingModal.saveButtonText));

    expect(screen.getByTestId("alert-no-results")).toBeInTheDocument();
  });

  it("filters out all njeda fundings for cannabis sector and displays alert", async () => {
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
        name: "funding-1",
      }),
      generateFunding({
        isNonprofitOnly: false,
        sector: ["cannabis"],
        employeesRequired: "n/a",
        county: ["All"],
        homeBased: "yes",
        publishStageArchive: null,
        dueDate: undefined,
        status: "rolling application",
        certifications: null,
        agency: ["njeda"],
        name: "funding-2",
      }),
    ];
    renderStatefulFundingsPageComponent(business, fundings);

    await user.click(
      screen.getByText(Config.fundingsOnboardingModal.nonProfitQuestion.responses.yes),
    );
    await user.type(screen.getByRole("textbox", { name: "Existing employees" }), "2");

    await waitFor(() => {
      selectByValue("Sector", "cannabis");
    });
    await user.click(screen.getByText(Config.fundingsOnboardingModal.saveButtonText));

    expect(screen.queryByTestId(`${fundings[0].id}-button`)).not.toBeInTheDocument();
    expect(screen.getByTestId("alert-no-results")).toBeInTheDocument();
  });
});

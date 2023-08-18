import { Header } from "@/components/Header";
import { getMergedConfig } from "@/contexts/configContext";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { ROUTES } from "@/lib/domain-logic/routes";
import { templateEval } from "@/lib/utils/helpers";
import { randomPublicFilingLegalStructure, randomTradeNameLegalStructure } from "@/test/factories";
import { withAuth } from "@/test/helpers/helpers-renderers";
import { mockPush, useMockRouter } from "@/test/mock/mockRouter";
import { useMockBusiness, useMockProfileData, useMockUserData } from "@/test/mock/mockUseUserData";
import { generateUser, getCurrentDateInNewJersey, randomInt } from "@businessnjgovnavigator/shared/";
import { createTheme, ThemeProvider } from "@mui/material";
import { fireEvent, render, screen } from "@testing-library/react";

const Config = getMergedConfig();

jest.mock("next/router", () => ({ useRouter: jest.fn() }));
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));

describe("<Header />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockBusiness({});
    useMockRouter({});
  });

  const renderHeader = (): void => {
    render(
      <ThemeProvider theme={createTheme()}>
        <Header />
      </ThemeProvider>
    );
  };

  const renderHeaderWithAuth = ({ isAuthenticated }: { isAuthenticated: IsAuthenticated }): void => {
    render(
      withAuth(
        <ThemeProvider theme={createTheme()}>
          <Header />
        </ThemeProvider>,
        {
          isAuthenticated: isAuthenticated
        }
      )
    );
  };

  it("shows date based on New Jersey Local time", () => {
    const date = getCurrentDateInNewJersey().format("MMMM DD, YYYY");
    useMockProfileData({});
    renderHeader();

    expect(screen.getByText(date)).toBeInTheDocument();
  });

  it("displays guest mode content when user is not authenticated and routes to profile page on button click", () => {
    useMockProfileData({
      businessName: "Business Name",
      legalStructureId: randomPublicFilingLegalStructure()
    });
    renderHeaderWithAuth({ isAuthenticated: IsAuthenticated.FALSE });

    fireEvent.click(screen.getByText(Config.headerDefaults.guestModeToProfileButtonText));

    expect(mockPush).toHaveBeenCalledWith(ROUTES.profile);
  });

  it("displays generic content when business name is not an empty string and user is authenticated then routes to profile page on button click", () => {
    useMockProfileData({ businessName: "", legalStructureId: randomPublicFilingLegalStructure() });
    renderHeaderWithAuth({ isAuthenticated: IsAuthenticated.TRUE });

    fireEvent.click(screen.getByText(Config.headerDefaults.genericToProfileButtonText));

    expect(mockPush).toHaveBeenCalledWith(ROUTES.profile);
  });

  it("displays generic content when trade name is undefined and user is authenticated then routes to profile page on button click", () => {
    useMockProfileData({ tradeName: undefined, legalStructureId: randomTradeNameLegalStructure() });
    renderHeaderWithAuth({ isAuthenticated: IsAuthenticated.TRUE });

    fireEvent.click(screen.getByText(Config.headerDefaults.genericToProfileButtonText));

    expect(mockPush).toHaveBeenCalledWith(ROUTES.profile);
  });

  it("displays generic content when business name is undefined and user is authenticated then routes to profile page on button click", () => {
    useMockProfileData({ businessName: undefined, legalStructureId: randomPublicFilingLegalStructure() });
    renderHeaderWithAuth({ isAuthenticated: IsAuthenticated.TRUE });

    fireEvent.click(screen.getByText(Config.headerDefaults.genericToProfileButtonText));

    expect(mockPush).toHaveBeenCalledWith(ROUTES.profile);
  });

  it("displays business name when legal structure is public filing", () => {
    const businessName = `Test Company ${randomInt(6)}`;
    useMockProfileData({
      businessName: businessName,
      tradeName: "tradeName",
      legalStructureId: randomPublicFilingLegalStructure()
    });
    renderHeaderWithAuth({ isAuthenticated: IsAuthenticated.TRUE });

    expect(screen.getByText(businessName)).toBeInTheDocument();
  });

  it("displays trade name when legal structure is trade name", () => {
    const tradeName = `Test Company ${randomInt(6)}`;
    useMockProfileData({
      businessName: "businessName",
      tradeName: tradeName,
      legalStructureId: randomTradeNameLegalStructure()
    });
    renderHeaderWithAuth({ isAuthenticated: IsAuthenticated.TRUE });
    expect(screen.getByText(tradeName)).toBeInTheDocument();
  });

  it("greets user when name is undefined", () => {
    useMockUserData({ user: generateUser({ name: undefined }) });
    renderHeader();
    expect(screen.getByText(Config.headerDefaults.noUserNameHeaderText)).toBeInTheDocument();
  });

  it("includes user full name in header", () => {
    useMockUserData({ user: generateUser({ name: "Ada Lovelace" }) });
    renderHeader();
    const expectedHeaderText = templateEval(Config.headerDefaults.defaultHeaderText, {
      name: "Ada Lovelace"
    });
    expect(screen.getByText(expectedHeaderText)).toBeInTheDocument();
  });
});

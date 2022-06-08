import { Header } from "@/components/Header";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { templateEval } from "@/lib/utils/helpers";
import { generateProfileData, generateUser } from "@/test/factories";
import { withAuth } from "@/test/helpers";
import { mockPush, useMockRouter } from "@/test/mock/mockRouter";
import { useMockProfileData, useMockUserData } from "@/test/mock/mockUseUserData";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { getCurrentDateInNewJersey, randomInt } from "@businessnjgovnavigator/shared/";
import { createTheme, ThemeProvider } from "@mui/material";
import { fireEvent, render, screen } from "@testing-library/react";

jest.mock("next/router");
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));

describe("<Header />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockUserData({});
    useMockRouter({});
  });

  const renderHeader = () => {
    render(
      <ThemeProvider theme={createTheme()}>
        <Header />
      </ThemeProvider>
    );
  };

  const renderHeaderWithAuth = ({ isAuthenticated }: { isAuthenticated: IsAuthenticated }) => {
    render(
      withAuth(
        <ThemeProvider theme={createTheme()}>
          <Header />
        </ThemeProvider>,
        {
          isAuthenticated: isAuthenticated,
        }
      )
    );
  };

  it("shows date based on New Jersey Local time", () => {
    const date = getCurrentDateInNewJersey().format("MMMM DD YYYY");
    useMockProfileData({});
    renderHeader();

    expect(screen.getByText(date)).toBeInTheDocument();
  });

  it("displays guest mode content when user is not authenicated and routes to profile page on button click", () => {
    useMockProfileData({ businessName: "Business Name" });
    renderHeaderWithAuth({ isAuthenticated: IsAuthenticated.FALSE });

    fireEvent.click(screen.getByText(Config.roadmapDefaults.guestModeToProfileButtonText));

    expect(mockPush).toHaveBeenCalledWith("/profile");
  });

  it("displays generic content when business name is not an empty string and user is authenicated then routes to profile page on button click", () => {
    useMockProfileData({ businessName: "" });
    renderHeaderWithAuth({ isAuthenticated: IsAuthenticated.TRUE });

    fireEvent.click(screen.getByText(Config.roadmapDefaults.genericToProfileButtonText));

    expect(mockPush).toHaveBeenCalledWith("/profile");
  });

  it("displays generic content when business name is undefined and user is authenicated then routes to profile page on button click", () => {
    useMockProfileData({ businessName: undefined });
    renderHeaderWithAuth({ isAuthenticated: IsAuthenticated.TRUE });

    fireEvent.click(screen.getByText(Config.roadmapDefaults.genericToProfileButtonText));

    expect(mockPush).toHaveBeenCalledWith("/profile");
  });

  it("displays business name when user is authenicated and routes to profile page on button click", () => {
    const businessName = `Test Company ${randomInt(6)}`;
    useMockProfileData({ businessName: businessName });
    renderHeaderWithAuth({ isAuthenticated: IsAuthenticated.TRUE });

    fireEvent.click(screen.getByText(businessName));

    expect(mockPush).toHaveBeenCalledWith("/profile");
  });

  it("shows template with user name as header", () => {
    useMockUserData({
      profileData: generateProfileData({
        businessName: "some business",
        industryId: "restaurant",
        legalStructureId: "c-corporation",
      }),
      user: generateUser({ name: "Ada Lovelace" }),
    });
    renderHeader();

    const expectedHeaderText = templateEval(Config.roadmapDefaults.roadmapTitleTemplateForUserName, {
      name: "Ada Lovelace",
    });
    expect(screen.getByText(expectedHeaderText)).toBeInTheDocument();
  });
});

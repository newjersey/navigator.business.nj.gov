import { NeedsAccountSnackbar } from "@/components/auth/NeedsAccountSnackbar";
import { Content } from "@/components/Content";
import { getMergedConfig } from "@/contexts/configContext";
import { ActiveUser, IsAuthenticated } from "@/lib/auth/AuthContext";
import { generateActiveUser } from "@/test/factories";
import { withAuth, withNeedsAccountContext } from "@/test/helpers/helpers-renderers";
import { markdownToText } from "@/test/helpers/helpers-utilities";
import { useMockRouter } from "@/test/mock/mockRouter";
import { useMockBusiness } from "@/test/mock/mockUseUserData";
import {
  currentBusiness,
  setupStatefulUserDataContext,
  WithStatefulUserData,
} from "@/test/mock/withStatefulUserData";
import { SIDEBAR_CARDS } from "@businessnjgovnavigator/shared/domain-logic/sidebarCards";
import { generateBusiness, generateUserData } from "@businessnjgovnavigator/shared/test";
import * as materialUi from "@mui/material";
import { useMediaQuery } from "@mui/material";
import { fireEvent, render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";

const Config = getMergedConfig();

jest.mock("@/lib/api-client/apiClient", () => ({ postSelfReg: jest.fn() }));
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));
jest.mock("next/router", () => ({ useRouter: jest.fn() }));
jest.mock("@/lib/auth/sessionHelper", () => ({ triggerSignIn: jest.fn() }));
jest.mock("@mui/material", () => mockMaterialUI());

function mockMaterialUI(): typeof materialUi {
  return {
    ...jest.requireActual("@mui/material"),
    useMediaQuery: jest.fn(),
  };
}

const setLargeScreen = (value: boolean): void => {
  (useMediaQuery as jest.Mock).mockImplementation(() => {
    return value;
  });
};

describe("<NeedsAccountSnackbar />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockRouter({});
    setupStatefulUserDataContext();
  });

  const setShowNeedsAccountSnackbar = jest.fn();

  const renderWithAuth = ({
    isAuthenticated,
    showNeedsAccountSnackbar,
  }: {
    isAuthenticated: IsAuthenticated;
    showNeedsAccountSnackbar?: boolean | undefined;
  }): void => {
    render(
      withNeedsAccountContext(
        <WithStatefulUserData initialUserData={generateUserData({})}>
          <NeedsAccountSnackbar />
        </WithStatefulUserData>,
        isAuthenticated,
        {
          showNeedsAccountSnackbar: showNeedsAccountSnackbar ?? true,
          setShowNeedsAccountSnackbar,
        }
      )
    );
  };

  const renderWithAuthAndUser = ({
    isAuthenticated,
    activeUser,
  }: {
    isAuthenticated: IsAuthenticated;
    activeUser: ActiveUser;
  }): void => {
    render(
      withAuth(
        withNeedsAccountContext(
          <WithStatefulUserData initialUserData={generateUserData({})}>
            <NeedsAccountSnackbar />
          </WithStatefulUserData>,
          isAuthenticated,
          {
            showNeedsAccountSnackbar: true,
            setShowNeedsAccountSnackbar,
          }
        ),
        { activeUser, isAuthenticated }
      )
    );
  };

  it("shows Needs Account snackbar when user is in guest mode", () => {
    renderWithAuth({ isAuthenticated: IsAuthenticated.FALSE });
    expect(
      screen.getByText(markdownToText(Config.navigationDefaults.needsAccountSnackbarTitle))
    ).toBeInTheDocument();
  });

  it("is able to close Needs Account Snackbar when user is in guest mode", () => {
    renderWithAuth({ isAuthenticated: IsAuthenticated.FALSE });
    fireEvent.click(screen.getByLabelText("close"));
    expect(setShowNeedsAccountSnackbar).toHaveBeenCalledWith(false);
  });

  it("does not show Needs Account Snackbar when showNeedsAccountSnackbar is false", () => {
    renderWithAuth({ isAuthenticated: IsAuthenticated.FALSE, showNeedsAccountSnackbar: false });
    expect(
      screen.queryByText(markdownToText(Config.navigationDefaults.needsAccountSnackbarTitle))
    ).not.toBeInTheDocument();
  });

  it("shows the not-registered card on close", () => {
    renderWithAuthAndUser({
      activeUser: generateActiveUser({ encounteredMyNjLinkingError: false }),
      isAuthenticated: IsAuthenticated.FALSE,
    });
    fireEvent.click(screen.getByLabelText("close"));
    expect(currentBusiness().preferences.visibleSidebarCards).toContain(SIDEBAR_CARDS.notRegistered);
    expect(currentBusiness().preferences.visibleSidebarCards).not.toContain(
      SIDEBAR_CARDS.notRegisteredExistingAccount
    );
  });

  it("shows the not-registered-existing-account card on close if user encounteredMyNjLinkingError=true", () => {
    renderWithAuthAndUser({
      activeUser: generateActiveUser({ encounteredMyNjLinkingError: true }),
      isAuthenticated: IsAuthenticated.FALSE,
    });
    fireEvent.click(screen.getByLabelText("close"));
    expect(currentBusiness().preferences.visibleSidebarCards).toContain(
      SIDEBAR_CARDS.notRegisteredExistingAccount
    );
    expect(currentBusiness().preferences.visibleSidebarCards).not.toContain(SIDEBAR_CARDS.notRegistered);
  });

  it("icon logo on mobile", async () => {
    setLargeScreen(false);
    renderWithAuth({ isAuthenticated: IsAuthenticated.FALSE });
    expect(screen.queryByAltText("registration")).not.toBeInTheDocument();
  });

  it("icon logo on desktop", () => {
    setLargeScreen(true);
    renderWithAuth({ isAuthenticated: IsAuthenticated.FALSE });
    expect(screen.getByAltText("registration")).toBeInTheDocument();
  });

  it("displays default content if user encounteredMyNjLinkingError is not true", () => {
    renderWithAuthAndUser({
      activeUser: generateActiveUser({ encounteredMyNjLinkingError: false }),
      isAuthenticated: IsAuthenticated.FALSE,
    });
    useMockBusiness(generateBusiness({})); // necessary for renderToStaticMarkup for Content
    expect(screen.getByTestId("self-reg-snackbar")).toContainHTML(
      renderToStaticMarkup(Content({ children: Config.navigationDefaults.needsAccountSnackbarBody }))
    );
    expect(screen.getByTestId("self-reg-snackbar")).not.toContainHTML(
      renderToStaticMarkup(
        Content({ children: Config.navigationDefaults.needsAccountSnackbarBodyExistingAccount })
      )
    );
    expect(screen.getByText(Config.navigationDefaults.needsAccountSnackbarTitle)).toBeInTheDocument();
    expect(
      screen.queryByText(Config.navigationDefaults.needsAccountSnackbarTitleExistingAccount)
    ).not.toBeInTheDocument();
  });

  it("displays existingAccount content if user encounteredMyNjLinkingError is true", () => {
    renderWithAuthAndUser({
      activeUser: generateActiveUser({ encounteredMyNjLinkingError: true }),
      isAuthenticated: IsAuthenticated.FALSE,
    });
    useMockBusiness(generateBusiness({})); // necessary for renderToStaticMarkup for Content
    expect(screen.getByTestId("self-reg-snackbar")).toContainHTML(
      renderToStaticMarkup(
        Content({ children: Config.navigationDefaults.needsAccountSnackbarBodyExistingAccount })
      )
    );
    expect(screen.getByTestId("self-reg-snackbar")).not.toContainHTML(
      renderToStaticMarkup(Content({ children: Config.navigationDefaults.needsAccountSnackbarBody }))
    );
    expect(
      screen.getByText(Config.navigationDefaults.needsAccountSnackbarTitleExistingAccount)
    ).toBeInTheDocument();
    expect(screen.queryByText(Config.navigationDefaults.needsAccountSnackbarTitle)).not.toBeInTheDocument();
  });
});

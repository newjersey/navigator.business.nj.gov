import { SignUpSnackbar } from "@/components/auth/SignUpSnackbar";
import { getMergedConfig } from "@/contexts/configContext";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { withAuthAlert } from "@/test/helpers/helpers-renderers";
import { markdownToText } from "@/test/helpers/helpers-utilities";
import { useMockRouter } from "@/test/mock/mockRouter";
import { useMockBusiness } from "@/test/mock/mockUseUserData";
import * as materialUi from "@mui/material";
import { useMediaQuery } from "@mui/material";
import { fireEvent, render, screen } from "@testing-library/react";

const Config = getMergedConfig();

jest.mock("@/lib/api-client/apiClient", () => ({ postSelfReg: jest.fn() }));
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
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

describe("SignUpSnackbar", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockRouter({});
    useMockBusiness({});
  });

  const setRegistrationAlertIsVisible = jest.fn();
  const setupHookWithAuth = (isAuthenticated: IsAuthenticated, registrationAlertIsVisible = true): void => {
    render(
      withAuthAlert(<SignUpSnackbar />, isAuthenticated, {
        registrationAlertIsVisible,
        setRegistrationAlertIsVisible,
      }),
    );
  };

  it("shows registration alert when user is in guest mode", () => {
    setupHookWithAuth(IsAuthenticated.FALSE);
    expect(screen.getByText(markdownToText(Config.navigationDefaults.guestAlertTitle))).toBeInTheDocument();
  });

  it("is able to close registration alert when user is in guest mode", () => {
    setupHookWithAuth(IsAuthenticated.FALSE);
    fireEvent.click(screen.getByLabelText("close"));
    expect(setRegistrationAlertIsVisible).toHaveBeenCalledWith(false);
  });

  it("does not show registration alert when registrationAlertIsVisible is false", () => {
    setupHookWithAuth(IsAuthenticated.FALSE, false);
    expect(
      screen.queryByText(markdownToText(Config.navigationDefaults.guestAlertTitle)),
    ).not.toBeInTheDocument();
  });

  it("does not show registration alert when user is authenticated", () => {
    setupHookWithAuth(IsAuthenticated.TRUE, false);
    expect(
      screen.queryByText(markdownToText(Config.navigationDefaults.guestAlertTitle)),
    ).not.toBeInTheDocument();
  });

  it("does not show registration alert when user is unknown", () => {
    setupHookWithAuth(IsAuthenticated.UNKNOWN, false);
    expect(
      screen.queryByText(markdownToText(Config.navigationDefaults.guestAlertTitle)),
    ).not.toBeInTheDocument();
  });

  it("icon logo on mobile", async () => {
    setLargeScreen(false);
    setupHookWithAuth(IsAuthenticated.FALSE);
    expect(screen.queryByAltText("registration")).not.toBeInTheDocument();
  });

  it("icon logo on desktop", () => {
    setLargeScreen(true);
    setupHookWithAuth(IsAuthenticated.FALSE);
    expect(screen.getByAltText("registration")).toBeInTheDocument();
  });
});

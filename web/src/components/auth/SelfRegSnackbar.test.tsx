import { SelfRegSnackbar } from "@/components/auth/SelfRegSnackbar";
import { getMergedConfig } from "@/contexts/configContext";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { withAuthAlert } from "@/test/helpers/helpers-renderers";
import { markdownToText } from "@/test/helpers/helpers-utilities";
import { useMockRouter } from "@/test/mock/mockRouter";
import { useMockBusiness } from "@/test/mock/mockUseUserData";
import { RegistrationStatus } from "@businessnjgovnavigator/shared/";
import { render, screen } from "@testing-library/react";

const Config = getMergedConfig();

jest.mock("next/router", () => ({ useRouter: jest.fn() }));
jest.mock("@/lib/api-client/apiClient", () => ({ postSelfReg: jest.fn() }));
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/auth/sessionHelper", () => ({ triggerSignIn: jest.fn() }));

describe("SelfRegSnackbar", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockRouter({});
    useMockBusiness({});
  });

  const setRegistrationAlertStatus = jest.fn();
  const setupHookWithAuth = (
    isAuthenticated: IsAuthenticated,
    registrationAlertStatus: RegistrationStatus,
  ): void => {
    render(
      withAuthAlert(<SelfRegSnackbar />, isAuthenticated, {
        registrationAlertStatus,
        setRegistrationAlertStatus,
      }),
    );
  };

  it("updates registration status when user is authenticated and had completed the registration process", () => {
    setupHookWithAuth(IsAuthenticated.TRUE, "IN_PROGRESS");
    expect(setRegistrationAlertStatus).toHaveBeenCalledWith("SUCCESS");
  });

  it("shows registration success snackbar when user is authenticated and had completed the registration process", () => {
    setupHookWithAuth(IsAuthenticated.TRUE, "SUCCESS");
    expect(screen.getByText(markdownToText(Config.navigationDefaults.guestSuccessBody))).toBeInTheDocument();
    expect(screen.getByText(markdownToText(Config.navigationDefaults.guestSuccessTitle))).toBeInTheDocument();
    expect(screen.getByTestId("congratulations-logo")).toBeInTheDocument();
    expect(screen.getByTestId("reg-snackbar")).toBeInTheDocument();
  });

  it("does not show registration success snackbar when user is not authenticated and had not completed the registration process", () => {
    setupHookWithAuth(IsAuthenticated.FALSE, "IN_PROGRESS");
    expect(screen.queryByTestId("reg-snackbar")).not.toBeInTheDocument();
  });

  it("shows duplicate registration error snackbar alert when user had failed the registration process", () => {
    setupHookWithAuth(IsAuthenticated.FALSE, "DUPLICATE_ERROR");
    expect(
      screen.getByText(markdownToText(Config.selfRegistration.errorTextDuplicateSignUp)),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(markdownToText(Config.navigationDefaults.guestSuccessTitle)),
    ).not.toBeInTheDocument();
    expect(screen.queryByTestId("congratulations-logo")).not.toBeInTheDocument();
  });

  it("shows general registration error snackbar alert when user had failed the registration process", () => {
    setupHookWithAuth(IsAuthenticated.FALSE, "RESPONSE_ERROR");
    expect(screen.getByText(markdownToText(Config.selfRegistration.errorTextGeneric))).toBeInTheDocument();
    expect(
      screen.queryByText(markdownToText(Config.navigationDefaults.guestSuccessTitle)),
    ).not.toBeInTheDocument();
    expect(screen.queryByTestId("congratulations-logo")).not.toBeInTheDocument();
  });
});

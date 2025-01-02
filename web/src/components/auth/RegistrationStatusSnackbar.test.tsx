import { RegistrationStatusSnackbar } from "@/components/auth/RegistrationStatusSnackbar";
import { getMergedConfig } from "@/contexts/configContext";
import { ActiveUser, IsAuthenticated } from "@/lib/auth/AuthContext";
import { generateActiveUser } from "@/test/factories";
import { withAuth, withNeedsAccountContext } from "@/test/helpers/helpers-renderers";
import { markdownToText } from "@/test/helpers/helpers-utilities";
import { useMockRouter } from "@/test/mock/mockRouter";
import { useMockBusiness } from "@/test/mock/mockUseUserData";
import { RegistrationStatus } from "@businessnjgovnavigator/shared/";
import { render, screen } from "@testing-library/react";

const Config = getMergedConfig();

vi.mock("next/compat/router", () => ({ useRouter: vi.fn() }));
vi.mock("@/lib/api-client/apiClient", () => ({ postSelfReg: vi.fn() }));
vi.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: vi.fn() }));

describe("<RegistrationStatusSnackbar />", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    useMockRouter({});
    useMockBusiness({});
  });

  const setRegistrationStatus = vi.fn();

  const setupHookWithAuth = ({
    isAuthenticated,
    registrationStatus,
  }: {
    isAuthenticated: IsAuthenticated;
    registrationStatus: RegistrationStatus;
  }): void => {
    render(
      withNeedsAccountContext(<RegistrationStatusSnackbar />, isAuthenticated, {
        registrationStatus,
        setRegistrationStatus,
      })
    );
  };

  const setupHookWithAuthAndUser = ({
    isAuthenticated,
    activeUser,
  }: {
    isAuthenticated: IsAuthenticated;
    activeUser: ActiveUser;
  }): void => {
    render(
      withAuth(
        withNeedsAccountContext(<RegistrationStatusSnackbar />, isAuthenticated, {
          registrationStatus: "SUCCESS",
          setRegistrationStatus,
        }),
        { activeUser, isAuthenticated }
      )
    );
  };

  it("updates registration status when user is authenticated and had completed the registration process", () => {
    setupHookWithAuth({ isAuthenticated: IsAuthenticated.TRUE, registrationStatus: "IN_PROGRESS" });
    expect(setRegistrationStatus).toHaveBeenCalledWith("SUCCESS");
  });

  it("shows registration success snackbar when user is authenticated and had completed the registration process", () => {
    setupHookWithAuth({ isAuthenticated: IsAuthenticated.TRUE, registrationStatus: "SUCCESS" });
    expect(
      screen.getByText(markdownToText(Config.selfRegistration.accountSuccessSnackbarBody))
    ).toBeInTheDocument();
    expect(
      screen.getByText(markdownToText(Config.selfRegistration.accountSuccessSnackbarTitle))
    ).toBeInTheDocument();
    expect(screen.getByTestId("congratulations-logo")).toBeInTheDocument();
    expect(screen.getByTestId("reg-snackbar")).toBeInTheDocument();
  });

  it("does not show registration success snackbar when user is not authenticated and had not completed the registration process", () => {
    setupHookWithAuth({ isAuthenticated: IsAuthenticated.FALSE, registrationStatus: "IN_PROGRESS" });
    expect(screen.queryByTestId("reg-snackbar")).not.toBeInTheDocument();
  });

  it("shows duplicate registration error snackbar alert when user had failed the registration process", () => {
    setupHookWithAuth({ isAuthenticated: IsAuthenticated.FALSE, registrationStatus: "DUPLICATE_ERROR" });
    expect(
      screen.getByText(markdownToText(Config.selfRegistration.errorTextDuplicateSignUp))
    ).toBeInTheDocument();
    expect(
      screen.queryByText(markdownToText(Config.selfRegistration.accountSuccessSnackbarTitle))
    ).not.toBeInTheDocument();
    expect(screen.queryByTestId("congratulations-logo")).not.toBeInTheDocument();
  });

  it("shows general registration error snackbar alert when user had failed the registration process", () => {
    setupHookWithAuth({ isAuthenticated: IsAuthenticated.FALSE, registrationStatus: "RESPONSE_ERROR" });
    expect(screen.getByText(markdownToText(Config.selfRegistration.errorTextGeneric))).toBeInTheDocument();
    expect(
      screen.queryByText(markdownToText(Config.selfRegistration.accountSuccessSnackbarTitle))
    ).not.toBeInTheDocument();
    expect(screen.queryByTestId("congratulations-logo")).not.toBeInTheDocument();
  });

  it("displays default content if user encounteredMyNjLinkingError is not true", () => {
    setupHookWithAuthAndUser({
      activeUser: generateActiveUser({ encounteredMyNjLinkingError: false }),
      isAuthenticated: IsAuthenticated.TRUE,
    });
    expect(screen.getByText(Config.selfRegistration.accountSuccessSnackbarTitle)).toBeInTheDocument();
    expect(
      screen.queryByText(Config.selfRegistration.accountSuccessSnackbarTitleExistingAccount)
    ).not.toBeInTheDocument();
  });

  it("displays existingAccount content if user encounteredMyNjLinkingError is true", () => {
    setupHookWithAuthAndUser({
      activeUser: generateActiveUser({ encounteredMyNjLinkingError: true }),
      isAuthenticated: IsAuthenticated.TRUE,
    });
    expect(
      screen.getByText(Config.selfRegistration.accountSuccessSnackbarTitleExistingAccount)
    ).toBeInTheDocument();
    expect(screen.queryByText(Config.selfRegistration.accountSuccessSnackbarTitle)).not.toBeInTheDocument();
  });
});

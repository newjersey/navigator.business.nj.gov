import { getMergedConfig } from "@/contexts/configContext";
import * as api from "@/lib/api-client/apiClient";
import { ActiveUser, IsAuthenticated } from "@/lib/auth/AuthContext";
import * as signinHelper from "@/lib/auth/signinHelper";
import { ROUTES } from "@/lib/domain-logic/routes";
import analytics from "@/lib/utils/analytics";
import AccountSetupPage from "@/pages/account-setup";
import { generateActiveUser } from "@/test/factories";
import { withAuth, withNeedsAccountContext } from "@/test/helpers/helpers-renderers";
import { mockPush, useMockRouter } from "@/test/mock/mockRouter";
import { useMockUserData } from "@/test/mock/mockUseUserData";
import {
  currentUserData,
  setupStatefulUserDataContext,
  WithStatefulUserData,
} from "@/test/mock/withStatefulUserData";
import { createPageHelpers, PageHelpers } from "@/test/pages/onboarding/helpers-onboarding";
import { createEmptyUser, RegistrationStatus } from "@businessnjgovnavigator/shared/businessUser";
import { generateUser, generateUserData } from "@businessnjgovnavigator/shared/test";
import { UserData } from "@businessnjgovnavigator/shared/userData";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";

const Config = getMergedConfig();

function setupMockAnalytics(): typeof analytics {
  return {
    ...vi.requireActual("@/lib/utils/analytics").default,
    event: {
      ...vi.requireActual("@/lib/utils/analytics").default.event,
      finish_setup_on_myNewJersey_button: {
        submit: {
          go_to_myNJ_registration: vi.fn(),
        },
      },
      guest_snackbar: {
        click: {
          go_to_NavigatorAccount_setup: vi.fn(),
        },
      },
    },
  };
}

vi.mock("@/lib/api-client/apiClient", () => ({
  postNewsletter: vi.fn(),
  postUserTesting: vi.fn(),
}));
vi.mock("@/lib/auth/signinHelper", () => ({ onSelfRegister: vi.fn() }));
vi.mock("@/lib/utils/analytics", () => setupMockAnalytics());
vi.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: vi.fn() }));
vi.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: vi.fn() }));
vi.mock("next/compat/router", () => ({ useRouter: vi.fn() }));

const mockApi = api as vi.Mocked<typeof api>;
const mockSigninHelper = signinHelper as vi.Mocked<typeof signinHelper>;
const mockAnalytics = analytics as vi.Mocked<typeof analytics>;

describe("Account Setup page", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    useMockRouter({});
    setupStatefulUserDataContext();

    mockApi.postNewsletter.mockImplementation((request) => {
      return Promise.resolve({
        ...request,
        user: {
          ...request.user,
          externalStatus: {
            ...request.user.externalStatus,
            newsletter: { status: "SUCCESS", success: true },
          },
        },
      });
    });

    mockApi.postUserTesting.mockImplementation((request) => {
      return Promise.resolve({
        ...request,
        user: {
          ...request.user,
          externalStatus: {
            ...request.user.externalStatus,
            userTesting: { status: "SUCCESS", success: true },
          },
        },
      });
    });
  });

  const emptyUser = createEmptyUser();
  const renderPage = ({
    userData,
    isAuthenticated,
    activeUser,
  }: {
    userData?: UserData | null;
    isAuthenticated?: IsAuthenticated;
    activeUser?: ActiveUser;
  }): { page: PageHelpers } => {
    const initialUserData = { ...(userData || generateUserData({})), user: emptyUser };
    render(
      withAuth(
        <WithStatefulUserData initialUserData={initialUserData}>
          <AccountSetupPage />
        </WithStatefulUserData>,
        { activeUser: activeUser, isAuthenticated }
      )
    );
    const page = createPageHelpers();
    return { page };
  };

  const renderNeedsAccountContextPage = ({
    userData,
    registrationStatus,
    isAuthenticated,
  }: {
    userData?: UserData | null;
    isAuthenticated?: IsAuthenticated;
    registrationStatus?: RegistrationStatus | undefined;
  }): void => {
    const initialUserData = { ...(userData || generateUserData({})), user: emptyUser };
    render(
      withNeedsAccountContext(
        <WithStatefulUserData initialUserData={initialUserData}>
          <AccountSetupPage />
        </WithStatefulUserData>,
        isAuthenticated ?? IsAuthenticated.FALSE,
        { registrationStatus }
      )
    );
  };

  const clickSubmit = (): void => {
    fireEvent.click(screen.getByTestId("mynj-submit"));
  };

  it("redirects to dashboard if user is authenticated", () => {
    renderPage({ isAuthenticated: IsAuthenticated.TRUE });
    expect(mockPush).toHaveBeenCalledWith(ROUTES.dashboard);
  });

  it("sets user info from userData if exists", () => {
    useMockUserData(generateUserData({ user: generateUser({ name: "Firsty Lasty" }) }));
    const { page } = renderPage({ isAuthenticated: IsAuthenticated.FALSE });
    expect(page.getFullNameValue()).toEqual("Firsty Lasty");
  });

  it("displays default content if user encounteredMyNjLinkingError is not true", () => {
    renderPage({
      activeUser: generateActiveUser({ encounteredMyNjLinkingError: false }),
      isAuthenticated: IsAuthenticated.FALSE,
    });
    expect(screen.getByText(Config.accountSetup.default.header)).toBeInTheDocument();
    expect(screen.getByText(Config.accountSetup.default.submitButton)).toBeInTheDocument();
  });

  it("displays existingAccount content if user encounteredMyNjLinkingError is true", () => {
    renderPage({
      activeUser: generateActiveUser({ encounteredMyNjLinkingError: true }),
      isAuthenticated: IsAuthenticated.FALSE,
    });
    expect(screen.getByText(Config.accountSetup.existingAccount.header)).toBeInTheDocument();
    expect(screen.getByText(Config.accountSetup.existingAccount.submitButton)).toBeInTheDocument();
  });

  it("prevents user from registering if the email is not matching", () => {
    const { page } = renderPage({ isAuthenticated: IsAuthenticated.FALSE });
    page.fillText(Config.selfRegistration.nameFieldLabel, "My Name");
    page.fillText(Config.selfRegistration.emailFieldLabel, "email@example.com");
    page.fillText(Config.selfRegistration.confirmEmailFieldLabel, "email@example.co");
    act(() => {
      return clickSubmit();
    });
    expect(screen.queryAllByText(Config.selfRegistration.errorTextEmailsNotMatching).length).toEqual(2);
  });

  it("prevents user from registering if the email is not matching after changing it", () => {
    const { page } = renderPage({ isAuthenticated: IsAuthenticated.FALSE });
    page.fillText(Config.selfRegistration.nameFieldLabel, "My Name");
    page.fillText(Config.selfRegistration.emailFieldLabel, "email@example.com");
    page.fillText(Config.selfRegistration.confirmEmailFieldLabel, "email@example.com");
    page.fillText(Config.selfRegistration.emailFieldLabel, "email@example.co");
    act(() => {
      return clickSubmit();
    });
    expect(screen.queryAllByText(Config.selfRegistration.errorTextEmailsNotMatching).length).toEqual(2);
  });

  it("prevents user from registering if the name is empty", () => {
    const { page } = renderPage({ isAuthenticated: IsAuthenticated.FALSE });
    page.fillText(Config.selfRegistration.nameFieldLabel, "");
    page.fillText(Config.selfRegistration.emailFieldLabel, "email@example.com");
    page.fillText(Config.selfRegistration.confirmEmailFieldLabel, "email@example.com");
    act(() => {
      return clickSubmit();
    });
    expect(screen.getByText(Config.selfRegistration.errorTextFullName)).toBeInTheDocument();
  });

  it("prevents user from registering if the name contains a special character", () => {
    const { page } = renderPage({ isAuthenticated: IsAuthenticated.FALSE });
    page.fillText(Config.selfRegistration.nameFieldLabel, "Some & Name");
    page.fillText(Config.selfRegistration.emailFieldLabel, "email@example.com");
    page.fillText(Config.selfRegistration.confirmEmailFieldLabel, "email@example.com");
    act(() => {
      return clickSubmit();
    });
    expect(screen.getByText(Config.selfRegistration.errorTextFullNameSpecialCharacter)).toBeInTheDocument();
  });

  it("prevents user from registering if the name is greater than 50 characters", () => {
    const { page } = renderPage({ isAuthenticated: IsAuthenticated.FALSE });
    const name = Array(51).fill("a").join("");
    page.fillText(Config.selfRegistration.nameFieldLabel, name);
    page.fillText(Config.selfRegistration.emailFieldLabel, "email@example.com");
    page.fillText(Config.selfRegistration.confirmEmailFieldLabel, "email@example.com");
    act(() => {
      return clickSubmit();
    });
    expect(screen.getByText(Config.selfRegistration.errorTextFullNameLength)).toBeInTheDocument();
  });

  it("prevents user from registering if the name does not start with a letter", () => {
    const { page } = renderPage({ isAuthenticated: IsAuthenticated.FALSE });
    page.fillText(Config.selfRegistration.nameFieldLabel, "12345");
    page.fillText(Config.selfRegistration.emailFieldLabel, "email@example.com");
    page.fillText(Config.selfRegistration.confirmEmailFieldLabel, "email@example.com");
    act(() => {
      return clickSubmit();
    });
    expect(screen.getByText(Config.selfRegistration.errorTextFullNameStartWithLetter)).toBeInTheDocument();
  });

  it("prevents user from registering if the email is empty", () => {
    const { page } = renderPage({ isAuthenticated: IsAuthenticated.FALSE });
    page.fillText(Config.selfRegistration.nameFieldLabel, "My Name");
    page.fillText(Config.selfRegistration.emailFieldLabel, "");
    page.fillText(Config.selfRegistration.confirmEmailFieldLabel, "");
    act(() => {
      return clickSubmit();
    });
    expect(screen.getAllByText(Config.selfRegistration.errorTextEmailsNotMatching).length).toEqual(2);
  });

  it("displays error message when @ is missing in email input field", async () => {
    const { page } = renderPage({ isAuthenticated: IsAuthenticated.FALSE });
    page.fillText(Config.selfRegistration.nameFieldLabel, "My Name");
    page.fillText(Config.selfRegistration.emailFieldLabel, "some-emailexample.com");
    act(() => {
      return clickSubmit();
    });
    expect(screen.getAllByText(Config.selfRegistration.errorTextEmailsNotMatching).length).toEqual(2);
  });

  it("displays error message when . is missing in email input field", async () => {
    const { page } = renderPage({ isAuthenticated: IsAuthenticated.FALSE });
    page.fillText(Config.selfRegistration.nameFieldLabel, "My Name");
    page.fillText(Config.selfRegistration.emailFieldLabel, "some-email@examplecom");
    act(() => {
      return clickSubmit();
    });
    expect(screen.getAllByText(Config.selfRegistration.errorTextEmailsNotMatching).length).toEqual(2);
  });

  it("allows a user to uncheck to opt out of newsletter", async () => {
    const { page } = renderPage({ isAuthenticated: IsAuthenticated.FALSE });
    page.fillText(Config.selfRegistration.nameFieldLabel, "My Name");
    page.fillText(Config.selfRegistration.emailFieldLabel, "email@example.com");
    page.fillText(Config.selfRegistration.confirmEmailFieldLabel, "email@example.com");
    fireEvent.click(screen.getByLabelText(Config.selfRegistration.newsletterCheckboxLabel));
    act(() => {
      return clickSubmit();
    });
    const businessUser = {
      ...emptyUser,
      email: "email@example.com",
      name: "My Name",
      receiveNewsletter: false,
      userTesting: true,
      externalStatus: { userTesting: { status: "SUCCESS", success: true } },
    };

    await waitFor(() => {
      expect(currentUserData().user).toEqual(businessUser);
    });
  });

  it("shows email already registered inline error when receiving the registrationStatus as DUPLICATE_ERROR", () => {
    renderNeedsAccountContextPage({
      isAuthenticated: IsAuthenticated.FALSE,
      registrationStatus: "DUPLICATE_ERROR",
    });

    expect(screen.getByText(Config.selfRegistration.errorTextDuplicateSignUp)).toBeInTheDocument();
  });

  it("allows a user to uncheck to opt out of user testing", async () => {
    const { page } = renderPage({ isAuthenticated: IsAuthenticated.FALSE });
    page.fillText(Config.selfRegistration.nameFieldLabel, "My Name");
    page.fillText(Config.selfRegistration.emailFieldLabel, "email@example.com");
    page.fillText(Config.selfRegistration.confirmEmailFieldLabel, "email@example.com");
    fireEvent.click(screen.getByLabelText(Config.selfRegistration.userTestingCheckboxLabel));
    act(() => {
      return clickSubmit();
    });
    const businessUser = {
      ...emptyUser,
      email: "email@example.com",
      name: "My Name",
      receiveNewsletter: true,
      userTesting: false,
      externalStatus: { newsletter: { status: "SUCCESS", success: true } },
    };

    await waitFor(() => {
      expect(currentUserData().user).toEqual(businessUser);
    });
  });

  it("posts to api self-reg after completion", async () => {
    const { page } = renderPage({ isAuthenticated: IsAuthenticated.FALSE });
    page.fillText(Config.selfRegistration.nameFieldLabel, "My Name");
    page.fillText(Config.selfRegistration.emailFieldLabel, "email@example.com");
    page.fillText(Config.selfRegistration.confirmEmailFieldLabel, "email@example.com");
    act(() => {
      return clickSubmit();
    });
    const businessUser = {
      ...emptyUser,
      email: "email@example.com",
      name: "My Name",
      receiveNewsletter: true,
      userTesting: true,
      externalStatus: {
        newsletter: { status: "SUCCESS", success: true },
        userTesting: { status: "SUCCESS", success: true },
      },
    };
    await waitFor(() => {
      expect(currentUserData().user).toEqual(businessUser);
    });

    expect(mockSigninHelper.onSelfRegister).toHaveBeenCalled();
    expect(
      mockAnalytics.event.finish_setup_on_myNewJersey_button.submit.go_to_myNJ_registration
    ).toHaveBeenCalled();
  });

  it("uses source query param as analytics event", () => {
    useMockRouter({ isReady: true, query: { source: "guest_snackbar" } });
    renderPage({ isAuthenticated: IsAuthenticated.FALSE });
    expect(mockAnalytics.event.guest_snackbar.click.go_to_NavigatorAccount_setup).toHaveBeenCalled();
  });
});

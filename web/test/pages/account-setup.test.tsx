import { getMergedConfig } from "@/contexts/configContext";
import * as api from "@/lib/api-client/apiClient";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import * as signinHelper from "@/lib/auth/signinHelper";
import { ROUTES } from "@/lib/domain-logic/routes";
import analytics from "@/lib/utils/analytics";
import AccountSetupPage from "@/pages/account-setup";
import { withAuth } from "@/test/helpers/helpers-renderers";
import { mockPush, useMockRouter } from "@/test/mock/mockRouter";
import {
  currentUserData,
  setupStatefulUserDataContext,
  WithStatefulUserData
} from "@/test/mock/withStatefulUserData";
import { createPageHelpers, PageHelpers } from "@/test/pages/onboarding/helpers-onboarding";
import { createEmptyUser } from "@businessnjgovnavigator/shared/businessUser";
import { generateUserData } from "@businessnjgovnavigator/shared/test";
import { UserData } from "@businessnjgovnavigator/shared/userData";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";

const Config = getMergedConfig();

function setupMockAnalytics(): typeof analytics {
  return {
    ...jest.requireActual("@/lib/utils/analytics").default,
    event: {
      ...jest.requireActual("@/lib/utils/analytics").default.event,
      finish_setup_on_myNewJersey_button: {
        submit: {
          go_to_myNJ_registration: jest.fn()
        }
      },
      guest_snackbar: {
        click: {
          go_to_NavigatorAccount_setup: jest.fn()
        }
      }
    }
  };
}

jest.mock("@/lib/api-client/apiClient", () => ({
  postNewsletter: jest.fn(),
  postUserTesting: jest.fn()
}));
jest.mock("@/lib/auth/signinHelper", () => ({ onSelfRegister: jest.fn() }));
jest.mock("@/lib/utils/analytics", () => setupMockAnalytics());
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));
jest.mock("next/router", () => ({ useRouter: jest.fn() }));

const mockApi = api as jest.Mocked<typeof api>;
const mockSigninHelper = signinHelper as jest.Mocked<typeof signinHelper>;
const mockAnalytics = analytics as jest.Mocked<typeof analytics>;

describe("Account Setup page", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockRouter({});
    setupStatefulUserDataContext();

    mockApi.postNewsletter.mockImplementation((request) => {
      return Promise.resolve({
        ...request,
        user: {
          ...request.user,
          externalStatus: {
            ...request.user.externalStatus,
            newsletter: { status: "SUCCESS", success: true }
          }
        }
      });
    });

    mockApi.postUserTesting.mockImplementation((request) => {
      return Promise.resolve({
        ...request,
        user: {
          ...request.user,
          externalStatus: {
            ...request.user.externalStatus,
            userTesting: { status: "SUCCESS", success: true }
          }
        }
      });
    });
  });

  const emptyUser = createEmptyUser();
  const renderPage = ({
    userData,
    isAuthenticated
  }: {
    userData?: UserData | null;
    isAuthenticated?: IsAuthenticated;
  }): { page: PageHelpers } => {
    const initialUserData = { ...(userData || generateUserData({})), user: emptyUser };
    render(
      withAuth(
        <WithStatefulUserData initialUserData={initialUserData}>
          <AccountSetupPage />
        </WithStatefulUserData>,
        { user: emptyUser, isAuthenticated }
      )
    );
    const page = createPageHelpers();
    return { page };
  };

  const clickSubmit = (): void => {
    fireEvent.click(screen.getByTestId("mynj-submit"));
  };

  it("redirects to dashboard if user is authenticated", () => {
    renderPage({ isAuthenticated: IsAuthenticated.TRUE });
    expect(mockPush).toHaveBeenCalledWith(ROUTES.dashboard);
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
      externalStatus: { userTesting: { status: "SUCCESS", success: true } }
    };

    await waitFor(() => {
      expect(currentUserData().user).toEqual(businessUser);
    });
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
      externalStatus: { newsletter: { status: "SUCCESS", success: true } }
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
        userTesting: { status: "SUCCESS", success: true }
      }
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

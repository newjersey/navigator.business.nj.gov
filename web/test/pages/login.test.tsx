import { AuthContext, initialState } from "@/contexts/authContext";
import { authReducer } from "@/lib/auth/AuthContext";
import * as session from "@/lib/auth/sessionHelper";
import { ROUTES } from "@/lib/domain-logic/routes";
import LoginPage from "@/pages/login";
import { generateActiveUser } from "@/test/factories";
import { mockPush, useMockRouter } from "@/test/mock/mockRouter";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useReducer, type ReactNode } from "react";
import analytics from "@/lib/utils/analytics";

function setupMockAnalytics(): typeof analytics {
  return {
    ...jest.requireActual("@/lib/utils/analytics").default,
    event: {
      ...jest.requireActual("@/lib/utils/analytics").default.event,
      check_account_help_button: {
        click: {
          open_live_chat: jest.fn(),
        },
      },
    },
  };
}

jest.mock("next/compat/router", () => ({ useRouter: jest.fn() }));
jest.mock("@/lib/auth/sessionHelper", () => ({
  getActiveUser: jest.fn(),
}));
jest.mock("@/lib/utils/analytics", () => setupMockAnalytics());

const mockSession = session as jest.Mocked<typeof session>;
const mockAnalytics = analytics as jest.Mocked<typeof analytics>;

const AuthContextWrapper = ({ children }: { children: ReactNode }): ReactNode => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  return <AuthContext.Provider value={{ state, dispatch }}>{children}</AuthContext.Provider>;
};

describe("login page", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockRouter({ isReady: true });
  });

  it("redirects to the dashboard if the user is already logged in", async () => {
    const activeUser = generateActiveUser({});
    mockSession.getActiveUser.mockResolvedValue(activeUser);

    render(
      <AuthContextWrapper>
        <LoginPage />
      </AuthContextWrapper>,
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(ROUTES.dashboard);
    });
  });

  it("renders the login form for any unauthenticated users", () => {
    mockSession.getActiveUser.mockRejectedValue("No current user");

    render(
      <AuthContextWrapper>
        <LoginPage />
      </AuthContextWrapper>,
    );

    expect(mockPush).not.toHaveBeenCalled();
    expect(screen.getByText("Log In to Your Account")).toBeInTheDocument();
  });

  it("fires analytics event when chat with a Business Expert button is clicked", () => {
    mockSession.getActiveUser.mockRejectedValue("No current user");

    render(
      <AuthContextWrapper>
        <LoginPage />
      </AuthContextWrapper>,
    );

    const chatButton = screen.getByText("chat with a Business Expert");
    fireEvent.click(chatButton);

    expect(
      mockAnalytics.event.check_account_help_button.click.open_live_chat,
    ).toHaveBeenCalledTimes(1);
  });
});

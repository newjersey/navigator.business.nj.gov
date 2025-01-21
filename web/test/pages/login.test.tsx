import { AuthContext, initialState } from "@/contexts/authContext";
import { authReducer } from "@/lib/auth/AuthContext";
import * as session from "@/lib/auth/sessionHelper";
import { ROUTES } from "@/lib/domain-logic/routes";
import LoginPage from "@/pages/login";
import { generateActiveUser } from "@/test/factories";
import { mockPush, useMockRouter } from "@/test/mock/mockRouter";
import { render, screen, waitFor } from "@testing-library/react";
import { useReducer, type ReactNode } from "react";

jest.mock("next/compat/router", () => ({ useRouter: jest.fn() }));
jest.mock("@/lib/auth/sessionHelper", () => ({
  getActiveUser: jest.fn(),
}));

const mockSession = session as jest.Mocked<typeof session>;

const AuthContextWrapper = ({ children }: { children: ReactNode }): ReactNode => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  return <AuthContext.Provider value={{ state, dispatch }}>{children}</AuthContext.Provider>;
};

describe("login page", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockRouter({});
  });

  it("redirects to the dashboard if the user is already logged in", async () => {
    const activeUser = generateActiveUser({});
    mockSession.getActiveUser.mockResolvedValue(activeUser);

    render(
      <AuthContextWrapper>
        <LoginPage />
      </AuthContextWrapper>
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(ROUTES.dashboard);
    });
  });

  it("renders the login form for any unauthenticated users", () => {
    mockSession.getActiveUser.mockResolvedValue(Promise.reject("No current user"));

    render(
      <AuthContextWrapper>
        <LoginPage />
      </AuthContextWrapper>
    );

    expect(mockPush).not.toHaveBeenCalled();
    expect(screen.getByText("Log in to Business.NJ.gov")).toBeInTheDocument();
  });
});

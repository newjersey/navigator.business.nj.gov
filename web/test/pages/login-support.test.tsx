import { AuthContext, initialState } from "@/contexts/authContext";
import { authReducer, AuthState, IsAuthenticated } from "@/lib/auth/AuthContext";
import * as session from "@/lib/auth/sessionHelper";
import LoginSupportPage from "@/pages/support/login";
import { generateActiveUser } from "@/test/factories";
import { ConfigContext, getMergedConfig } from "@businessnjgovnavigator/shared/contexts";
import { render, screen, waitFor } from "@testing-library/react";
import { useReducer, type ReactNode } from "react";

jest.mock("@/lib/auth/sessionHelper", () => ({
  getActiveUser: jest.fn(),
}));

const mockSession = session as jest.Mocked<typeof session>;
const Config = getMergedConfig();

const AuthContextWrapper = ({
  children,
  authState = initialState,
}: {
  children: ReactNode;
  authState?: AuthState;
}): ReactNode => {
  const [state, dispatch] = useReducer(authReducer, authState);
  return (
    <ConfigContext.Provider value={{ config: Config, setOverrides: jest.fn() }}>
      <AuthContext.Provider value={{ state, dispatch }}>{children}</AuthContext.Provider>
    </ConfigContext.Provider>
  );
};

describe("login support page", () => {
  it("shows the logout message and hides 'Log in' if a user is authenticated", async () => {
    const activeUser = generateActiveUser({});
    mockSession.getActiveUser.mockResolvedValue(activeUser);

    render(
      <AuthContextWrapper
        authState={{
          activeUser,
          isAuthenticated: IsAuthenticated.TRUE,
        }}
      >
        <LoginSupportPage />
      </AuthContextWrapper>,
    );

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "log out" })).toBeInTheDocument();
    });
    expect(screen.queryByRole("button", { name: "Log in" })).not.toBeInTheDocument();
  });

  it("hides the logout message and shows 'Log in' if a user is unauthenticated", async () => {
    render(
      <AuthContextWrapper>
        <LoginSupportPage />
      </AuthContextWrapper>,
    );

    await waitFor(() => {
      const loginButtons = screen.getAllByRole("button", { name: "Log in" });
      expect(loginButtons.length).toBeGreaterThan(0);
    });
    expect(screen.queryByRole("button", { name: "log out" })).not.toBeInTheDocument();
    const loginButtons = screen.getAllByRole("button", { name: "Log in" });
    // "Log in" nav button has different mobile/desktop components, hence expecting 2
    expect(loginButtons).toHaveLength(2);
  });
});

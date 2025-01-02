import * as session from "@/lib/auth/sessionHelper";
import { ROUTES } from "@/lib/domain-logic/routes";
import LoginPage from "@/pages/login";
import { generateActiveUser } from "@/test/factories";
import { mockPush, useMockRouter } from "@/test/mock/mockRouter";
import { render, waitFor } from "@testing-library/react";

vi.mock("next/compat/router", () => ({ useRouter: vi.fn() }));
vi.mock("@/lib/auth/sessionHelper", () => ({
  getActiveUser: vi.fn(),
}));

const mockSession = session as vi.Mocked<typeof session>;

describe("login page", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    useMockRouter({});
  });

  it("redirects to the dashboard if the user is already logged in", async () => {
    const activeUser = generateActiveUser({});
    mockSession.getActiveUser.mockResolvedValue(activeUser);

    render(<LoginPage />);

    await waitFor(async () => {
      expect(mockPush).toHaveBeenCalledWith(ROUTES.dashboard);
    });
  });

  it("renders the login form for any unauthenticated users", () => {
    mockSession.getActiveUser.mockResolvedValue(Promise.reject("No current user"));

    render(<LoginPage />);
    expect(mockPush).not.toHaveBeenCalled();
  });
});

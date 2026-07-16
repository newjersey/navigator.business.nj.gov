import { renderWithUserData } from "@/test/render/renderWithUserData";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { ROUTES } from "@/lib/domain-logic/routes";
import RoadmapPage from "@/pages/roadmap";
import { withAuth } from "@/test/helpers/helpers-renderers";
import { mockPush, useMockRouter } from "@/test/mock/mockRouter";

jest.mock("next/compat/router", () => ({ useRouter: jest.fn() }));

describe("roadmap", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockRouter({ isReady: true });
  });

  it("redirects signed-in users to the dashboard page", () => {
    renderWithUserData(withAuth(<RoadmapPage />, { isAuthenticated: IsAuthenticated.TRUE }));
    expect(mockPush).toHaveBeenCalledWith(ROUTES.dashboard);
  });

  it("redirects non-signed-in users to the landing page", () => {
    renderWithUserData(withAuth(<RoadmapPage />, { isAuthenticated: IsAuthenticated.FALSE }));
    expect(mockPush).toHaveBeenCalledWith(ROUTES.landing);
  });

  it("does not redirect for unknown auth users", () => {
    renderWithUserData(withAuth(<RoadmapPage />, { isAuthenticated: IsAuthenticated.UNKNOWN }));
    expect(mockPush).not.toHaveBeenCalled();
  });
});

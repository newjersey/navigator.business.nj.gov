import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { ROUTES } from "@/lib/domain-logic/routes";
import RoadmapPage from "@/pages/roadmap";
import { withAuth } from "@/test/helpers/helpers-renderers";
import { mockPush, useMockRouter } from "@/test/mock/mockRouter";
import { render } from "@testing-library/react";

jest.mock("next/compat/router", () => ({ useRouter: jest.fn() }));

describe("roadmap", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockRouter({});
  });

  it("redirects signed-in users to the dashboard page", () => {
    render(withAuth(<RoadmapPage />, { isAuthenticated: IsAuthenticated.TRUE }));
    expect(mockPush).toHaveBeenCalledWith(ROUTES.dashboard);
  });

  it("redirects non-signed-in users to the landing page", () => {
    render(withAuth(<RoadmapPage />, { isAuthenticated: IsAuthenticated.FALSE }));
    expect(mockPush).toHaveBeenCalledWith(ROUTES.landing);
  });

  it("does not redirect for unknown auth users", () => {
    render(withAuth(<RoadmapPage />, { isAuthenticated: IsAuthenticated.UNKNOWN }));
    expect(mockPush).not.toHaveBeenCalled();
  });
});

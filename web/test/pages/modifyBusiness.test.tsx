import { ROUTES } from "@/lib/domain-logic/routes";
import ModifyBusinessPage from "@/pages/mgmt/modifyBusiness";
import { mockPush, useMockRouter } from "@/test/mock/mockRouter";
import { useMockBusiness } from "@/test/mock/mockUseUserData";
import { render, screen, waitFor } from "@testing-library/react";

vi.mock("next/compat/router", () => ({ useRouter: vi.fn() }));
vi.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: vi.fn() }));
vi.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: vi.fn() }));

describe("modify business page", () => {
  const ORIGINAL_FEATURE_MODIFY_BUSINESS_PAGE = process.env.FEATURE_MODIFY_BUSINESS_PAGE;

  beforeEach(() => {
    vi.resetAllMocks();
    useMockRouter({});
    useMockBusiness({});
  });

  afterEach(() => {
    process.env.FEATURE_MODIFY_BUSINESS_PAGE = ORIGINAL_FEATURE_MODIFY_BUSINESS_PAGE;
  });

  it("redirects to dashbaord when FEATURE_MODIFY_BUSINESS_PAGE is false", async () => {
    process.env.FEATURE_MODIFY_BUSINESS_PAGE = "false";
    render(<ModifyBusinessPage />);
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(ROUTES.dashboard);
    });
  });

  it("displays page when FEATURE_MODIFY_BUSINESS_PAGE is true", () => {
    process.env.FEATURE_MODIFY_BUSINESS_PAGE = "true";
    render(<ModifyBusinessPage />);
    expect(screen.getByTestId("modifyBusinessPage")).toBeInTheDocument();
  });
});

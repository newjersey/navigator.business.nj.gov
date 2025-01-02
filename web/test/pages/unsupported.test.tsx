import { getMergedConfig } from "@/contexts/configContext";
import { QUERIES } from "@/lib/domain-logic/routes";
import UnsupportedPage from "@/pages/unsupported";
import { useMockRouter } from "@/test/mock/mockRouter";
import { useMockUserData } from "@/test/mock/mockUseUserData";
import { generateBusiness, generateUserData } from "@businessnjgovnavigator/shared";
import { render, screen } from "@testing-library/react";

vi.mock("next/compat/router", () => ({ useRouter: vi.fn() }));
vi.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: vi.fn() }));

const Config = getMergedConfig();

describe("Unsupported", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    useMockUserData({});
    useMockRouter({});
  });

  it("renders the text when navigated to", () => {
    render(<UnsupportedPage />);
    expect(screen.getByText(Config.unsupportedNavigatorUserPage.title)).toBeInTheDocument();
    expect(screen.getByTestId("unsupported-subtitle")).toBeInTheDocument();
  });

  describe("previous business button", () => {
    it("renders when router param additionalBusiness is true", () => {
      useMockUserData(
        generateUserData({
          businesses: {
            "prev-biz-id": generateBusiness({
              id: "prev-biz-id",
            }),
          },
        })
      );
      useMockRouter({ query: { additionalBusiness: "true", [QUERIES.previousBusinessId]: "prev-biz-id" } });
      render(<UnsupportedPage />);
      expect(screen.getByTestId("return-to-prev-button")).toBeInTheDocument();
    });

    it("doesn't render when router param additionalBusiness doesn't have a value", () => {
      useMockUserData(
        generateUserData({
          businesses: {
            "prev-biz-id": generateBusiness({
              id: "prev-biz-id",
            }),
          },
        })
      );
      useMockRouter({ query: {} });
      render(<UnsupportedPage />);
      expect(screen.queryByTestId("return-to-prev-button")).not.toBeInTheDocument();
    });
  });
});

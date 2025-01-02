import { SidebarPageLayout } from "@/components/njwds-layout/SidebarPageLayout";
import { ROUTES } from "@/lib/domain-logic/routes";
import { useMockRouter } from "@/test/mock/mockRouter";
import { useMockBusiness, useMockProfileData } from "@/test/mock/mockUseUserData";
import * as materialUi from "@mui/material";
import { useMediaQuery } from "@mui/material";
import { render, screen } from "@testing-library/react";

function mockMaterialUI(): typeof materialUi {
  return {
    ...vi.requireActual("@mui/material"),
    useMediaQuery: vi.fn(),
  };
}

vi.mock("@mui/material", () => mockMaterialUI());
vi.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: vi.fn() }));
vi.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: vi.fn() }));
vi.mock("next/compat/router", () => ({ useRouter: vi.fn() }));

describe("<SidebarPageLayout />", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    useMockRouter({});
    useMockBusiness({});
    (useMediaQuery as vi.Mock).mockImplementation(() => {
      return true;
    }); // set large screen
  });

  it("links back to /dashboard when user is starting a business", () => {
    useMockProfileData({ businessPersona: "STARTING" });
    render(<SidebarPageLayout>stuff</SidebarPageLayout>);
    expect(screen.getByText("stuff")).toBeInTheDocument();
    expect(screen.getByTestId("back-to-dashboard")).toHaveAttribute("href", ROUTES.dashboard);
  });

  it("links back to /dashboard when user owns a business", () => {
    useMockProfileData({ businessPersona: "OWNING" });
    render(<SidebarPageLayout>stuff</SidebarPageLayout>);
    expect(screen.getByTestId("back-to-dashboard")).toHaveAttribute("href", ROUTES.dashboard);
  });

  it("shows content in sidebar", () => {
    render(<SidebarPageLayout navChildren={<div>{"roflcopter"}</div>}>stuff</SidebarPageLayout>);
    expect(screen.getByText("roflcopter")).toBeInTheDocument();
  });
});

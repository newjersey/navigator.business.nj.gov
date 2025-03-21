import { SidebarPageLayout } from "@/components/njwds-layout/SidebarPageLayout";
import { ROUTES } from "@/lib/domain-logic/routes";
import { useMockRouter } from "@/test/mock/mockRouter";
import { useMockBusiness, useMockProfileData } from "@/test/mock/mockUseUserData";
import * as materialUi from "@mui/material";
import { useMediaQuery } from "@mui/material";
import { render, screen } from "@testing-library/react";

function mockMaterialUI(): typeof materialUi {
  return {
    ...jest.requireActual("@mui/material"),
    useMediaQuery: jest.fn(),
  };
}

jest.mock("@mui/material", () => mockMaterialUI());
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));
jest.mock("next/compat/router", () => ({ useRouter: jest.fn() }));

describe("<SidebarPageLayout />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockRouter({});
    useMockBusiness({});
    (useMediaQuery as jest.Mock).mockImplementation(() => {
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

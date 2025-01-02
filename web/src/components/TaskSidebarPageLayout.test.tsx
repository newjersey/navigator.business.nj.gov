import { TaskSidebarPageLayout } from "@/components/TaskSidebarPageLayout";
import { getMergedConfig } from "@/contexts/configContext";
import { generateStep } from "@/test/factories";
import { useMockRouter } from "@/test/mock/mockRouter";
import { useMockRoadmap } from "@/test/mock/mockUseRoadmap";
import { useMockBusiness } from "@/test/mock/mockUseUserData";
import { generateBusiness } from "@businessnjgovnavigator/shared";
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

const Config = getMergedConfig();

describe("<TaskSidebarPageLayout />", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    useMockRouter({});
    useMockBusiness(generateBusiness({}));
    useMockRoadmap({
      steps: [generateStep({ section: "PLAN" }), generateStep({ section: "START" })],
    });
    (useMediaQuery as vi.Mock).mockImplementation(() => {
      return true;
    }); // set large screen
  });

  it("shows only plan/start sections when there are no operateReferences", () => {
    render(<TaskSidebarPageLayout>stuff</TaskSidebarPageLayout>);
    expect(screen.getByText(Config.sectionHeaders.PLAN)).toBeInTheDocument();
    expect(screen.getByText(Config.sectionHeaders.START)).toBeInTheDocument();
  });
});

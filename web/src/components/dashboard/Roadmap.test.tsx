import { Roadmap } from "@/components/dashboard/Roadmap";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { generateTask } from "@/test/factories";
import { withNeedsAccountContext } from "@/test/helpers/helpers-renderers";
import { useMockRoadmap } from "@/test/mock/mockUseRoadmap";
import { useMockBusiness } from "@/test/mock/mockUseUserData";
import { generateBusiness, generateProfileData } from "@businessnjgovnavigator/shared";
import { getMergedConfig } from "@businessnjgovnavigator/shared/contexts";
import { render, screen } from "@testing-library/react";

jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));
jest.mock("next/compat/router", () => ({ useRouter: jest.fn() }));

const Config = getMergedConfig();

describe("<Roadmap />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockRoadmap({});
    useMockBusiness(generateBusiness({}));
  });

  it("renders the roadmap description text", () => {
    render(<Roadmap />);
    expect(
      screen.getByText(Config.dashboardRoadmapHeaderDefaults.roadmapTasksDescription),
    ).toBeInTheDocument();
  });

  it("only shows required tasks", () => {
    useMockRoadmap({
      tasks: [
        generateTask({ name: "required-task", required: true }),
        generateTask({ name: "optional-task", required: false }),
      ],
    });
    render(<Roadmap />);
    expect(screen.getByText("required-task")).toBeInTheDocument();
    expect(screen.queryByText("optional-task")).not.toBeInTheDocument();
  });

  describe("progress bar", () => {
    it("shows 0% progress when no tasks are completed", () => {
      const task = generateTask({ id: "task-1", required: true });
      useMockRoadmap({ tasks: [task] });
      useMockBusiness(
        generateBusiness({
          profileData: generateProfileData({}),
          taskProgress: {},
        }),
      );
      render(<Roadmap />);
      const bar = screen.getByTestId("section-progress-bar");
      expect(bar).toHaveStyle({ "--progress": "0%" });
    });

    it("shows 100% progress when all tasks are completed", () => {
      const task = generateTask({ id: "task-1", required: true });
      useMockRoadmap({ tasks: [task] });
      useMockBusiness(
        generateBusiness({
          profileData: generateProfileData({}),
          taskProgress: { "task-1": "COMPLETED" },
        }),
      );
      render(<Roadmap />);
      const bar = screen.getByTestId("section-progress-bar");
      expect(bar).toHaveStyle({ "--progress": "100%" });
    });

    it("shows 50% progress when half of tasks are completed", () => {
      const task1 = generateTask({ id: "task-1", required: true });
      const task2 = generateTask({ id: "task-2", required: true });
      useMockRoadmap({ tasks: [task1, task2] });
      useMockBusiness(
        generateBusiness({
          profileData: generateProfileData({}),
          taskProgress: { "task-1": "COMPLETED" },
        }),
      );
      render(<Roadmap />);
      const bar = screen.getByTestId("section-progress-bar");
      expect(bar).toHaveStyle({ "--progress": "50%" });
    });
  });

  describe("locked tasks prompt", () => {
    it("renders the locked tasks prompt when user is not authenticated", () => {
      render(withNeedsAccountContext(<Roadmap />, IsAuthenticated.FALSE));
      expect(screen.getByText("log in")).toBeInTheDocument();
    });

    it("does not render the locked tasks prompt when user is authenticated", () => {
      render(withNeedsAccountContext(<Roadmap />, IsAuthenticated.TRUE));
      expect(screen.queryByText("log in")).not.toBeInTheDocument();
    });
  });
});

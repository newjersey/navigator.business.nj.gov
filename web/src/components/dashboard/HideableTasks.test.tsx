import { getMergedConfig } from "@/contexts/configContext";
import { templateEval } from "@/lib/utils/helpers";
import { generatePreferences, generateStep, generateTask, generateUserData } from "@/test/factories";
import { useMockRoadmap } from "@/test/mock/mockUseRoadmap";
import { setupStatefulUserDataContext, WithStatefulUserData } from "@/test/mock/withStatefulUserData";
import { UserData } from "@businessnjgovnavigator/shared/userData";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { HideableTasks } from "./HideableTasks";

jest.mock("@/lib/data-hooks/useUserData", () => {
  return { useUserData: jest.fn() };
});
jest.mock("@/lib/data-hooks/useRoadmap", () => {
  return { useRoadmap: jest.fn() };
});

const Config = getMergedConfig();

describe("<HideableTasks />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    setupStatefulUserDataContext();
    useMockRoadmap({});
  });

  const renderHideableTask = (initialUserData?: UserData) => {
    return render(
      <WithStatefulUserData initialUserData={initialUserData}>
        <HideableTasks />
      </WithStatefulUserData>
    );
  };

  it("displays number of hidden tasks when hide toggle is clicked", async () => {
    const tasks = [generateTask({}), generateTask({})];
    const content = templateEval(Config.dashboardDefaults.hiddenTasksText, {
      count: String(tasks.length),
    });
    const userData = generateUserData({
      preferences: generatePreferences({ isHideableRoadmapOpen: true }),
    });

    useMockRoadmap({
      tasks: tasks,
    });

    renderHideableTask(userData);
    fireEvent.click(screen.getByText(Config.dashboardDefaults.hideTaskText));
    await waitFor(() => {
      expect(screen.getByText(content)).toBeInTheDocument();
    });
    expect(screen.queryByTestId("section-plan")).not.toBeInTheDocument();
  });

  it("displays roadmap tasks when show toggle is clicked", async () => {
    const tasks = [generateTask({}), generateTask({})];
    const hiddenTasksContent = templateEval(Config.dashboardDefaults.hiddenTasksText, {
      count: String(tasks.length),
    });

    const userData = generateUserData({
      preferences: generatePreferences({ isHideableRoadmapOpen: false }),
    });

    useMockRoadmap({
      steps: [generateStep({ stepNumber: 1, section: "PLAN" })],
      tasks: tasks,
    });

    renderHideableTask(userData);

    fireEvent.click(screen.getByText(Config.dashboardDefaults.showTaskText));

    await waitFor(() => {
      expect(screen.getByTestId("section-plan")).toBeInTheDocument();
    });

    expect(screen.queryByText(hiddenTasksContent)).not.toBeInTheDocument();
  });
});

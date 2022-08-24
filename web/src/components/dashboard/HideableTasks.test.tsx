import { getMergedConfig } from "@/contexts/configContext";
import { templateEval } from "@/lib/utils/helpers";
import {
  generatePreferences,
  generateProfileData,
  generateStep,
  generateTask,
  generateUserData,
} from "@/test/factories";
import { randomElementFromArray } from "@/test/helpers";
import { useMockRoadmap } from "@/test/mock/mockUseRoadmap";
import { useMockUserData } from "@/test/mock/mockUseUserData";
import { setupStatefulUserDataContext, WithStatefulUserData } from "@/test/mock/withStatefulUserData";
import { OperatingPhases } from "@businessnjgovnavigator/shared/operatingPhase";
import { UserData } from "@businessnjgovnavigator/shared/userData";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { HideableTasks } from "./HideableTasks";

jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));

const Config = getMergedConfig();

describe("<HideableTasks />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    setupStatefulUserDataContext();
    useMockRoadmap({});
  });

  const renderHideableTask = (initialUserData?: UserData) =>
    render(
      <WithStatefulUserData initialUserData={initialUserData}>
        <HideableTasks />
      </WithStatefulUserData>
    );

  it("does not render HideableTasks for operating phases that don't display HideableRoadmapTasks", () => {
    const randomOperatingPhase = randomElementFromArray(
      OperatingPhases.filter((obj) => obj.displayHideableRoadmapTasks !== true)
    );
    useMockUserData({ profileData: generateProfileData({ operatingPhase: randomOperatingPhase.id }) });
    render(<HideableTasks />);

    expect(screen.queryByText(Config.dashboardDefaults.upAndRunningTaskHeader)).not.toBeInTheDocument();
  });

  it("renders HideableTasks for operating phases that display HideableRoadmapTasks", () => {
    const randomOperatingPhase = randomElementFromArray(
      OperatingPhases.filter((obj) => obj.displayHideableRoadmapTasks === true)
    );
    useMockUserData({ profileData: generateProfileData({ operatingPhase: randomOperatingPhase.id }) });
    render(<HideableTasks />);

    expect(screen.getByText(Config.dashboardDefaults.upAndRunningTaskHeader)).toBeInTheDocument();
  });

  it("displays number of hidden tasks when hide toggle is clicked", async () => {
    const tasks = [generateTask({}), generateTask({})];
    const randomOperatingPhase = randomElementFromArray(
      OperatingPhases.filter((obj) => obj.displayHideableRoadmapTasks === true)
    );
    const content = templateEval(Config.dashboardDefaults.hiddenTasksText, {
      count: String(tasks.length),
    });
    const userData = generateUserData({
      profileData: generateProfileData({ operatingPhase: randomOperatingPhase.id }),
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
    const randomOperatingPhase = randomElementFromArray(
      OperatingPhases.filter((obj) => obj.displayHideableRoadmapTasks === true)
    );
    const hiddenTasksContent = templateEval(Config.dashboardDefaults.hiddenTasksText, {
      count: String(tasks.length),
    });

    const userData = generateUserData({
      profileData: generateProfileData({ operatingPhase: randomOperatingPhase.id }),
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

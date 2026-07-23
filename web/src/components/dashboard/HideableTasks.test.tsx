import { HideableTasks } from "@/components/dashboard/HideableTasks";
import { templateEval } from "@/lib/utils/helpers";
import { generateTask } from "@/test/factories";
import { useMockRoadmap } from "@/test/mock/mockUseRoadmap";
import {
  WithStatefulUserData,
  setupStatefulUserDataContext,
} from "@/test/mock/withStatefulUserData";
import { getMergedConfig } from "@businessnjgovnavigator/shared/contexts";
import {
  generateBusiness,
  generatePreferences,
  generateUserDataForBusiness,
} from "@businessnjgovnavigator/shared/test";
import { Business } from "@businessnjgovnavigator/shared/userData";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));

const Config = getMergedConfig();

describe("<HideableTasks />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    setupStatefulUserDataContext();
    useMockRoadmap({});
  });

  const renderHideableTask = (business: Business): void => {
    render(
      <WithStatefulUserData initialUserData={generateUserDataForBusiness(business)}>
        <HideableTasks />
      </WithStatefulUserData>,
    );
  };

  it("displays number of hidden tasks when hide toggle is clicked", async () => {
    const tasks = [generateTask({}), generateTask({})];
    const content = templateEval(Config.dashboardDefaults.hiddenTasksText, {
      count: String(tasks.length),
    });
    const business = generateBusiness({
      preferences: generatePreferences({ isHideableRoadmapOpen: true }),
    });

    useMockRoadmap({ tasks: tasks });

    renderHideableTask(business);
    fireEvent.click(screen.getByText(Config.dashboardDefaults.hideTaskText));
    await waitFor(() => {
      expect(screen.getByText(content)).toBeInTheDocument();
    });
  });

  it("displays roadmap tasks when show toggle is clicked", async () => {
    const tasks = [
      generateTask({ name: "visible-task-1", required: true }),
      generateTask({ required: true }),
    ];
    const hiddenTasksContent = templateEval(Config.dashboardDefaults.hiddenTasksText, {
      count: String(tasks.length),
    });

    const business = generateBusiness({
      preferences: generatePreferences({ isHideableRoadmapOpen: false }),
    });

    useMockRoadmap({ tasks: tasks });

    renderHideableTask(business);

    fireEvent.click(screen.getByText(Config.dashboardDefaults.showTaskText));

    await waitFor(() => {
      expect(screen.getByText("visible-task-1")).toBeInTheDocument();
    });

    expect(screen.queryByText(hiddenTasksContent)).not.toBeInTheDocument();
  });
});

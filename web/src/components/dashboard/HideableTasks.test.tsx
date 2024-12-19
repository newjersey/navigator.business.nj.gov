import { HideableTasks } from "@/components/dashboard/HideableTasks";
import { getMergedConfig } from "@/contexts/configContext";
import { templateEval } from "@/lib/utils/helpers";
import { generateStep, generateTask } from "@/test/factories";
import { useMockRoadmap } from "@/test/mock/mockUseRoadmap";
import { WithStatefulUserData, setupStatefulUserDataContext } from "@/test/mock/withStatefulUserData";
import {
  generateBusiness,
  generatePreferences,
  generateUserData,
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

  const userData = generateUserData({});
  const renderHideableTask = (business: Business): void => {
    render(
      <WithStatefulUserData initialUserData={generateUserDataForBusiness(business)}>
        <HideableTasks />
      </WithStatefulUserData>
    );
  };

  it("displays number of hidden tasks when hide toggle is clicked", async () => {
    const tasks = [generateTask({}), generateTask({})];
    const content = templateEval(Config.dashboardDefaults.hiddenTasksText, {
      count: String(tasks.length),
    });
    const business = generateBusiness(userData, {
      preferences: generatePreferences({ isHideableRoadmapOpen: true }),
    });

    useMockRoadmap({ tasks: tasks });

    renderHideableTask(business);
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

    const business = generateBusiness(userData, {
      preferences: generatePreferences({ isHideableRoadmapOpen: false }),
    });

    useMockRoadmap({
      steps: [generateStep({ stepNumber: 1, section: "PLAN" })],
      tasks: tasks,
    });

    renderHideableTask(business);

    fireEvent.click(screen.getByText(Config.dashboardDefaults.showTaskText));

    await waitFor(() => {
      expect(screen.getByTestId("section-plan")).toBeInTheDocument();
    });

    expect(screen.queryByText(hiddenTasksContent)).not.toBeInTheDocument();
  });
});

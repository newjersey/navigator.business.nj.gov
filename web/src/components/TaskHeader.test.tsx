import { TaskHeader } from "@/components/TaskHeader";
import { getMergedConfig } from "@/contexts/configContext";
import { Task } from "@/lib/types/types";
import { generateStep, generateTask } from "@/test/factories";
import { useMockRouter } from "@/test/mock/mockRouter";
import { useMockRoadmap } from "@/test/mock/mockUseRoadmap";
import { WithStatefulUserData, setupStatefulUserDataContext } from "@/test/mock/withStatefulUserData";
import {
  Business,
  TaskProgress,
  formationTaskId,
  generateBusiness,
  generateUserDataForBusiness,
} from "@businessnjgovnavigator/shared";
import {
  generateFormationData,
  generateGetFilingResponse,
  generateUserData,
} from "@businessnjgovnavigator/shared/test";
import { ThemeProvider, createTheme } from "@mui/material";
import { fireEvent, render, screen } from "@testing-library/react";

jest.mock("next/router", () => ({ useRouter: jest.fn() }));
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));

const renderTaskHeader = (task: Task, business?: Business): void => {
  render(
    <ThemeProvider theme={createTheme()}>
      <WithStatefulUserData
        initialUserData={business ? generateUserDataForBusiness(business) : generateUserData({})}
      >
        <TaskHeader task={task} />
      </WithStatefulUserData>
    </ThemeProvider>
  );
};

const Config = getMergedConfig();

describe("<TaskHeader />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockRoadmap({});
    useMockRouter({});
    setupStatefulUserDataContext();
  });

  it("displays required tag in header if task is required", () => {
    renderTaskHeader(generateTask({ required: true }));
    expect(screen.getByText(Config.taskDefaults.requiredLabelText)).toBeInTheDocument();
  });

  it("does not display required tag in header if task is not required", () => {
    renderTaskHeader(generateTask({ required: false }));
    expect(screen.queryByText(Config.taskDefaults.requiredLabelText)).not.toBeInTheDocument();
  });

  it("overrides required tag in header from task in roadmap", () => {
    const id = "123";
    const taskInRoadmap = generateTask({ id, required: false, stepNumber: 1 });
    const taskStaticGeneration = generateTask({ id, required: true });
    useMockRoadmap({
      steps: [generateStep({ stepNumber: 1, section: "PLAN" })],
      tasks: [taskInRoadmap],
    });
    renderTaskHeader(taskStaticGeneration);
    expect(screen.queryByText(Config.taskDefaults.requiredLabelText)).not.toBeInTheDocument();
  });

  it("locks task status if formation was completed through API", () => {
    const task = generateTask({ id: formationTaskId });
    const taskProgress: Record<string, TaskProgress> = { [formationTaskId]: "COMPLETED" };
    const formationData = generateFormationData({
      getFilingResponse: generateGetFilingResponse({ success: true }),
    });
    renderTaskHeader(task, generateBusiness(generateUserData({}), { taskProgress, formationData }));

    fireEvent.click(screen.getByTestId("change-task-progress-checkbox"));
    expect(screen.getByTestId("status-info-tooltip")).toBeInTheDocument();
  });
});

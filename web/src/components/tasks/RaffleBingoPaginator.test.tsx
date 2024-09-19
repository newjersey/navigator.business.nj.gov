import { RaffleBingoPaginator } from "@/components/tasks/RaffleBingoPaginator";
import { getMergedConfig } from "@/contexts/configContext";
import { Task } from "@/lib/types/types";
import { getTaskStatusUpdatedMessage } from "@/lib/utils/helpers";
import { convertTaskMd } from "@/lib/utils/markdownReader";
import { generateTask } from "@/test/factories";
import { setupStatefulUserDataContext, WithStatefulUserData } from "@/test/mock/withStatefulUserData";
import { generateUserData } from "@businessnjgovnavigator/shared/test";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

jest.mock("next/router", () => ({ useRouter: jest.fn() }));
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));
jest.mock("@/lib/roadmap/buildUserRoadmap", () => ({ buildUserRoadmap: jest.fn() }));

const Config = getMergedConfig();

const fetchRaffleBingoTab = async (filename: string): Promise<Task> => {
  /*
    This function is a paired down version of the fetchTaskByFilename function to ensure we're getting the
    real task in the context of a test environment.
  */
  const tabTask = await import(`@businessnjgovnavigator/content/roadmaps/raffle-bingo-steps/${filename}.md`);

  return {
    ...convertTaskMd(tabTask.default),
    unlockedBy: [],
    filename,
  };
};

let step1: Task;
let step2: Task;

describe("<RaffleBingoPaginator />", () => {
  beforeEach(async () => {
    jest.resetAllMocks();
    setupStatefulUserDataContext();

    step1 = await fetchRaffleBingoTab("raffle-license-step-1");
    step2 = await fetchRaffleBingoTab("raffle-license-step-2");
  });

  const task = generateTask({});

  const renderPaginator = (task: Task): void => {
    render(
      <WithStatefulUserData initialUserData={generateUserData({})}>
        <RaffleBingoPaginator task={task} />
      </WithStatefulUserData>
    );
  };

  it("renders first tab content when the task is opened", async () => {
    renderPaginator(task);

    expect(await screen.findByText("Eligibility Criteria")).toBeInTheDocument();

    expect(screen.getByRole("button", { name: step1.callToActionText })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: Config.taskDefaults.continueButtonText })).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: Config.taskDefaults.backButtonText })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: Config.taskDefaults.markAsCompleteButtonText })
    ).not.toBeInTheDocument();
  });

  it("displays second step task content when on second step", async () => {
    renderPaginator(task);

    await screen.findByTestId("stepper-1");

    fireEvent.click(screen.getByTestId("stepper-1"));

    expect(await screen.findByText("Application Requirements")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByRole("button", { name: step2.callToActionText })).toBeInTheDocument();
    });

    expect(screen.getByRole("button", { name: Config.taskDefaults.backButtonText })).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: Config.taskDefaults.continueButtonText })
    ).not.toBeInTheDocument();
  });

  it("marks task as complete when 'Mark As Complete' button is clicked", async () => {
    renderPaginator(task);

    await screen.findByTestId("stepper-1");

    fireEvent.click(screen.getByTestId("stepper-1"));

    await waitFor(() => {
      expect(screen.queryByText(getTaskStatusUpdatedMessage("COMPLETED"))).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: Config.taskDefaults.markAsCompleteButtonText }));

    await screen.findByText(getTaskStatusUpdatedMessage("COMPLETED"));
  });

  it("navigates from step one to step two when the continue button is clicked", async () => {
    renderPaginator(task);

    expect(await screen.findByText("Eligibility Criteria")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: Config.taskDefaults.continueButtonText }));

    await screen.findByText("Application Requirements");
  });

  it("navigates from step two to step one when the back button is clicked", async () => {
    renderPaginator(task);

    expect(await screen.findByText("Eligibility Criteria")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: Config.taskDefaults.continueButtonText }));

    expect(await screen.findByText("Application Requirements")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: Config.taskDefaults.backButtonText }));

    await screen.findByText("Eligibility Criteria");
  });
});

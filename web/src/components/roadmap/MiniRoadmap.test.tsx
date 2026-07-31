import { MiniRoadmap } from "@/components/roadmap/MiniRoadmap";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { generateTask } from "@/test/factories";
import { useMockRouter } from "@/test/mock/mockRouter";
import { useMockRoadmap } from "@/test/mock/mockUseRoadmap";
import { useMockBusiness } from "@/test/mock/mockUseUserData";
import { setupStatefulUserDataContext } from "@/test/mock/withStatefulUserData";
import { withNeedsAccountContext } from "@/test/helpers/helpers-renderers";
import { render, screen } from "@testing-library/react";

jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("next/compat/router", () => ({ useRouter: jest.fn() }));

const renderMiniRoadMap = (taskId: string): void => {
  render(<MiniRoadmap activeTaskId={taskId} />);
};

describe("<MiniRoadmap />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    setupStatefulUserDataContext();
    useMockRouter({ asPath: "" });
    useMockRoadmap({
      tasks: [
        generateTask({ name: "task1", id: "task1", required: true }),
        generateTask({ name: "task2", id: "task2", required: true }),
      ],
    });
  });

  it("displays all required tasks in a flat list", () => {
    useMockBusiness({});
    renderMiniRoadMap("task1");
    expect(screen.getByText("task1")).toBeInTheDocument();
    expect(screen.getByText("task2")).toBeInTheDocument();
  });

  it("highlights the active task with distinct styling", () => {
    useMockBusiness({});
    renderMiniRoadMap("task2");
    const activeTaskContainer = screen.getByTestId("mini-roadmap-task-task2");
    const inactiveTaskContainer = screen.getByTestId("mini-roadmap-task-task1");
    expect(activeTaskContainer).toHaveClass("bg-cool-lighter");
    expect(activeTaskContainer).toHaveClass("h5-styling");
    expect(inactiveTaskContainer).toHaveClass("h6-styling");
    expect(inactiveTaskContainer).not.toHaveClass("bg-cool-lighter");
  });

  it("does not display non-required tasks", () => {
    useMockBusiness({});
    useMockRoadmap({
      tasks: [
        generateTask({ name: "task1", id: "task1", required: true }),
        generateTask({ name: "task2", id: "task2", required: false }),
      ],
    });
    renderMiniRoadMap("task1");
    expect(screen.getByText("task1")).toBeInTheDocument();
    expect(screen.queryByText("task2")).not.toBeInTheDocument();
  });

  it("renders the locked tasks prompt when user is not authenticated", () => {
    useMockBusiness({});
    render(withNeedsAccountContext(<MiniRoadmap activeTaskId="task1" />, IsAuthenticated.FALSE));
    expect(screen.getByText("log in")).toBeInTheDocument();
  });

  it("does not render the locked tasks prompt when user is authenticated", () => {
    useMockBusiness({});
    render(withNeedsAccountContext(<MiniRoadmap activeTaskId="task1" />, IsAuthenticated.TRUE));
    expect(screen.queryByText("log in")).not.toBeInTheDocument();
  });
});

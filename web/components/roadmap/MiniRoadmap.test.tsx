import { fireEvent, render, RenderResult, within } from "@testing-library/react";
import { MiniRoadmap } from "./MiniRoadmap";
import { generatePreferences, generateStep, generateTask } from "@/test/factories";
import { useMockRoadmap } from "@/test/mock/mockUseRoadmap";
import { useMockUserData } from "@/test/mock/mockUseUserData";

jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));

const renderMiniRoadMap = (taskId: string): RenderResult => {
  return render(<MiniRoadmap activeTaskId={taskId} />);
};

describe("<MiniRoadmap />", () => {
  beforeEach(() => {
    useMockRoadmap({
      steps: [
        generateStep({
          name: "step1",
          tasks: [generateTask({ name: "task1", id: "task1" })],
        }),
        generateStep({
          name: "step2",
          tasks: [generateTask({ name: "task2", id: "task2" })],
        }),
      ],
    });
  });

  it("expands the step that you are in by default", () => {
    useMockUserData({});
    const subject = renderMiniRoadMap("task2");
    expect(subject.queryByText("task2")).toBeInTheDocument();
    expect(subject.queryByText("task1")).not.toBeInTheDocument();
  });

  it("expands another step when clicked, keeping your step open", () => {
    useMockUserData({});
    const subject = renderMiniRoadMap("task2");
    fireEvent.click(subject.getByText("step1"));
    expect(subject.queryByText("task2")).toBeInTheDocument();
    expect(subject.queryByText("task1")).toBeInTheDocument();
  });

  it("closes an open step when clicked", () => {
    useMockUserData({});
    const subject = renderMiniRoadMap("task2");
    fireEvent.click(subject.getByText("step2"));
    expect(subject.queryByText("task2")).not.toBeInTheDocument();
    expect(subject.queryByText("task1")).not.toBeInTheDocument();
  });

  it("displays each step under associated section", () => {
    useMockUserData({});

    useMockRoadmap({
      steps: [
        generateStep({
          name: "step1",
          section: "PLAN",
          tasks: [generateTask({ id: "task1" })],
        }),
        generateStep({ name: "step2", section: "START" }),
        generateStep({ name: "step3", section: "PLAN" }),
        generateStep({ name: "step4", section: "START" }),
      ],
    });

    const subject = renderMiniRoadMap("task1");

    const sectionPlan = subject.getByTestId("section-plan");

    expect(within(sectionPlan).getByText("step1")).toBeInTheDocument();
    expect(within(sectionPlan).getByText("step3")).toBeInTheDocument();
    expect(within(sectionPlan).queryByText("step2")).not.toBeInTheDocument();
    expect(within(sectionPlan).queryByText("step4")).not.toBeInTheDocument();

    const sectionStart = subject.getByTestId("section-start");

    expect(within(sectionStart).queryByText("step1")).not.toBeInTheDocument();
    expect(within(sectionStart).queryByText("step3")).not.toBeInTheDocument();
    expect(within(sectionStart).getByText("step2")).toBeInTheDocument();
    expect(within(sectionStart).getByText("step4")).toBeInTheDocument();
  });

  it("displays sections based on userData preferences", () => {
    useMockRoadmap({
      steps: [
        generateStep({ name: "step1", section: "PLAN" }),
        generateStep({ name: "step2", section: "START" }),
      ],
    });

    useMockUserData({
      preferences: generatePreferences({
        roadmapOpenSections: ["PLAN", "START"],
      }),
    });

    const subject = renderMiniRoadMap("task3");

    const sectionStart = subject.getByTestId("section-start");
    const sectionPlan = subject.getByTestId("section-plan");

    expect(within(sectionStart).getByText("step2")).toBeVisible();
    expect(within(sectionPlan).getByText("step1")).toBeVisible();
  });
});

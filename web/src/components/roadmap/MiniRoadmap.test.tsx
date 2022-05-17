import { MiniRoadmap } from "@/components/roadmap/MiniRoadmap";
import { generatePreferences, generateStep, generateTask, generateUserData } from "@/test/factories";
import { useMockRoadmap } from "@/test/mock/mockUseRoadmap";
import { useMockUserData } from "@/test/mock/mockUseUserData";
import {
  currentUserData,
  setupStatefulUserDataContext,
  WithStatefulUserData,
} from "@/test/mock/withStatefulUserData";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import React from "react";

jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));

const renderMiniRoadMap = (taskId: string) => {
  render(<MiniRoadmap activeTaskId={taskId} />);
};

describe("<MiniRoadmap />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
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
    renderMiniRoadMap("task2");
    expect(screen.getByText("task2")).toBeInTheDocument();
    expect(screen.queryByText("task1")).not.toBeInTheDocument();
  });

  it("expands another step when clicked, keeping your step open", () => {
    useMockUserData({});
    renderMiniRoadMap("task2");
    fireEvent.click(screen.getByText("step1"));
    expect(screen.getByText("task2")).toBeInTheDocument();
    expect(screen.getByText("task1")).toBeInTheDocument();
  });

  it("closes an open step when clicked", () => {
    useMockUserData({});
    renderMiniRoadMap("task2");
    fireEvent.click(screen.getByText("step2"));
    expect(screen.queryByText("task2")).not.toBeInTheDocument();
    expect(screen.queryByText("task1")).not.toBeInTheDocument();
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

    renderMiniRoadMap("task1");

    const sectionPlan = screen.getByTestId("section-plan");

    expect(within(sectionPlan).getByText("step1")).toBeInTheDocument();
    expect(within(sectionPlan).getByText("step3")).toBeInTheDocument();
    expect(within(sectionPlan).queryByText("step2")).not.toBeInTheDocument();
    expect(within(sectionPlan).queryByText("step4")).not.toBeInTheDocument();

    const sectionStart = screen.getByTestId("section-start");

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

    renderMiniRoadMap("task3");

    const sectionStart = screen.getByTestId("section-start");
    const sectionPlan = screen.getByTestId("section-plan");

    expect(within(sectionStart).getByText("step2")).toBeVisible();
    expect(within(sectionPlan).getByText("step1")).toBeVisible();
  });

  const renderStatefulMiniRoadMap = (taskId: string, userData = generateUserData({})) => {
    setupStatefulUserDataContext();
    render(
      <WithStatefulUserData initialUserData={userData}>
        <MiniRoadmap activeTaskId={taskId} />;
      </WithStatefulUserData>
    );
  };

  describe("User Step State Preferences", () => {
    const userData = generateUserData({
      preferences: generatePreferences({
        roadmapOpenSections: ["PLAN", "START"],
        roadmapOpenSteps: [2],
      }),
    });
    beforeEach(() => {
      useMockRoadmap({
        steps: [
          generateStep({
            name: "step1",
            step_number: 1,
            section: "PLAN",
            tasks: [generateTask({ name: "task1", id: "task1" })],
          }),
          generateStep({
            name: "step2",
            step_number: 2,
            section: "START",
            tasks: [generateTask({ name: "task2", id: "task2" })],
          }),
        ],
      });
    });

    it("display open step based on userData preferences", () => {
      useMockUserData(userData);
      renderMiniRoadMap("task1");
      expect(screen.getByText("task2")).toBeInTheDocument();
    });

    it("display closed step based on userData preferences", () => {
      useMockUserData(userData);
      renderMiniRoadMap("task2");
      expect(screen.queryByText("task1")).not.toBeInTheDocument();
    });

    it("adds step to userData openSteps when step is active", async () => {
      renderStatefulMiniRoadMap("task1", userData);
      expect(screen.getByText("task1")).toBeInTheDocument();
      await waitFor(() =>
        expect(currentUserData().preferences.roadmapOpenSteps).toEqual(expect.arrayContaining([1, 2]))
      );
    });

    it("adds step to userData openSteps when step is clicked", async () => {
      renderStatefulMiniRoadMap("task2", userData);
      expect(screen.queryByText("task1")).not.toBeInTheDocument();
      fireEvent.click(screen.getByText("step1"));
      expect(screen.getByText("task1")).toBeInTheDocument();
      expect(screen.getByText("task2")).toBeInTheDocument();
      await waitFor(() =>
        expect(currentUserData().preferences.roadmapOpenSteps).toEqual(expect.arrayContaining([1, 2]))
      );
    });
    it("removes active step from userData openSteps when active step is clicked", async () => {
      renderStatefulMiniRoadMap("task1", userData);
      fireEvent.click(screen.getByText("step1"));
      expect(screen.queryByText("task1")).not.toBeInTheDocument();
      await waitFor(() =>
        expect(currentUserData().preferences.roadmapOpenSteps).toEqual(expect.arrayContaining([2]))
      );
    });
  });
});

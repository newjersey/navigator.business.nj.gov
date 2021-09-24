import { fireEvent, render, RenderResult, within } from "@testing-library/react";
import { MiniRoadmap } from "./MiniRoadmap";
import { generateStep, generateTask, generatePreferences, generateUserData } from "@/test/factories";
import { useMockRoadmap } from "@/test/mock/mockUseRoadmap";
import { useMockUserData } from "@/test/mock/mockUseUserData";
import {
  currentUserData,
  setupStatefulUserDataContext,
  WithStatefulUserData,
} from "@/test/mock/withStatefulUserData";

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

  describe("MiniRoadmap sections", () => {
    beforeEach(() => {
      useMockRoadmap({
        steps: [
          generateStep({
            name: "step1",
            section: "PLAN",
            tasks: [generateTask({ id: "task1" })],
          }),
          generateStep({
            name: "step2",
            section: "START",
            tasks: [generateTask({ id: "task2" })],
          }),
        ],
      });
    });

    it("displays sections based on userData preferences", () => {
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

    it("expands start section only", () => {
      useMockUserData({
        preferences: generatePreferences({
          roadmapOpenSections: ["START"],
        }),
      });

      const subject = renderMiniRoadMap("task1");

      const sectionStart = subject.getByTestId("section-start");
      const sectionPlan = subject.getByTestId("section-plan");

      expect(within(sectionStart).getByText("step2")).toBeVisible();
      expect(within(sectionPlan).getByText("step1")).not.toBeVisible();
    });

    it("expands plan section only", () => {
      useMockUserData({
        preferences: generatePreferences({
          roadmapOpenSections: ["PLAN"],
        }),
      });

      const subject = renderMiniRoadMap("task1");

      const sectionStart = subject.getByTestId("section-start");
      const sectionPlan = subject.getByTestId("section-plan");

      expect(within(sectionStart).getByText("step2")).not.toBeVisible();
      expect(within(sectionPlan).getByText("step1")).toBeVisible();
    });

    it("updates userData preferences", async () => {
      const userData = generateUserData({
        preferences: generatePreferences({
          roadmapOpenSections: ["PLAN", "START"],
        }),
      });

      setupStatefulUserDataContext();
      const subject = render(
        <WithStatefulUserData initialUserData={userData}>
          <MiniRoadmap activeTaskId="task1" />
        </WithStatefulUserData>
      );

      const sectionPlan = subject.container.querySelector("#plan-header");
      const sectionStart = subject.container.querySelector("#start-header");

      expect(sectionPlan).toBeInTheDocument();
      expect(sectionStart).toBeInTheDocument();
      fireEvent.click(sectionPlan as Element);
      expect(currentUserData().preferences.roadmapOpenSections).toEqual(["START"]);
      fireEvent.click(sectionPlan as Element);
      expect(currentUserData().preferences.roadmapOpenSections).toEqual(["START", "PLAN"]);
      fireEvent.click(sectionStart as Element);
      expect(currentUserData().preferences.roadmapOpenSections).toEqual(["PLAN"]);
      fireEvent.click(sectionPlan as Element);
      expect(currentUserData().preferences.roadmapOpenSections).toEqual([]);
      fireEvent.click(sectionPlan as Element);
      fireEvent.click(sectionStart as Element);
      expect(currentUserData().preferences.roadmapOpenSections).toEqual(["PLAN", "START"]);
    });
  });
});

import { useRoadmap, UseRoadmapReturnValue } from "@/lib/data-hooks/useRoadmap";
import * as buildUserRoadmapModule from "@/lib/roadmap/buildUserRoadmap";
import { Roadmap } from "@/lib/types/types";
import { generateRoadmap, generateStep, generateTask } from "@/test/factories";
import { withRoadmap } from "@/test/helpers/helpers-renderers";
import { generateProfileData } from "@businessnjgovnavigator/shared";
import { SectionType, TaskProgress } from "@businessnjgovnavigator/shared/userData";
import { render } from "@testing-library/react";
import {useMockBusiness} from "@/test/mock/mockUseUserData";

jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/roadmap/buildUserRoadmap", () => ({ buildUserRoadmap: jest.fn() }));
const mockBuildUserRoadmap = (buildUserRoadmapModule as jest.Mocked<typeof buildUserRoadmapModule>)
  .buildUserRoadmap;

describe("useRoadmap", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockBusiness({});
  });

  const setupHook = (initialRoadmap?: Roadmap): UseRoadmapReturnValue => {
    const initialReturnVal = {
      roadmap: initialRoadmap,
      sectionNamesInRoadmap: [],
      isSectionCompleted: () => false,
      currentAndNextSection: () => ({ current: "PLAN" as SectionType, next: undefined }),
    };
    function TestComponent(): null {
      Object.assign(initialReturnVal, useRoadmap());
      return null;
    }
    render(
      withRoadmap({
        component: <TestComponent />,
        initialRoadmap: initialRoadmap,
      })
    );
    return initialReturnVal;
  };

  it("builds roadmap when user data is defined and form is COMPLETED", async () => {
    const profileData = generateProfileData({});
    useMockBusiness({ profileData, onboardingFormProgress: "COMPLETED" });
    mockBuildUserRoadmap.mockResolvedValue(generateRoadmap({}));
    setupHook();
    expect(mockBuildUserRoadmap).toHaveBeenCalledWith(profileData);
  });

  it("does not build roadmap when user data is defined and form is UNSTARTED", async () => {
    const profileData = generateProfileData({});
    useMockBusiness({ profileData, onboardingFormProgress: "UNSTARTED" });
    mockBuildUserRoadmap.mockResolvedValue(generateRoadmap({}));
    setupHook();
    expect(mockBuildUserRoadmap).not.toHaveBeenCalled();
  });

  describe("isSectionCompleted", () => {
    const roadmap = generateRoadmap({
      steps: [
        generateStep({ section: "PLAN", stepNumber: 1 }),
        generateStep({ section: "PLAN", stepNumber: 2 }),
        generateStep({ section: "START", stepNumber: 3 }),
      ],
      tasks: [
        generateTask({ stepNumber: 1, id: "task1" }),
        generateTask({ stepNumber: 1, id: "task2" }),
        generateTask({ stepNumber: 2, id: "task3" }),
        generateTask({ stepNumber: 3, id: "task4" }),
      ],
    });

    it("is completed if all tasks in that section are completed", () => {
      useMockBusiness({
        taskProgress: {
          task1: "COMPLETED",
          task2: "COMPLETED",
          task3: "COMPLETED",
          task4: "NOT_STARTED",
        },
      });

      const { isSectionCompleted } = setupHook(roadmap);
      expect(isSectionCompleted("PLAN")).toBe(true);
      expect(isSectionCompleted("START")).toBe(false);
    });

    it("is not completed if some tasks in that section are not completed", () => {
      useMockBusiness({
        taskProgress: {
          task1: "COMPLETED",
          task2: "COMPLETED",
          task3: "IN_PROGRESS",
          task4: "COMPLETED",
        },
      });

      const { isSectionCompleted } = setupHook(roadmap);
      expect(isSectionCompleted("PLAN")).toBe(false);
      expect(isSectionCompleted("START")).toBe(true);
    });

    it("uses taskProgressOverride instead of userData if provided", () => {
      useMockBusiness({
        taskProgress: {
          task1: "COMPLETED",
          task2: "COMPLETED",
          task3: "IN_PROGRESS",
          task4: "IN_PROGRESS",
        },
      });

      const taskProgressOverride: Record<string, TaskProgress> = {
        task1: "COMPLETED",
        task2: "COMPLETED",
        task3: "COMPLETED",
        task4: "COMPLETED",
      };

      const { isSectionCompleted } = setupHook(roadmap);
      expect(isSectionCompleted("PLAN", taskProgressOverride)).toBe(true);
      expect(isSectionCompleted("START", taskProgressOverride)).toBe(true);
    });
  });

  describe("currentAndNextSections", () => {
    const roadmap = generateRoadmap({
      steps: [
        generateStep({ section: "PLAN", stepNumber: 1 }),
        generateStep({ section: "PLAN", stepNumber: 2 }),
        generateStep({ section: "START", stepNumber: 3 }),
      ],
      tasks: [
        generateTask({ stepNumber: 1, id: "task1" }),
        generateTask({ stepNumber: 1, id: "task2" }),
        generateTask({ stepNumber: 2, id: "task3" }),
        generateTask({ stepNumber: 3, id: "task4" }),
      ],
    });

    beforeEach(() => {
      useMockBusiness({
        taskProgress: {
          task1: "NOT_STARTED",
          task2: "NOT_STARTED",
          task3: "NOT_STARTED",
          task4: "NOT_STARTED",
        },
      });
    });

    it("returns current section for task", () => {
      const { currentAndNextSection } = setupHook(roadmap);
      expect(currentAndNextSection("task1").current).toEqual("PLAN");
      expect(currentAndNextSection("task2").current).toEqual("PLAN");
      expect(currentAndNextSection("task3").current).toEqual("PLAN");
      expect(currentAndNextSection("task4").current).toEqual("START");
    });

    it("returns next section for task, or undefined if no next section", () => {
      const { currentAndNextSection } = setupHook(roadmap);
      expect(currentAndNextSection("task1").next).toEqual("START");
      expect(currentAndNextSection("task2").next).toEqual("START");
      expect(currentAndNextSection("task3").next).toEqual("START");
      expect(currentAndNextSection("task4").next).toBeUndefined();
    });

    it("does not return next section if next section is completed", () => {
      useMockBusiness({
        taskProgress: {
          task1: "COMPLETED",
          task2: "COMPLETED",
          task3: "COMPLETED",
          task4: "COMPLETED",
        },
      });

      const { currentAndNextSection } = setupHook(roadmap);
      expect(currentAndNextSection("task3").current).toEqual("PLAN");
      expect(currentAndNextSection("task3").next).toBeUndefined();
      expect(currentAndNextSection("task4").current).toEqual("START");
      expect(currentAndNextSection("task4").next).toBeUndefined();
    });
  });
});

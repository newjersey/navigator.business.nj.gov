import { useRoadmap, UseRoadmapReturnValue } from "@/lib/data-hooks/useRoadmap";
import * as buildUserRoadmapModule from "@/lib/roadmap/buildUserRoadmap";
import { Roadmap } from "@/lib/types/types";
import {
  generateProfileData,
  generateRoadmap,
  generateSectionCompletion,
  generateStep,
  generateTask,
} from "@/test/factories";
import { withRoadmap } from "@/test/helpers/helpers-renderers";
import { useMockUserData } from "@/test/mock/mockUseUserData";
import { render } from "@testing-library/react";

jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/roadmap/buildUserRoadmap", () => ({ buildUserRoadmap: jest.fn() }));
const mockBuildUserRoadmap = (buildUserRoadmapModule as jest.Mocked<typeof buildUserRoadmapModule>)
  .buildUserRoadmap;

describe("useDocuments", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockUserData({});
  });

  const setupHook = (initialRoadmap?: Roadmap): UseRoadmapReturnValue => {
    const initialReturnVal = {
      roadmap: initialRoadmap,
      sectionCompletion: generateSectionCompletion({}),
      updateSectionCompletion: () => generateSectionCompletion({}),
      sectionNamesInRoadmap: [],
      isSectionCompleted: () => false,
    };
    function TestComponent() {
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
    useMockUserData({ profileData, formProgress: "COMPLETED" });
    mockBuildUserRoadmap.mockResolvedValue(generateRoadmap({}));
    setupHook();
    expect(mockBuildUserRoadmap).toHaveBeenCalledWith(profileData);
  });

  it("does not build roadmap when user data is defined and form is UNSTARTED", async () => {
    const profileData = generateProfileData({});
    useMockUserData({ profileData, formProgress: "UNSTARTED" });
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
      useMockUserData({
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
      useMockUserData({
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
  });
});

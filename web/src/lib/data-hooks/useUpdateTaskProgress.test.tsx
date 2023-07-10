/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { useUpdateTaskProgress } from "@/lib/data-hooks/useUpdateTaskProgress";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { UpdateQueue } from "@/lib/types/types";
import { generateRoadmap, generateStep, generateTask } from "@/test/factories";
import { setMockRoadmapResponse, useMockRoadmap } from "@/test/mock/mockUseRoadmap";
import {
  currentUserData,
  setupStatefulUserDataContext,
  WithStatefulUserData,
} from "@/test/mock/withStatefulUserData";
import { generatePreferences, generateUserData } from "@businessnjgovnavigator/shared/test";
import { TaskProgress, UserData } from "@businessnjgovnavigator/shared/userData";
import { act, render } from "@testing-library/react";
import { ReactNode } from "react";

jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));

describe("useUpdateTaskProgress", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    setupStatefulUserDataContext();
    useMockRoadmap({});
  });

  const setupHook = (
    initialUserData: UserData
  ): {
    queueUpdateTaskProgress: (taskId: string, newValue: TaskProgress) => void;
    congratulatoryModal: ReactNode;
    updateQueue: UpdateQueue;
  } => {
    const returnVal = {
      congratulatoryModal: <></>,
      queueUpdateTaskProgress: (): void => {},
    };
    const updateQueueReturnVal = { updateQueue: undefined };

    function TestComponent(): null {
      Object.assign(returnVal, useUpdateTaskProgress());
      Object.assign(updateQueueReturnVal, useUserData());
      return null;
    }

    render(
      <WithStatefulUserData initialUserData={initialUserData}>
        <TestComponent />
      </WithStatefulUserData>
    );
    return {
      ...returnVal,
      updateQueue: updateQueueReturnVal.updateQueue!,
    };
  };

  it("updates task progress", async () => {
    const initialUserData = generateUserData({
      taskProgress: { "some-id": "COMPLETED" },
    });
    const { queueUpdateTaskProgress, updateQueue } = setupHook(initialUserData);
    queueUpdateTaskProgress("some-other-id", "IN_PROGRESS");
    await act(() => {
      return updateQueue.update();
    });
    expect(currentUserData().businesses[currentUserData().currentBusinessID].taskProgress).toEqual({
      "some-id": "COMPLETED",
      "some-other-id": "IN_PROGRESS",
    });
  });

  describe("congratulatory modal", () => {
    const planTaskId = "123";
    const startTaskId = "124";

    const planTask = generateTask({ id: planTaskId, stepNumber: 1 });
    const startTask = generateTask({ id: startTaskId, stepNumber: 2 });

    const roadmap = generateRoadmap({
      steps: [
        generateStep({ stepNumber: 1, section: "PLAN" }),
        generateStep({ stepNumber: 2, section: "START" }),
      ],
      tasks: [planTask, startTask],
    });

    it("closes all roadmap sections when all sections complete", async () => {
      const userData = generateUserData({
        taskProgress: {
          [planTaskId]: "COMPLETED",
          [startTaskId]: "NOT_STARTED",
        },
        preferences: generatePreferences({ roadmapOpenSections: ["START"] }),
      });

      setMockRoadmapResponse({
        roadmap,
        isSectionCompletedFn: jest
          .fn()
          .mockReturnValueOnce(false) // was section prev completed
          .mockReturnValueOnce(true), // is section now completed
        currentAndNextSection: () => ({ current: "START", next: undefined }),
      });

      const { queueUpdateTaskProgress, updateQueue } = setupHook(userData);
      act(() => {
        return queueUpdateTaskProgress(startTaskId, "COMPLETED");
      });
      await act(() => {
        return updateQueue.update();
      });

      expect(currentUserData().businesses[currentUserData().currentBusinessID]).toEqual({
        [planTaskId]: "COMPLETED",
        [startTaskId]: "COMPLETED",
      });

      expect(currentUserData().businesses[currentUserData().currentBusinessID].preferences.roadmapOpenSections).toEqual([]);
    });

    it("closes PLAN roadmap section when complete", async () => {
      const userData = generateUserData({
        taskProgress: {
          [planTaskId]: "NOT_STARTED",
          [startTaskId]: "NOT_STARTED",
        },
        preferences: generatePreferences({ roadmapOpenSections: ["PLAN", "START"] }),
      });

      setMockRoadmapResponse({
        roadmap,
        isSectionCompletedFn: jest
          .fn()
          .mockReturnValueOnce(false) // was section prev completed
          .mockReturnValueOnce(true), // is section now completed
        currentAndNextSection: () => ({ current: "PLAN", next: "START" }),
      });

      const { queueUpdateTaskProgress, updateQueue } = setupHook(userData);
      act(() => {
        return queueUpdateTaskProgress(planTaskId, "COMPLETED");
      });
      await act(() => {
        return updateQueue.update();
      });

      expect(currentUserData().businesses[currentUserData().currentBusinessID].taskProgress).toEqual({
        [planTaskId]: "COMPLETED",
        [startTaskId]: "NOT_STARTED",
      });

      expect(currentUserData().businesses[currentUserData().currentBusinessID].preferences.roadmapOpenSections).toEqual(["START"]);
    });
  });
});

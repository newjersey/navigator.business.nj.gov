/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { useUpdateTaskProgress } from "@/lib/data-hooks/useUpdateTaskProgress";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { UpdateQueue } from "@/lib/UpdateQueue";
import {
  WithStatefulUserData,
  currentBusiness,
  setupStatefulUserDataContext,
} from "@/test/mock/withStatefulUserData";
import { generateBusiness, generateUserDataForBusiness } from "@businessnjgovnavigator/shared/test";
import { Business, TaskProgress } from "@businessnjgovnavigator/shared/userData";
import { act, render } from "@testing-library/react";

jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));

describe("useUpdateTaskProgress", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    setupStatefulUserDataContext();
  });

  const setupHook = (
    business: Business,
  ): {
    queueUpdateTaskProgress: (taskId: string, newValue: TaskProgress) => void;
    updateQueue: UpdateQueue;
  } => {
    const returnVal = {
      queueUpdateTaskProgress: (): void => {},
    };
    const updateQueueReturnVal = { updateQueue: undefined };

    function TestComponent(): null {
      Object.assign(returnVal, useUpdateTaskProgress());
      Object.assign(updateQueueReturnVal, useUserData());
      return null;
    }

    render(
      <WithStatefulUserData initialUserData={generateUserDataForBusiness(business)}>
        <TestComponent />
      </WithStatefulUserData>,
    );
    return {
      ...returnVal,
      updateQueue: updateQueueReturnVal.updateQueue!,
    };
  };

  it("updates task progress", async () => {
    const initialBusiness = generateBusiness({
      taskProgress: { "some-id": "COMPLETED" },
    });
    const { queueUpdateTaskProgress, updateQueue } = setupHook(initialBusiness);
    queueUpdateTaskProgress("some-other-id", "TO_DO");
    await act(() => {
      return updateQueue.update();
    });
    expect(currentBusiness().taskProgress).toEqual({
      "some-id": "COMPLETED",
      "some-other-id": "TO_DO",
    });
  });
});

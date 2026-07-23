import { UpdateQueueContext } from "@/contexts/updateQueueContext";
import { UserDataContext, UseUserDataResponse } from "@/contexts/userDataContext";
import * as useUserModule from "@/lib/data-hooks/useUserData";
import { UpdateQueue, UpdateQueueFactory } from "@/lib/UpdateQueue";
import { useMockRoadmap } from "@/test/mock/mockUseRoadmap";
import {
  StatefulDataContext,
  statefulDataHelpers,
  WithStatefulData,
} from "@/test/mock/withStatefulData";
import { UserData } from "@businessnjgovnavigator/shared/";
import { Business } from "@businessnjgovnavigator/shared/userData";
import { fireEvent, screen } from "@testing-library/react";
import { ReactElement, ReactNode, useContext } from "react";

const updateSpy = jest.fn();

export const helpers = statefulDataHelpers(updateSpy);

export const getLastCalledWithConfig = helpers.getLastCalledWithConfig;

export const currentUserData = helpers.currentData as () => UserData;
export const currentBusiness = (): Business => {
  const userData = currentUserData();
  return userData.businesses[userData.currentBusinessId];
};

export const userDataWasNotUpdated = helpers.dataWasNotUpdated;

export const userDataUpdatedNTimes = helpers.dataUpdatedNTimes;

export const triggerQueueUpdate = (): void => {
  fireEvent.click(screen.getByText("trigger queue update"));
};

export const WithStatefulUserData = ({
  children,
  initialUserData,
}: {
  children: ReactNode;
  initialUserData: UserData | undefined;
}): ReactElement => {
  return WithStatefulData(updateSpy)({
    children: <StatefulUserDataProvider>{children}</StatefulUserDataProvider>,
    initialData: initialUserData,
  });
};

const StatefulUserDataProvider = ({ children }: { children: ReactNode }): ReactElement => {
  const { genericData, update } = useContext(StatefulDataContext);
  const { updateQueue, setUpdateQueue } = useContext(UpdateQueueContext);
  const userData = genericData as UserData | undefined;

  const createUpdateQueue = async (newUserData: UserData): Promise<UpdateQueue> => {
    const queue = new UpdateQueueFactory(newUserData, update);
    setUpdateQueue(queue);
    await update(newUserData, { local: true });
    return queue;
  };

  const value: UseUserDataResponse = {
    userData,
    business: userData?.businesses[userData.currentBusinessId],
    isLoading: false,
    error: undefined,
    hasCompletedFetch: true,
    updateQueue,
    createUpdateQueue,
    refresh: jest.fn().mockResolvedValue(undefined),
    clearUserData: jest.fn().mockResolvedValue(undefined),
    clearUserDataError: jest.fn(),
  };

  return <UserDataContext.Provider value={value}>{children}</UserDataContext.Provider>;
};

const mockUseUserData = (useUserModule as jest.Mocked<typeof useUserModule>).useUserData;

export const setupStatefulUserDataContext = (): void => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useMockRoadmap({});
  mockUseUserData.mockImplementation(() => {
    const { genericData, update } = useContext(StatefulDataContext);
    const { updateQueue, setUpdateQueue } = useContext(UpdateQueueContext);

    const createUpdateQueue = async (userData: UserData): Promise<UpdateQueue> => {
      const queue = new UpdateQueueFactory(userData, update);
      setUpdateQueue(queue);
      await update(userData, { local: true });
      return queue;
    };

    const userData = genericData as UserData | undefined;

    return {
      userData,
      business: userData?.businesses[userData?.currentBusinessId],
      isLoading: false,
      error: undefined,
      hasCompletedFetch: true,
      updateQueue: updateQueue,
      createUpdateQueue,
      refresh: jest.fn().mockResolvedValue(undefined),
      clearUserData: jest.fn().mockResolvedValue(undefined),
      clearUserDataError: jest.fn(),
    };
  });
};

import * as useUserModule from "@/lib/data-hooks/useUserData";
import { StatefulDataContext, statefulDataHelpers, WithStatefulData } from "@/test/mock/withStatefulData";
import { UserData } from "@businessnjgovnavigator/shared/";
import { ReactElement, ReactNode, useContext } from "react";

const updateSpy = jest.fn();

export const helpers = statefulDataHelpers(updateSpy);

export const getLastCalledWithConfig = helpers.getLastCalledWithConfig;

export const currentUserData = helpers.currentData as () => UserData;

export const userDataWasNotUpdated = helpers.dataWasNotUpdated;

export const userDataUpdatedNTimes = helpers.dataUpdatedNTimes;

export const WithStatefulUserData = ({
  children,
  initialUserData,
}: {
  children: ReactNode;
  initialUserData: UserData | undefined;
}): ReactElement => WithStatefulData(updateSpy)({ children, initialData: initialUserData });

const mockUseUserData = (useUserModule as jest.Mocked<typeof useUserModule>).useUserData;

export const setupStatefulUserDataContext = (): void => {
  mockUseUserData.mockImplementation(() => {
    const { genericData, update } = useContext(StatefulDataContext);

    return {
      userData: genericData as UserData | undefined,
      isLoading: false,
      error: undefined,
      update: update,
      refresh: jest.fn(),
    };
  });
};

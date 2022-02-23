import * as useUserModule from "@/lib/data-hooks/useUserData";
import { getLastCalledWith, getNumberOfMockCalls } from "@/test/helpers";
import { UserData } from "@businessnjgovnavigator/shared";
import React, { createContext, ReactElement, ReactNode, useContext, useState } from "react";

const updateSpy = jest.fn();

export const getLastCalledWithConfig = (): { local?: boolean } => {
  return getLastCalledWith(updateSpy)[1] as { local?: boolean };
};

export const currentUserData = (): UserData => {
  return getLastCalledWith(updateSpy)[0] as UserData;
};

export const userDataWasNotUpdated = (): boolean => {
  return getLastCalledWith(updateSpy) === undefined;
};

export const userDataUpdatedNTimes = (): number => {
  return getNumberOfMockCalls(updateSpy);
};

export const WithStatefulUserData = ({
  children,
  initialUserData,
}: {
  children: ReactNode;
  initialUserData: UserData | undefined;
}): ReactElement => {
  const [userData, setUserData] = useState<UserData | undefined>(initialUserData);

  const update = (newUserData: UserData | undefined, config?: { local?: boolean }): Promise<void> => {
    updateSpy(newUserData, config);
    setUserData(newUserData);
    return Promise.resolve();
  };

  return (
    <StatefulUserDataContext.Provider value={{ userData, update }}>
      {children}
    </StatefulUserDataContext.Provider>
  );
};

interface StatefulUserDataContextType {
  userData: UserData | undefined;
  update: (userData: UserData | undefined) => Promise<void>;
}

export const StatefulUserDataContext = createContext<StatefulUserDataContextType>({
  userData: undefined,
  update: () => Promise.resolve(),
});

const mockUseUserData = (useUserModule as jest.Mocked<typeof useUserModule>).useUserData;

export const setupStatefulUserDataContext = (): void => {
  mockUseUserData.mockImplementation(() => {
    const { userData, update } = useContext(StatefulUserDataContext);

    return {
      userData: userData,
      isLoading: false,
      error: undefined,
      update: update,
      refresh: jest.fn(),
    };
  });
};

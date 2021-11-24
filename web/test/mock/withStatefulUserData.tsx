import React, { ReactElement, ReactNode, createContext, useContext, useState } from "react";
import { UserData } from "@/lib/types/types";
import * as useUserModule from "@/lib/data-hooks/useUserData";
import { getLastCalledWith } from "@/test/helpers";

const updateSpy = jest.fn();

export const currentUserData = (): UserData => {
  return getLastCalledWith(updateSpy)[0] as UserData;
};

export const WithStatefulUserData = ({
  children,
  initialUserData,
}: {
  children: ReactNode;
  initialUserData: UserData | undefined;
}): ReactElement => {
  const [userData, setUserData] = useState<UserData | undefined>(initialUserData);

  const update = (newUserData: UserData | undefined): Promise<void> => {
    updateSpy(newUserData);
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

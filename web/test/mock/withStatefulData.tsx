/* eslint-disable react/display-name */
/* eslint-disable react-hooks/rules-of-hooks */

import { UpdateQueueContext } from "@/contexts/updateQueueContext";
import { UpdateQueue } from "@/lib/types/types";
import { UpdateQueueFactory } from "@/lib/UpdateQueue";
import { isUserData } from "@/lib/utils/helpers";
import { getLastCalledWith, getNumberOfMockCalls } from "@/test/helpers/helpers-utilities";
import { ProfileData } from "@businessnjgovnavigator/shared/profileData";
import { UserData } from "@businessnjgovnavigator/shared/userData";
import { createContext, ReactElement, ReactNode, useEffect, useState } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GenericData = Record<string, any>;

export const statefulDataHelpers = (
  spy: vi.Mock
): {
  getLastCalledWithConfig: () => { local?: boolean };
  currentData: () => GenericData;
  dataWasNotUpdated: () => boolean;
  dataUpdatedNTimes: () => number;
} => {
  return {
    getLastCalledWithConfig: (): { local?: boolean } => {
      return getLastCalledWith(spy)[1] as { local?: boolean };
    },
    currentData: (): GenericData => {
      return getLastCalledWith(spy)[0] as GenericData;
    },
    dataWasNotUpdated: (): boolean => {
      return getLastCalledWith(spy) === undefined;
    },
    dataUpdatedNTimes: (): number => {
      return getNumberOfMockCalls(spy);
    },
  };
};

type StatefulDataProps = {
  children: ReactNode;
  initialData: GenericData | undefined;
};

export const WithStatefulData = (spy: vi.Mock): ((props: StatefulDataProps) => ReactElement) => {
  type UpdateFn = (newData: GenericData | undefined, config?: { local?: boolean }) => Promise<void>;

  return ({ children, initialData }: StatefulDataProps): ReactElement => {
    const update = (newData: GenericData | undefined, config?: { local?: boolean }): Promise<void> => {
      spy(newData, config);
      setGenericData(newData);
      return Promise.resolve();
    };

    const getUpdateQueue = (update: UpdateFn): UpdateQueue | undefined => {
      if (genericData && isUserData(genericData as UserData | ProfileData)) {
        return new UpdateQueueFactory(genericData as UserData, update);
      }
    };

    const [genericData, setGenericData] = useState<GenericData | undefined>(initialData);
    const [updateQueue, setUpdateQueue] = useState<UpdateQueue | undefined>(getUpdateQueue(update));

    useEffect(() => {
      if (genericData && isUserData(genericData as UserData | ProfileData)) {
        updateQueue?.queue(genericData as UserData);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [genericData]);

    return (
      <UpdateQueueContext.Provider value={{ updateQueue, setUpdateQueue }}>
        <StatefulDataContext.Provider value={{ genericData, update }}>
          {children}
          <button
            onClick={(): void => {
              updateQueue?.update();
            }}
          >
            trigger queue update
          </button>
        </StatefulDataContext.Provider>
      </UpdateQueueContext.Provider>
    );
  };
};

interface StatefulDataContextType {
  genericData: GenericData | undefined;
  update: (genericData: GenericData | undefined, config?: { local?: boolean }) => Promise<void>;
}

export const StatefulDataContext = createContext<StatefulDataContextType>({
  genericData: undefined,
  update: () => {
    return Promise.resolve();
  },
});

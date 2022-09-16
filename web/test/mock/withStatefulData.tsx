/* eslint-disable react/display-name */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { getLastCalledWith, getNumberOfMockCalls } from "@/test/helpers";
import { createContext, ReactElement, ReactNode, useState } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GenericData = Record<string, any>;

export const statefulDataHelpers = (spy: jest.Mock<any, any>) => ({
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
});
export const WithStatefulData =
  (spy: jest.Mock<any, any>) =>
  ({
    children,
    initialData,
  }: {
    children: ReactNode;
    initialData: GenericData | undefined;
  }): ReactElement => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [genericData, setGenericData] = useState<GenericData | undefined>(initialData);

    const update = (newData: GenericData | undefined, config?: { local?: boolean }): Promise<void> => {
      spy(newData, config);
      setGenericData(newData);
      return Promise.resolve();
    };

    return (
      <StatefulDataContext.Provider value={{ genericData, update }}>{children}</StatefulDataContext.Provider>
    );
  };

interface StatefulDataContextType {
  genericData: GenericData | undefined;
  update: (genericData: GenericData | undefined) => Promise<void>;
}

export const StatefulDataContext = createContext<StatefulDataContextType>({
  genericData: undefined,
  update: () => Promise.resolve(),
});

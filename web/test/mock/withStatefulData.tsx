/* eslint-disable react/display-name */
/* eslint-disable react-hooks/rules-of-hooks */

import { UpdateQueueContext } from "@/contexts/updateQueueContext";
import { UpdateQueue } from "@/lib/types/types";
import { UpdateQueueFactory } from "@/lib/UpdateQueue";
import { isUserData } from "@/lib/utils/helpers";
import { getLastCalledWith, getNumberOfMockCalls } from "@/test/helpers/helpers-utilities";
import { getCurrentBusiness, modifyCurrentBusiness } from "@businessnjgovnavigator/shared/index";
import { maskingCharacter, ProfileData } from "@businessnjgovnavigator/shared/profileData";
import { UserData } from "@businessnjgovnavigator/shared/userData";
import { createContext, ReactElement, ReactNode, useEffect, useState } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GenericData = Record<string, any>;

export const statefulDataHelpers = (
  spy: jest.Mock,
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

export const maskTaxId = (taxId: string): string => {
  return taxId.length === 12
    ? `${maskingCharacter.repeat(7)}${taxId.slice(7, taxId.length)}`
    : `${maskingCharacter.repeat(5)}${taxId.slice(5, taxId.length)}`;
};

const mockNonLocalUserDataUpdateSideEffects = (userData: UserData) => {
  const currentBusiness = getCurrentBusiness(userData);
  return modifyCurrentBusiness(userData, (business) => ({
    ...business,
    profileData: {
      ...business.profileData,
      taxId:
        !currentBusiness.profileData.taxId ||
        currentBusiness.profileData.taxId?.includes(maskingCharacter)
          ? currentBusiness.profileData.taxId
          : maskTaxId(currentBusiness.profileData.taxId as string),
      encryptedTaxId:
        !currentBusiness.profileData.taxId ||
        currentBusiness.profileData.taxId?.includes(maskingCharacter)
          ? currentBusiness.profileData.encryptedTaxId
          : `encrypted-${currentBusiness.profileData.taxId}`,
      taxPin:
        !currentBusiness.profileData.taxPin ||
        currentBusiness.profileData.taxPin?.includes(maskingCharacter)
          ? currentBusiness.profileData.taxPin
          : maskingCharacter.repeat(currentBusiness.profileData.taxPin.length),
      encryptedTaxPin:
        !currentBusiness.profileData.taxPin ||
        currentBusiness.profileData.taxPin?.includes(maskingCharacter)
          ? currentBusiness.profileData.encryptedTaxPin
          : `encrypted-${currentBusiness.profileData.taxPin}`,
    },
    taxClearanceCertificateData: business.taxClearanceCertificateData
      ? {
          ...business.taxClearanceCertificateData,
          taxId:
            !currentBusiness.taxClearanceCertificateData?.taxId ||
            currentBusiness.taxClearanceCertificateData?.taxId?.includes(maskingCharacter)
              ? currentBusiness.taxClearanceCertificateData?.taxId
              : maskTaxId(currentBusiness.taxClearanceCertificateData?.taxId as string),
          encryptedTaxId:
            !currentBusiness.taxClearanceCertificateData?.taxId ||
            currentBusiness.taxClearanceCertificateData?.taxId?.includes(maskingCharacter)
              ? currentBusiness.taxClearanceCertificateData?.encryptedTaxId
              : `encrypted-${currentBusiness.taxClearanceCertificateData?.taxId}`,
          taxPin:
            !currentBusiness.taxClearanceCertificateData?.taxPin ||
            currentBusiness.taxClearanceCertificateData?.taxPin?.includes(maskingCharacter)
              ? currentBusiness.taxClearanceCertificateData?.taxPin
              : maskingCharacter.repeat(currentBusiness.taxClearanceCertificateData?.taxPin.length),
          encryptedTaxPin:
            !currentBusiness.taxClearanceCertificateData?.taxPin ||
            currentBusiness.taxClearanceCertificateData?.taxPin?.includes(maskingCharacter)
              ? currentBusiness.taxClearanceCertificateData?.encryptedTaxPin
              : `encrypted-${currentBusiness.taxClearanceCertificateData?.taxPin}`,
        }
      : undefined,
  }));
};

export const WithStatefulData = (spy: jest.Mock): ((props: StatefulDataProps) => ReactElement) => {
  type UpdateFn = (newData: GenericData | undefined, config?: { local?: boolean }) => Promise<void>;

  return ({ children, initialData }: StatefulDataProps): ReactElement => {
    const update = (
      newData: GenericData | undefined,
      config?: { local?: boolean },
    ): Promise<void> => {
      // this is this.updateFunction
      // technically this is missing a  || state.isAuthenticated !== IsAuthenticated.TRUE
      if (!config?.local && isUserData(genericData as UserData | ProfileData)) {
        newData = mockNonLocalUserDataUpdateSideEffects(newData as UserData);
      }
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

import type { ProfileData } from "@businessnjgovnavigator/shared/";
import { type ReactElement, type ReactNode, useEffect, useState } from "react";
import {
  createDataFormErrorMap,
  DataFormErrorMapContext,
} from "@/contexts/dataFormErrorMapContext";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { useFormContextHelper } from "@/lib/data-hooks/useFormContextHelper";
import { getFlow } from "@/lib/utils/helpers";
import { statefulDataHelpers } from "@/test/mock/withStatefulData";

const updateSpy = jest.fn();

export const helpers = statefulDataHelpers(updateSpy);

export const getLastCalledWithConfig = helpers.getLastCalledWithConfig;

export const currentProfileData = helpers.currentData as () => ProfileData;

export const profileDataWasNotUpdated = helpers.dataWasNotUpdated;

export const profileDataUpdatedNTimes = helpers.dataUpdatedNTimes;

export const WithStatefulDataFieldFormContext = ({
  children,
}: {
  children: ReactNode;
}): ReactElement => {
  const { state: formContextState } = useFormContextHelper(createDataFormErrorMap());
  return (
    <DataFormErrorMapContext.Provider value={formContextState}>
      {children}
    </DataFormErrorMapContext.Provider>
  );
};

export const WithStatefulProfileData = ({
  children,
  initialData,
}: {
  children: ReactNode;
  initialData: ProfileData;
}): ReactElement => {
  const [genericData, setGenericData] = useState<ProfileData>(initialData);

  useEffect(() => {
    updateSpy(genericData);
  }, [genericData]);

  return (
    <WithStatefulDataFieldFormContext>
      <ProfileDataContext.Provider
        value={{
          state: {
            page: 1,
            flow: getFlow(genericData),
            profileData: genericData,
          },
          onBack: jest.fn(),
          setProfileData: setGenericData,
        }}
      >
        {children}
      </ProfileDataContext.Provider>{" "}
    </WithStatefulDataFieldFormContext>
  );
};

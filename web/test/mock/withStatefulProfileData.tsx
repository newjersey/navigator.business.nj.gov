import { ProfileDataContext } from "@/contexts/profileDataContext";
import { ProfileFormContext } from "@/contexts/profileFormContext";
import { useFormContextHelper } from "@/lib/data-hooks/useFormContextHelper";
import { createProfileFieldErrorMap } from "@/lib/types/types";
import { getFlow } from "@/lib/utils/helpers";
import { statefulDataHelpers } from "@/test/mock/withStatefulData";
import { ProfileData } from "@businessnjgovnavigator/shared/";
import { ReactElement, ReactNode, useEffect, useState } from "react";

const updateSpy = jest.fn();

export const helpers = statefulDataHelpers(updateSpy);

export const getLastCalledWithConfig = helpers.getLastCalledWithConfig;

export const currentProfileData = helpers.currentData as () => ProfileData;

export const profileDataWasNotUpdated = helpers.dataWasNotUpdated;

export const profileDataUpdatedNTimes = helpers.dataUpdatedNTimes;

export const WithStatefulProfileFormContext = ({ children }: { children: ReactNode }): ReactElement<any> => {
  const { state: formContextState } = useFormContextHelper(createProfileFieldErrorMap());
  return <ProfileFormContext.Provider value={formContextState}>{children}</ProfileFormContext.Provider>;
};

export const WithStatefulProfileData = ({
  children,
  initialData,
}: {
  children: ReactNode;
  initialData: ProfileData;
}): ReactElement<any> => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [genericData, setGenericData] = useState<ProfileData>(initialData);

  useEffect(() => {
    updateSpy(genericData);
  }, [genericData]);

  return (
    <WithStatefulProfileFormContext>
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
    </WithStatefulProfileFormContext>
  );
};

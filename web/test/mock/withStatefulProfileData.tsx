import { ProfileDataContext } from "@/contexts/profileDataContext";
import { getFlow } from "@/lib/utils/helpers";
import { statefulDataHelpers } from "@/test/mock/withStatefulData";
import { createEmptyUser, ProfileData } from "@businessnjgovnavigator/shared/";
import { ReactElement, ReactNode, useState } from "react";

const updateSpy = jest.fn();

export const helpers = statefulDataHelpers(updateSpy);

export const getLastCalledWithConfig = helpers.getLastCalledWithConfig;

export const currentProfileData = helpers.currentData as () => ProfileData;

export const profileDataWasNotUpdated = helpers.dataWasNotUpdated;

export const profileDataUpdatedNTimes = helpers.dataUpdatedNTimes;

export const WithStatefulProfileData = ({
  children,
  initialData,
}: {
  children: ReactNode;
  initialData: ProfileData;
}): ReactElement => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [genericData, setGenericData] = useState<ProfileData>(initialData);

  const update = (newData: ProfileData, config?: { local?: boolean }): Promise<void> => {
    updateSpy(newData, config);
    setGenericData(newData);
    return Promise.resolve();
  };

  return (
    <ProfileDataContext.Provider
      value={{
        state: {
          page: 1,
          user: createEmptyUser(),
          flow: getFlow(genericData),
          profileData: genericData,
        },
        onBack: jest.fn(),
        setProfileData: update,
        setUser: jest.fn(),
      }}
    >
      {children}
    </ProfileDataContext.Provider>
  );
};

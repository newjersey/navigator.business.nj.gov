import { ProfileFormContext } from "@/contexts/profileFormContext";
import { AddressContext } from "@/contexts/addressContext";
import { useFormContextHelper } from "@/lib/data-hooks/useFormContextHelper";
import {createProfileFieldErrorMap, ProfileFields, ReducedFieldStates} from "@/lib/types/types";
import { statefulDataHelpers } from "@/test/mock/withStatefulData";
import { ReactElement, ReactNode, useEffect, useState } from "react";
import {Address} from "@businessnjgovnavigator/shared/userData";
import {FormContextType} from "@/contexts/formContext";

const updateSpy = jest.fn();

export const helpers = statefulDataHelpers(updateSpy);

export const getLastCalledWithConfig = helpers.getLastCalledWithConfig;

export const currentProfileData = helpers.currentData as () => ProfileData;

export const profileDataWasNotUpdated = helpers.dataWasNotUpdated;

export const profileDataUpdatedNTimes = helpers.dataUpdatedNTimes;

export const WithStatefulProfileFormContext = ({ children }: { children: ReactNode }): ReactElement => {
  const { state: formContextState } = useFormContextHelper(createProfileFieldErrorMap());
  return <ProfileFormContext.Provider value={formContextState}>{children}</ProfileFormContext.Provider>;
};

export const WithStatefulProfileData = ({
                                          children,
                                          initialData,
                                        }: {
  children: ReactNode;
  initialData: Address;
}): ReactElement => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    updateSpy(initialData);
  }, [initialData]);


  return (
    <WithStatefulProfileFormContext>
      <AddressContext.Provider
       value={{
          state: {
          addressData: initialData,
            interactedFields: [],
            formContextState: {} as FormContextType<ReducedFieldStates<ProfileFields, unknown>, unknown>,
        },
           setAddressData: jest.fn(),
           setFieldsInteracted:jest.fn(),
        }}
      >
        {children}
      </AddressContext.Provider>{" "}
    </WithStatefulProfileFormContext>
  );
};

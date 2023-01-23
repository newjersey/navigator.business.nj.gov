import { Button } from "@/components/njwds-extended/Button";
import { OnboardingTaxId } from "@/components/onboarding/OnboardingTaxId";
import { AuthAlertContext } from "@/contexts/authAlertContext";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { createProfileFieldErrorMap, ProfileFieldErrorMap, ProfileFields, Task } from "@/lib/types/types";
import { useMountEffectWhenDefined } from "@/lib/utils/helpers";
import { createEmptyProfileData, ProfileData } from "@businessnjgovnavigator/shared/profileData";
import { FormControl } from "@mui/material";
import { ReactElement, useContext, useEffect, useState } from "react";

interface Props {
  task: Task;
}

export const TaxInput = (props: Props): ReactElement => {
  const { userData, updateQueue } = useUserData();
  const { isAuthenticated } = useContext(AuthAlertContext);
  const { Config } = useConfig();
  const [profileData, setProfileData] = useState<ProfileData>(
    userData?.profileData ?? createEmptyProfileData()
  );
  const [fieldStates, setFieldStates] = useState<ProfileFieldErrorMap>(createProfileFieldErrorMap());
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const saveButtonText =
    isAuthenticated === IsAuthenticated.FALSE
      ? `Register & ${Config.tax.saveButtonText}`
      : Config.tax.saveButtonText;

  useEffect(() => {
    if (!userData) {
      return;
    }
    setProfileData(userData.profileData);
  }, [userData]);

  useMountEffectWhenDefined(() => {
    if (!userData || !updateQueue) {
      return;
    }
    if (isAuthenticated === IsAuthenticated.FALSE) {
      return;
    }
    if (
      userData.profileData.taxId &&
      userData.profileData.taxId?.length > 0 &&
      userData.profileData.taxId?.length < 12
    ) {
      updateQueue.queueTaskProgress({ [props.task.id]: "IN_PROGRESS" }).update();
    }
  }, userData && updateQueue);

  const onSubmit = async () => {
    if (!userData || !updateQueue) {
      return;
    }
    const errorMap = {
      ...fieldStates,
      taxId: {
        invalid: profileData.taxId?.length != 12,
      },
    };
    setFieldStates(errorMap);
    if (
      Object.keys(errorMap).some((k) => {
        return errorMap[k as ProfileFields].invalid;
      })
    ) {
      return;
    }

    setIsLoading(true);

    let { taxFilingData } = userData;
    if (userData.profileData.taxId !== profileData.taxId) {
      taxFilingData = { ...taxFilingData, state: undefined, registeredISO: undefined, filings: [] };
    }

    updateQueue
      .queueProfileData(profileData)
      .queueTaxFilingData(taxFilingData)
      .queueTaskProgress({ [props.task.id]: "COMPLETED" })
      .update()
      .then(() => {
        setIsLoading(false);
      });
  };

  const onValidation = (field: ProfileFields, invalid: boolean) => {
    setFieldStates((prevFieldStates) => {
      return { ...prevFieldStates, [field]: { invalid } };
    });
  };

  return (
    <>
      <ProfileDataContext.Provider
        value={{
          state: {
            profileData: profileData,
            flow: "STARTING",
          },
          setProfileData,
          setUser: () => {},
          onBack: () => {},
        }}
      >
        <div className="flex flex-row space-between">
          <OnboardingTaxId onValidation={onValidation} fieldStates={fieldStates} forTaxTask />
          <FormControl margin="dense">
            <Button
              className="margin-top-1 margin-left-1"
              style="secondary"
              onClick={onSubmit}
              loading={isLoading}
              typeSubmit
            >
              <span className="padding-x-3 no-wrap">{saveButtonText}</span>
            </Button>
          </FormControl>
        </div>
      </ProfileDataContext.Provider>
    </>
  );
};

import { SecondaryButton } from "@/components/njwds-extended/SecondaryButton";
import { OnboardingTaxId } from "@/components/onboarding/OnboardingTaxId";
import { AuthAlertContext } from "@/contexts/authAlertContext";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { decryptTaxId } from "@/lib/api-client/apiClient";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { MediaQueries } from "@/lib/PageSizes";
import { createProfileFieldErrorMap, ProfileFieldErrorMap, ProfileFields, Task } from "@/lib/types/types";
import { useMountEffectWhenDefined } from "@/lib/utils/helpers";
import { createEmptyProfileData, ProfileData } from "@businessnjgovnavigator/shared/profileData";
import { useMediaQuery } from "@mui/material";
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
  const isTabletAndUp = useMediaQuery(MediaQueries.tabletAndUp);

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
    if (
      (await decryptTaxId({
        encryptedTaxId: userData.profileData.encryptedTaxId as string,
      })) != profileData.taxId
    ) {
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
        <div className={isTabletAndUp ? "flex flex-row" : "flex flex-column"}>
          <OnboardingTaxId onValidation={onValidation} fieldStates={fieldStates} forTaxTask formInputFull />
          <div className="tablet:margin-top-2 tablet:margin-left-2">
            <SecondaryButton
              isColor="primary"
              onClick={onSubmit}
              isLoading={isLoading}
              isSubmitButton={true}
              isRightMarginRemoved={true}
              isFullWidthOnDesktop={!isTabletAndUp}
            >
              {saveButtonText}
            </SecondaryButton>
          </div>
        </div>
      </ProfileDataContext.Provider>
    </>
  );
};

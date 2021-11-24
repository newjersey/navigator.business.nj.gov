import React, { FormEvent, ReactElement, useEffect, useState } from "react";
import { NumericField } from "@/components/onboarding/NumericField";
import { RoadmapDefaults } from "@/display-defaults/roadmap/RoadmapDefaults";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { OnboardingContext } from "@/pages/onboarding";
import {
  createEmptyProfileData,
  createEmptyProfileDisplayContent,
  OperateDisplayContent,
  ProfileFields,
} from "@/lib/types/types";
import { ProfileData } from "@businessnjgovnavigator/shared/";
import { Alert } from "@/components/njwds/Alert";
import { Content } from "../Content";
import { LoadingButton } from "@/components/njwds-extended/LoadingButton";

interface Props {
  displayContent: OperateDisplayContent;
}

export const OperateEntityIdForm = (props: Props): ReactElement => {
  const { userData, update, refresh } = useUserData();
  const [profileData, setProfileData] = useState<ProfileData>(createEmptyProfileData());
  const [isValid, setIsValid] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMd, setErrorMd] = React.useState<string>("");

  useEffect(() => {
    if (userData) {
      setProfileData(userData.profileData);
    }

    if (userData?.taxFilingData.entityIdStatus !== "UNKNOWN") {
      setIsLoading(false);
    }
  }, [userData, setProfileData]);

  useEffect(
    function showErrorForEntityIdStatus() {
      if (!userData) return;
      if (userData.taxFilingData.entityIdStatus === "NOT_FOUND") {
        setErrorMd(props.displayContent.entityIdErrorNotFoundMd);
      } else if (userData.taxFilingData.entityIdStatus === "EXISTS_NOT_REGISTERED") {
        setErrorMd(props.displayContent.entityIdErrorNotRegisteredMd);
      } else {
        setErrorMd("");
      }
    },
    [setErrorMd, userData, userData?.taxFilingData.entityIdStatus, props.displayContent]
  );

  const onSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    if (!userData || !isValid || !profileData.entityId) {
      setIsValid(false);
      return;
    }

    setIsLoading(true);

    await update({
      ...userData,
      profileData,
      taxFilingData: {
        ...userData.taxFilingData,
        entityIdStatus: "UNKNOWN",
        filings: [],
      },
    });

    await refresh();
  };

  return (
    <OnboardingContext.Provider
      value={{
        state: {
          profileData,
          displayContent: createEmptyProfileDisplayContent(),
          municipalities: [],
        },
        setProfileData,
        onBack: () => {},
      }}
    >
      <div className="margin-top-2">
        <label htmlFor="input-entityId">
          <strong>{RoadmapDefaults.operateEntityIdFieldLabel}</strong>
        </label>
        <form
          onSubmit={onSubmit}
          className="mobile-lg:display-flex mobile-lg:flex-row mobile-lg:flex-justify"
        >
          <NumericField
            onValidation={(field: ProfileFields, invalid: boolean) => {
              setIsValid(!invalid);
            }}
            invalid={!isValid}
            fieldName="entityId"
            length={10}
          />
          <LoadingButton
            type="submit"
            onClick={() => {}}
            loading={isLoading}
            className="usa-button mla height-5 margin-top-2 mobile-lg:margin-top-0"
          >
            {RoadmapDefaults.operateFormSubmitButtonText}
          </LoadingButton>
        </form>
        {errorMd && (
          <Alert
            data-testid={`error-alert-${userData?.taxFilingData.entityIdStatus}`}
            slim
            variant="error"
            className="margin-y-2"
          >
            <Content>{errorMd}</Content>
          </Alert>
        )}
      </div>
    </OnboardingContext.Provider>
  );
};

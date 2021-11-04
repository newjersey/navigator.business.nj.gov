import React, { FormEvent, ReactElement, useEffect, useState } from "react";
import { NumericField } from "@/components/onboarding/NumericField";
import { RoadmapDefaults } from "@/display-defaults/roadmap/RoadmapDefaults";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { OnboardingContext } from "@/pages/onboarding";
import {
  createEmptyProfileData,
  createEmptyProfileDisplayContent,
  OperateDisplayContent,
  ProfileData,
  ProfileFields,
} from "@/lib/types/types";
import { Alert } from "@/components/njwds/Alert";
import { Content } from "../Content";

interface Props {
  displayContent: OperateDisplayContent;
}

export const OperateEntityIdForm = (props: Props): ReactElement => {
  const { userData, update } = useUserData();
  const [profileData, setProfileData] = useState<ProfileData>(createEmptyProfileData());
  const [isValid, setIsValid] = useState<boolean>(true);
  const [errorMd, setErrorMd] = React.useState<string>("");

  useEffect(() => {
    if (userData) {
      setProfileData(userData.profileData);
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
    if (!userData || !isValid) {
      return;
    }

    update({
      ...userData,
      profileData,
      taxFilingData: {
        ...userData.taxFilingData,
        entityIdStatus: "UNKNOWN",
        filings: [],
      },
    });
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
          <button className="usa-button mla height-5 margin-top-2 mobile-lg:margin-top-0" type="submit">
            {RoadmapDefaults.operateFormSubmitButtonText}
          </button>
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

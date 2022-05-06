import { Button } from "@/components/njwds-extended/Button";
import { BusinessPurpose } from "@/components/tasks/business-formation/business/BusinessPurpose";
import { MainBusiness } from "@/components/tasks/business-formation/business/MainBusiness";
import { Provisions } from "@/components/tasks/business-formation/business/Provisions";
import { FormationContext } from "@/components/tasks/business-formation/BusinessFormation";
import { BusinessFormationEmptyFieldAlert } from "@/components/tasks/business-formation/BusinessFormationEmptyFieldAlert";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { FormationFieldErrorMap, FormationFields } from "@/lib/types/types";
import analytics from "@/lib/utils/analytics";
import { scrollToTop, zipCodeRange } from "@/lib/utils/helpers";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { getCurrentDate, parseDate } from "@businessnjgovnavigator/shared/";
import React, { ReactElement, useContext, useMemo, useState } from "react";

export const BusinessSection = (): ReactElement => {
  const { state, setFormationFormData, setErrorMap, setTab } = useContext(FormationContext);
  const [showRequiredFieldsError, setShowRequiredFieldsError] = useState<boolean>(false);
  const { userData, update } = useUserData();

  const requiredFieldsWithError = useMemo(() => {
    const requiredFields: FormationFields[] = [
      "businessName",
      "businessSuffix",
      "businessAddressCity",
      "businessAddressLine1",
      "businessAddressZipCode",
    ];

    const isStartDateValid = (): boolean => {
      if (!state.formationFormData.businessStartDate) return false;
      return (
        parseDate(state.formationFormData.businessStartDate).isValid() &&
        parseDate(state.formationFormData.businessStartDate).isAfter(
          getCurrentDate().subtract(1, "day"),
          "day"
        )
      );
    };

    const invalidFields = requiredFields.filter(
      (it) => state.errorMap[it].invalid || !state.formationFormData[it]
    );

    if (!isStartDateValid()) {
      invalidFields.push("businessStartDate");
    }

    const isValidBusinessAddressZipCode = (): boolean => {
      if (!state.formationFormData.businessAddressZipCode) return false;
      return zipCodeRange(state.formationFormData.businessAddressZipCode);
    };

    if (!isValidBusinessAddressZipCode() && !invalidFields.includes("businessAddressZipCode")) {
      invalidFields.push("businessAddressZipCode");
    }

    return invalidFields;
  }, [state.formationFormData, state.errorMap]);

  const submitBusinessData = async () => {
    if (!userData) return;

    const filteredProvisions = state.formationFormData.provisions.filter((it) => it !== "");
    setFormationFormData({ ...state.formationFormData, provisions: filteredProvisions });

    const finalUserData = {
      ...userData,
      formationData: {
        ...userData.formationData,
        formationFormData: {
          ...state.formationFormData,
          provisions: filteredProvisions,
        },
      },
    };

    if (requiredFieldsWithError.length > 0) {
      setShowRequiredFieldsError(true);
      const newErrorMappedFields = requiredFieldsWithError.reduce(
        (acc: FormationFieldErrorMap, cur: FormationFields) => ({ ...acc, [cur]: { invalid: true } }),
        {} as FormationFieldErrorMap
      );
      setErrorMap({ ...state.errorMap, ...newErrorMappedFields });
      update(finalUserData);
      return;
    }

    update({
      ...finalUserData,
      profileData: {
        ...finalUserData.profileData,
        municipality: state.formationFormData.businessAddressCity,
      },
    });

    analytics.event.business_formation_business_step_continue_button.click.go_to_next_formation_step();

    setShowRequiredFieldsError(false);
    setTab(state.tab + 1);
    scrollToTop();
  };

  return (
    <div data-testid="business-section">
      <MainBusiness />
      {process.env.FEATURE_BUSINESS_PURPOSE && process.env.FEATURE_BUSINESS_PURPOSE == "true" ? (
        <>
          <hr className="margin-bottom-2 margin-top-0" aria-hidden={true} />
          <BusinessPurpose />
          <hr className="margin-bottom-2 margin-top-0" aria-hidden={true} />
          <Provisions />
        </>
      ) : (
        <></>
      )}
      <BusinessFormationEmptyFieldAlert
        showRequiredFieldsError={showRequiredFieldsError}
        requiredFieldsWithError={requiredFieldsWithError}
      />
      <div className="margin-top-2">
        <div className="flex flex-justify-end bg-base-lightest margin-x-neg-205 padding-3 margin-top-3 margin-bottom-neg-205">
          <Button
            style="secondary"
            widthAutoOnMobile
            onClick={() => {
              setTab(state.tab - 1);
              scrollToTop();
            }}
          >
            {Config.businessFormationDefaults.previousButtonText}
          </Button>
          <Button style="primary" onClick={submitBusinessData} widthAutoOnMobile noRightMargin>
            {Config.businessFormationDefaults.nextButtonText}
          </Button>
        </div>
      </div>
    </div>
  );
};

import { Button } from "@/components/njwds-extended/Button";
import { MainBusiness } from "@/components/tasks/business-formation/business/MainBusiness";
import { RegisteredAgent } from "@/components/tasks/business-formation/business/RegisteredAgent";
import { FormationContext } from "@/components/tasks/business-formation/BusinessFormation";
import { BusinessFormationFieldAlert } from "@/components/tasks/business-formation/BusinessFormationFieldAlert";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { FormationFieldErrorMap, FormationFields } from "@/lib/types/types";
import analytics from "@/lib/utils/analytics";
import { scrollToTop, validateEmail, zipCodeRange } from "@/lib/utils/helpers";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { getCurrentDate, parseDate } from "@businessnjgovnavigator/shared/";
import React, { ReactElement, useContext, useMemo, useState } from "react";

export const BusinessSection = (): ReactElement => {
  const { state, setErrorMap, setTab } = useContext(FormationContext);
  const [showRequiredFieldsError, setShowRequiredFieldsError] = useState<boolean>(false);
  const { userData, update } = useUserData();

  const requiredFieldsWithError = useMemo(() => {
    let requiredFields: FormationFields[] = [
      "businessName",
      "businessSuffix",
      "businessAddressCity",
      "businessAddressLine1",
      "businessAddressZipCode",
    ];

    if (state.formationFormData.agentNumberOrManual === "NUMBER") {
      requiredFields = [...requiredFields, "agentNumber"];
    }

    if (state.formationFormData.agentNumberOrManual === "MANUAL_ENTRY") {
      requiredFields = [
        ...requiredFields,
        "agentName",
        "agentEmail",
        "agentOfficeAddressLine1",
        "agentOfficeAddressCity",
        "agentOfficeAddressZipCode",
      ];
    }

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

    const isValidAgentOfficeAddressZipCode = (): boolean => {
      if (!state.formationFormData.agentOfficeAddressZipCode) return false;
      return zipCodeRange(state.formationFormData.agentOfficeAddressZipCode);
    };

    if (
      !isValidAgentOfficeAddressZipCode() &&
      !invalidFields.includes("agentOfficeAddressZipCode") &&
      state.formationFormData.agentNumberOrManual === "MANUAL_ENTRY"
    ) {
      invalidFields.push("agentOfficeAddressZipCode");
    }

    const isValidAgentEmail = (): boolean => {
      if (!state.formationFormData.agentEmail) return false;
      return validateEmail(state.formationFormData.agentEmail);
    };

    if (
      !isValidAgentEmail() &&
      !invalidFields.includes("agentEmail") &&
      state.formationFormData.agentNumberOrManual === "MANUAL_ENTRY"
    ) {
      invalidFields.push("agentEmail");
    }

    return invalidFields;
  }, [state.formationFormData, state.errorMap]);

  const submitBusinessData = async () => {
    if (!userData) return;

    const finalUserData = {
      ...userData,
      formationData: {
        ...userData.formationData,
        formationFormData: state.formationFormData,
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
      <hr className="margin-bottom-2 margin-top-0" aria-hidden={true} />
      <RegisteredAgent />
      <BusinessFormationFieldAlert
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

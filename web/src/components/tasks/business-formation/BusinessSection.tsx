import { Button } from "@/components/njwds-extended/Button";
import { BusinessFormationDefaults } from "@/display-defaults/roadmap/business-formation/BusinessFormationDefaults";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { FormationFieldErrorMap, FormationFields } from "@/lib/types/types";
import { scrollToTop, validateEmail, zipCodeRange } from "@/lib/utils/helpers";
import dayjs from "dayjs";
import React, { ReactElement, useContext, useMemo, useState } from "react";
import { FormationContext } from "../BusinessFormation";
import { BusinessFormationFieldAlert } from "./BusinessFormationFieldAlert";
import { MainBusiness } from "./MainBusiness";
import { RegisteredAgent } from "./RegisteredAgent";

export const BusinessSection = (): ReactElement => {
  const { state, setErrorMap, setTab } = useContext(FormationContext);
  const [showRequiredFieldsError, setShowRequiredFieldsError] = useState<boolean>(false);
  const { userData, update } = useUserData();

  const requiredFieldsWithError = useMemo(() => {
    let requiredFields: FormationFields[] = [
      "businessSuffix",
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
        dayjs(state.formationFormData.businessStartDate).isValid() &&
        dayjs(state.formationFormData.businessStartDate).isAfter(dayjs().subtract(1, "day"), "day")
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

    if (requiredFieldsWithError.length > 0) {
      setShowRequiredFieldsError(true);
      const newErrorMappedFields = requiredFieldsWithError.reduce(
        (acc: FormationFieldErrorMap, cur: FormationFields) => ({ ...acc, [cur]: { invalid: true } }),
        {} as FormationFieldErrorMap
      );
      setErrorMap({ ...state.errorMap, ...newErrorMappedFields });
      return;
    }
    setShowRequiredFieldsError(false);
    setTab(state.tab + 1);
    scrollToTop();
    update({
      ...userData,
      formationData: {
        ...userData.formationData,
        formationFormData: state.formationFormData,
      },
    });
  };

  return (
    <div data-testid="business-section">
      <MainBusiness />
      <RegisteredAgent />
      <BusinessFormationFieldAlert
        showRequiredFieldsError={showRequiredFieldsError}
        requiredFieldsWithError={requiredFieldsWithError}
      />
      <div className="margin-top-2 ">
        <div className="padding-y-205 bg-base-lightest flex flex-justify-end task-submit-button-background">
          <Button style="primary" onClick={submitBusinessData}>
            {BusinessFormationDefaults.initialNextButtonText}
          </Button>
        </div>
      </div>
    </div>
  );
};

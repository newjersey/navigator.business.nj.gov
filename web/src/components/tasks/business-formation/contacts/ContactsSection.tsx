import { Button } from "@/components/njwds-extended/Button";
import { FormationContext } from "@/components/tasks/business-formation/BusinessFormation";
import { BusinessFormationEmptyFieldAlert } from "@/components/tasks/business-formation/BusinessFormationEmptyFieldAlert";
import { BusinessFormationFieldAlert } from "@/components/tasks/business-formation/BusinessFormationFieldAlert";
import { Members } from "@/components/tasks/business-formation/contacts/Members";
import { RegisteredAgent } from "@/components/tasks/business-formation/contacts/RegisteredAgent";
import { Signatures } from "@/components/tasks/business-formation/contacts/Signatures";
import { useUserData } from "@/lib/data-hooks/useUserData";
import {
  FormationErrorTypes,
  FormationFieldErrorMap,
  FormationFieldErrors,
  FormationFields,
} from "@/lib/types/types";
import analytics from "@/lib/utils/analytics";
import { scrollToTop, validateEmail, zipCodeRange } from "@/lib/utils/helpers";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import React, { ReactElement, useContext, useEffect, useMemo, useState } from "react";

export const ContactsSection = (): ReactElement => {
  const { state, setErrorMap, setTab } = useContext(FormationContext);
  const [showRequiredFieldsError, setShowRequiredFieldsError] = useState<boolean>(false);
  const [showSignatureError, setShowSignatureError] = useState<boolean>(false);

  const { userData, update } = useUserData();

  const requiredFieldsWithError = useMemo(() => {
    let requiredFields: FormationFields[] = [];

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

    const invalidFields = requiredFields.filter(
      (it) => state.errorMap[it].invalid || !state.formationFormData[it]
    );

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

  const formationFieldErrors = useMemo((): FormationFieldErrors[] => {
    const invalidFields: FormationFieldErrors[] = [];

    const signErrorType: FormationErrorTypes[] = [];
    const additionalSignersErrorType: FormationErrorTypes[] = [];

    if (!state.formationFormData.signer.name) signErrorType.push("signer-name");
    if (!state.formationFormData.signer.signature) signErrorType.push("signer-checkbox");

    if (signErrorType.length > 0)
      invalidFields.push({
        name: "signer",
        types: signErrorType,
      });

    if (!state.formationFormData.additionalSigners.every((it) => it.name))
      additionalSignersErrorType.push("signer-name");
    if (!state.formationFormData.additionalSigners.every((it) => it.signature))
      additionalSignersErrorType.push("signer-checkbox");

    if (additionalSignersErrorType.length > 0) {
      invalidFields.push({ name: "additionalSigners", types: additionalSignersErrorType });
    }

    return invalidFields;
  }, [state.formationFormData]);

  useEffect(() => {
    if (formationFieldErrors.length === 0) setShowSignatureError(false);
    if (requiredFieldsWithError.length === 0) setShowRequiredFieldsError(false);
  }, [state.formationFormData, formationFieldErrors, requiredFieldsWithError]);

  const submitContactData = async () => {
    if (!userData) return;

    if (formationFieldErrors.length > 0) {
      setShowSignatureError(true);
      const newErrorMappedFields = formationFieldErrors.reduce(
        (acc: FormationFieldErrorMap, cur: FormationFieldErrors) => ({
          ...acc,
          [cur.name]: { invalid: true, types: cur.types },
        }),
        {} as FormationFieldErrorMap
      );
      setErrorMap({ ...state.errorMap, ...newErrorMappedFields });
    }

    if (requiredFieldsWithError.length > 0) {
      setShowRequiredFieldsError(true);
      const newErrorMappedFields = requiredFieldsWithError.reduce(
        (acc: FormationFieldErrorMap, cur: FormationFields) => ({ ...acc, [cur]: { invalid: true } }),
        {} as FormationFieldErrorMap
      );
      setErrorMap({ ...state.errorMap, ...newErrorMappedFields });
    }

    if (formationFieldErrors.length > 0 || requiredFieldsWithError.length > 0) return;

    setShowRequiredFieldsError(false);
    setShowSignatureError(false);

    const formationFormDataWithEmptySignersRemoved = {
      ...state.formationFormData,
      additionalSigners: state.formationFormData.additionalSigners.filter((it) => !!it),
    };

    update({
      ...userData,
      formationData: {
        ...userData.formationData,
        formationFormData: formationFormDataWithEmptySignersRemoved,
      },
    });

    analytics.event.business_formation_contacts_step_continue_button.click.go_to_next_formation_step();
    setTab(state.tab + 1);
    scrollToTop();
  };

  return (
    <>
      <div data-testid="contacts-section">
        <RegisteredAgent />
        <hr className="margin-top-0 margin-bottom-3" />
        <Members />
        <hr className="margin-top-0 margin-bottom-3" />
        <Signatures />
        <BusinessFormationFieldAlert
          showFieldsError={showSignatureError}
          fieldsWithError={formationFieldErrors}
        />
        <BusinessFormationEmptyFieldAlert
          showRequiredFieldsError={showRequiredFieldsError}
          requiredFieldsWithError={requiredFieldsWithError}
        />
      </div>
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
          <Button style="primary" onClick={submitContactData} widthAutoOnMobile noRightMargin>
            {Config.businessFormationDefaults.nextButtonText}
          </Button>
        </div>
      </div>
    </>
  );
};

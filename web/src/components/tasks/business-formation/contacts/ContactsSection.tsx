import { Button } from "@/components/njwds-extended/Button";
import { BusinessFormationEmptyFieldAlert } from "@/components/tasks/business-formation/BusinessFormationEmptyFieldAlert";
import { BusinessFormationFieldAlert } from "@/components/tasks/business-formation/BusinessFormationFieldAlert";
import { Addresses } from "@/components/tasks/business-formation/contacts/Addresses";
import { Members } from "@/components/tasks/business-formation/contacts/Members";
import { RegisteredAgent } from "@/components/tasks/business-formation/contacts/RegisteredAgent";
import { Signatures } from "@/components/tasks/business-formation/contacts/Signatures";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
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
import { corpLegalStructures } from "@businessnjgovnavigator/shared/";
import { FormationFormData } from "@businessnjgovnavigator/shared/formationData";
import { ReactElement, useContext, useEffect, useMemo, useState } from "react";

export const ContactsSection = (): ReactElement => {
  const { state, setErrorMap, setTab, setFormationFormData } = useContext(BusinessFormationContext);
  const [showRequiredFieldsError, setShowRequiredFieldsError] = useState<boolean>(false);
  const [showSignatureError, setShowSignatureError] = useState<boolean>(false);
  const { userData, update } = useUserData();

  const isCorp = corpLegalStructures.includes(state.legalStructureId);

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

    if (state.formationFormData.members.length === 0 && isCorp)
      invalidFields.push({ name: "members", types: ["director-minimum"] });

    if (!state.formationFormData.signers.every((it) => it.name)) signErrorType.push("signer-name");

    if (!state.formationFormData.signers.every((it) => it.signature)) signErrorType.push("signer-checkbox");

    if (state.formationFormData.signers.length === 0) signErrorType.push("signer-minimum");

    if (signErrorType.length > 0) invalidFields.push({ name: "signers", types: signErrorType });

    return invalidFields;
  }, [state.formationFormData, isCorp]);

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
      signers: state.formationFormData.signers.filter((it) => !!it),
    };

    sendSubmitAnalytics(formationFormDataWithEmptySignersRemoved);

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

  const sendSubmitAnalytics = (formationFormData: FormationFormData): void => {
    if (formationFormData.agentNumberOrManual === "NUMBER") {
      analytics.event.business_formation_registered_agent_identification.submit.entered_agent_ID();
    } else if (formationFormData.agentNumberOrManual === "MANUAL_ENTRY") {
      analytics.event.business_formation_registered_agent_identification.submit.identified_agent_manually();
      if (formationFormData.agentUseBusinessAddress) {
        analytics.event.business_formation_registered_agent_manual_address.submit.address_is_same_as_account_holder();
      }
      if (formationFormData.agentUseAccountInfo) {
        analytics.event.business_formation_registered_agent_manual_name.submit.name_is_same_as_account_holder();
      }
    }
  };

  return (
    <>
      <div data-testid="contacts-section">
        <RegisteredAgent />
        {["limited-liability-company", "c-corporation", "s-corporation"].includes(
          userData?.profileData.legalStructureId ?? ""
        ) ? (
          <>
            <hr className="margin-top-0 margin-bottom-3" />
            <Members />
          </>
        ) : (
          <></>
        )}
        <hr className="margin-top-0 margin-bottom-3" />
        <BusinessFormationFieldAlert
          showFieldsError={showSignatureError}
          fieldsWithError={formationFieldErrors}
          errorType="signature"
        />
        {[...corpLegalStructures, "limited-partnership"].includes(state.legalStructureId) ? (
          <Addresses
            fieldName={"signers"}
            addressData={state.formationFormData.signers}
            setData={(signers) => {
              const members =
                "limited-partnership" === state.legalStructureId ? signers : state.formationFormData.members;
              setFormationFormData({ ...state.formationFormData, signers, members });
              if (state.formationFormData.signers.every((it) => it.signature && it.name)) {
                setErrorMap({ ...state.errorMap, signers: { invalid: false } });
              }
            }}
            defaultAddress={
              "limited-partnership" === state.legalStructureId
                ? {
                    addressCity: state.formationFormData.businessAddressCity?.name as string,
                    addressLine1: state.formationFormData.businessAddressLine1,
                    addressLine2: state.formationFormData.businessAddressLine2,
                    addressState: state.formationFormData.businessAddressState,
                    addressZipCode: state.formationFormData.businessAddressZipCode,
                  }
                : undefined
            }
            needSignature={true}
            displayContent={{
              contentMd: state.displayContent.signatureHeader.contentMd,
              placeholder: state.displayContent.signatureHeader.placeholder ?? "",
              newButtonText: Config.businessFormationDefaults.addNewSignerButtonText,
              alertHeader: Config.businessFormationDefaults.incorporatorsSuccessTextHeader,
              alertBody: Config.businessFormationDefaults.incorporatorsSuccessTextBody,
              title: Config.businessFormationDefaults.incorporatorsModalTitle,
              saveButton: Config.businessFormationDefaults.incorporatorsModalNextButtonText,
            }}
          />
        ) : (
          <Signatures />
        )}
        <BusinessFormationEmptyFieldAlert
          showRequiredFieldsError={showRequiredFieldsError}
          requiredFieldsWithError={requiredFieldsWithError}
        />
        <BusinessFormationFieldAlert
          showFieldsError={showSignatureError}
          fieldsWithError={formationFieldErrors}
          errorType="director"
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

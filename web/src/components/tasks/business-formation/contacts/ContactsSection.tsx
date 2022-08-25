import { Button } from "@/components/njwds-extended/Button";
import { Addresses } from "@/components/tasks/business-formation/contacts/Addresses";
import { Members } from "@/components/tasks/business-formation/contacts/Members";
import { RegisteredAgent } from "@/components/tasks/business-formation/contacts/RegisteredAgent";
import { Signatures } from "@/components/tasks/business-formation/contacts/Signatures";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { FormationErrorType, FormationFieldErrorMap, FormationFieldStatus } from "@/lib/types/types";
import analytics from "@/lib/utils/analytics";
import { scrollToTop, validateEmail, zipCodeRange } from "@/lib/utils/helpers";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import {
  corpLegalStructures,
  FormationAddress,
  FormationFields,
  FormationFormData,
} from "@businessnjgovnavigator/shared/";
import { ReactElement, useContext, useEffect, useMemo } from "react";

export const ContactsSection = (): ReactElement => {
  const { state, setErrorMap, setTab, setFormationFormData, setShowErrors } =
    useContext(BusinessFormationContext);

  const { userData, update } = useUserData();

  const createFormationFieldErrorMap = (values: FormationFieldStatus[]): FormationFieldErrorMap =>
    values.reduce(
      (acc: FormationFieldErrorMap, cur: FormationFieldStatus) => ({ ...acc, [cur.name as string]: cur }),
      {} as FormationFieldErrorMap
    );

  const signersValidation = (signers: FormationAddress[]): FormationFieldStatus => {
    const signerErrorTypes: FormationErrorType[] = [];
    if (!signers.filter((it: FormationAddress) => !!it).every((it: FormationAddress) => it.name))
      signerErrorTypes.push("name");
    if (!signers.filter((it: FormationAddress) => !!it).every((it: FormationAddress) => it.signature))
      signerErrorTypes.push("checkbox");
    if (signers.filter((it: FormationAddress) => !!it).length === 0) signerErrorTypes.push("minimum");
    return { name: "signers", types: signerErrorTypes, invalid: signerErrorTypes.length > 0 };
  };
  const inlineErrors: FormationFieldStatus[] = useMemo(() => {
    const inlineErrors: FormationFieldStatus[] = [];
    if (state.formationFormData.members.length === 0 && corpLegalStructures.includes(state.legalStructureId))
      inlineErrors.push({ name: "members", types: ["minimum", "director"], invalid: true });
    const signersErrors = signersValidation(state.formationFormData.signers);
    if (signersErrors.invalid) inlineErrors.push(signersErrors);
    return inlineErrors;
  }, [state.legalStructureId, state.formationFormData]);

  const fieldErrors: FormationFieldStatus[] = useMemo(() => {
    let requiredFields: FormationFields[] = [];

    if (state.formationFormData.agentNumberOrManual === "NUMBER") {
      requiredFields.push("agentNumber");
    }

    if (state.formationFormData.agentNumberOrManual === "MANUAL_ENTRY") {
      requiredFields = [...requiredFields, "agentName", "agentOfficeAddressLine1", "agentOfficeAddressCity"];
    }

    const invalidRequiredFields = requiredFields.filter(
      (it) => state.errorMap[it].invalid || !state.formationFormData[it]
    );

    const invalidFields: FormationFieldStatus[] = invalidRequiredFields.map((field) => ({
      name: field,
      invalid: true,
    }));

    if (state.formationFormData.agentNumberOrManual === "MANUAL_ENTRY") {
      if (
        state.formationFormData.agentOfficeAddressZipCode
          ? !zipCodeRange(state.formationFormData.agentOfficeAddressZipCode)
          : true
      )
        invalidFields.push({ name: "agentOfficeAddressZipCode", invalid: true });
      if (state.formationFormData.agentEmail ? !validateEmail(state.formationFormData.agentEmail) : true)
        invalidFields.push({ name: "agentEmail", invalid: true });
    }

    return invalidFields;
  }, [state.formationFormData, state.errorMap]);

  useEffect(() => {
    fieldErrors.length === 0 && inlineErrors.length === 0 && setShowErrors(false);
  }, [fieldErrors, inlineErrors, setShowErrors]);

  const submitContactData = async () => {
    if (!userData) return;

    setErrorMap({
      ...state.errorMap,
      ...createFormationFieldErrorMap([...fieldErrors, ...inlineErrors]),
    });

    if (fieldErrors.length > 0 || inlineErrors.length > 0) {
      setShowErrors(true);
      scrollToTop(true);
      return;
    }

    const formationFormDataWithEmptySignersRemoved = {
      ...state.formationFormData,
      signers: state.formationFormData.signers.filter((it: FormationAddress) => !!it),
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
    analytics.event.business_formation_members.submit.members_submitted_with_formation(
      formationFormData.members.length
    );
    analytics.event.business_formation_signers.submit.signers_submitted_with_formation(
      formationFormData.signers.length
    );
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
        {[...corpLegalStructures, "limited-partnership"].includes(state.legalStructureId) ? (
          <Addresses
            fieldName={"signers"}
            addressData={state.formationFormData.signers}
            setData={(signers) => {
              const members =
                "limited-partnership" === state.legalStructureId ? signers : state.formationFormData.members;
              setFormationFormData({ ...state.formationFormData, signers, members });
              setErrorMap({ ...state.errorMap, signers: signersValidation(signers) });
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
      </div>
      <div className="margin-top-2">
        <div className="flex flex-justify-end bg-base-lightest margin-x-neg-4 padding-3 margin-top-3 margin-bottom-neg-4">
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

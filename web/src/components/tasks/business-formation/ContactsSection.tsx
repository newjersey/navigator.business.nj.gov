import { Alert } from "@/components/njwds-extended/Alert";
import { Button } from "@/components/njwds-extended/Button";
import { Members } from "@/components/tasks/business-formation/Members";
import { Signatures } from "@/components/tasks/business-formation/Signatures";
import { FormationContext } from "@/components/tasks/BusinessFormation";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { FormationErrorTypes, FormationFieldErrorMap, FormationFields } from "@/lib/types/types";
import analytics from "@/lib/utils/analytics";
import { camelCaseToSentence, scrollToTop } from "@/lib/utils/helpers";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import React, { ReactElement, useContext, useEffect, useMemo, useState } from "react";

export const ContactsSection = (): ReactElement => {
  const { state, setErrorMap, setTab } = useContext(FormationContext);
  const [showRequiredFieldsError, setShowRequiredFieldsError] = useState<boolean>(false);
  const { userData, update } = useUserData();

  type FormationFieldErrors = { name: FormationFields; types: FormationErrorTypes[] };

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
    if (formationFieldErrors.length === 0) {
      setShowRequiredFieldsError(false);
    }
  }, [state.formationFormData, formationFieldErrors]);

  const submitContactData = async () => {
    if (!userData) return;

    if (formationFieldErrors.length > 0) {
      setShowRequiredFieldsError(true);
      const newErrorMappedFields = formationFieldErrors.reduce(
        (acc: FormationFieldErrorMap, cur: FormationFieldErrors) => ({
          ...acc,
          [cur.name]: { invalid: true, types: cur.types },
        }),
        {} as FormationFieldErrorMap
      );
      setErrorMap({ ...state.errorMap, ...newErrorMappedFields });
      return;
    }

    setShowRequiredFieldsError(false);

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

  //0 is highest priority
  type ErrorMessages = { type: Partial<FormationErrorTypes>; label: string; priority: number };
  const errorMessages: ErrorMessages[] = [
    {
      type: "signer-checkbox",
      label: Config.businessFormationDefaults.signatureCheckboxErrorText,
      priority: 1,
    },
    { type: "signer-name", label: Config.businessFormationDefaults.signersEmptyErrorText, priority: 0 },
  ];

  const getErrorText = (): string => {
    const currentErrorTypes = [
      ...formationFieldErrors.reduce((acc, curr) => {
        curr.types.map((item) => {
          const message = errorMessages.find((message) => message.type == item);
          if (message) acc.add(message);
        });
        return acc;
      }, new Set<ErrorMessages>()),
    ];
    currentErrorTypes.sort((a, b) => a.priority - b.priority);
    return camelCaseToSentence(currentErrorTypes[0]?.label ?? "");
  };

  return (
    <>
      <div data-testid="contacts-section">
        <Members />
        <hr className="margin-top-0 margin-bottom-3" />
        <Signatures />
        {showRequiredFieldsError ? <Alert variant="error">{getErrorText()}</Alert> : <></>}
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

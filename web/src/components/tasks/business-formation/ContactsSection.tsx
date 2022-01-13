import { Button } from "@/components/njwds-extended/Button";
import { BusinessFormationDefaults } from "@/display-defaults/roadmap/business-formation/BusinessFormationDefaults";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { FormationFieldErrorMap, FormationFields } from "@/lib/types/types";
import { scrollToTop } from "@/lib/utils/helpers";
import React, { ReactElement, useContext, useMemo, useState } from "react";
import { FormationContext } from "../BusinessFormation";
import { BusinessFormationFieldAlert } from "./BusinessFormationFieldAlert";
import { Signatures } from "./Signatures";

export const ContactsSection = (): ReactElement => {
  const { state, setErrorMap, setTab } = useContext(FormationContext);
  const [showRequiredFieldsError, setShowRequiredFieldsError] = useState<boolean>(false);
  const { userData, update } = useUserData();

  const requiredFieldsWithError = useMemo(() => {
    const requiredFields: FormationFields[] = ["signer"];

    const invalidFields = requiredFields.filter(
      (it) => state.errorMap[it].invalid || !state.formationFormData[it]
    );

    return invalidFields;
  }, [state.formationFormData, state.errorMap]);

  const submitContactData = async () => {
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
    setTab(3);
    scrollToTop();

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
  };

  if (state.tab !== 2) return <></>;

  return (
    <>
      <div data-testid="contacts-section">
        <Signatures />
        <BusinessFormationFieldAlert
          showRequiredFieldsError={showRequiredFieldsError}
          requiredFieldsWithError={requiredFieldsWithError}
        />
      </div>
      <div className="margin-top-2">
        <div className="padding-y-205 bg-base-lightest flex flex-justify-end task-submit-button-background">
          <Button
            style="secondary"
            onClick={() => {
              setTab(1);
              scrollToTop();
            }}
          >
            {BusinessFormationDefaults.previousButtonText}
          </Button>
          <Button style="primary" onClick={submitContactData}>
            {BusinessFormationDefaults.nextButtonText}
          </Button>
        </div>
      </div>
    </>
  );
};

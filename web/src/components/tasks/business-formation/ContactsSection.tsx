import { Button } from "@/components/njwds-extended/Button";
import { BusinessFormationFieldAlert } from "@/components/tasks/business-formation/BusinessFormationFieldAlert";
import { Members } from "@/components/tasks/business-formation/Members";
import { Signatures } from "@/components/tasks/business-formation/Signatures";
import { FormationContext } from "@/components/tasks/BusinessFormation";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { FormationFieldErrorMap, FormationFields } from "@/lib/types/types";
import analytics from "@/lib/utils/analytics";
import { scrollToTop } from "@/lib/utils/helpers";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import React, { ReactElement, useContext, useMemo, useState } from "react";

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
        <Members />
        <hr />
        <Signatures />
        <BusinessFormationFieldAlert
          showRequiredFieldsError={showRequiredFieldsError}
          requiredFieldsWithError={requiredFieldsWithError}
        />
      </div>
      <div className="margin-top-2">
        <div className="padding-3 bg-base-lightest flex flex-justify-end task-submit-button-background">
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

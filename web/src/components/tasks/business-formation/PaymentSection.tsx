import { Content } from "@/components/Content";
import { Alert } from "@/components/njwds-extended/Alert";
import { Button } from "@/components/njwds-extended/Button";
import * as api from "@/lib/api-client/apiClient";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { FormationFieldErrorMap, FormationFields } from "@/lib/types/types";
import analytics from "@/lib/utils/analytics";
import { scrollToTop } from "@/lib/utils/helpers";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { useRouter } from "next/router";
import React, { ReactElement, useContext, useMemo, useState } from "react";
import { FormationContext } from "../BusinessFormation";
import { BusinessFormationDocuments } from "./BusinessFormationDocuments";
import { BusinessFormationFieldAlert } from "./BusinessFormationFieldAlert";
import { BusinessFormationNotifications } from "./BusinessFormationNotifications";
import { ContactFirstName } from "./ContactFirstName";
import { ContactLastName } from "./ContactLastName";
import { ContactPhoneNumber } from "./ContactPhoneNumber";
import { PaymentTypeTable } from "./PaymentTypeTable";

export const PaymentSection = (): ReactElement => {
  const { state, setErrorMap, setTab, setShowResponseAlert } = useContext(FormationContext);
  const [showRequiredFieldsError, setShowRequiredFieldsError] = useState<boolean>(false);
  const { userData, update } = useUserData();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const requiredFieldsWithError = useMemo(() => {
    const requiredFields: FormationFields[] = [
      "paymentType",
      "contactFirstName",
      "contactLastName",
      "contactPhoneNumber",
    ];

    const invalidFields = requiredFields.filter(
      (it) => state.errorMap[it].invalid || !state.formationFormData[it]
    );

    return invalidFields;
  }, [state.formationFormData, state.errorMap]);

  const submitFormationFormData = async () => {
    if (!userData) return;
    if (requiredFieldsWithError.length > 0) {
      setShowRequiredFieldsError(true);
      const newErrorMappedFields = requiredFieldsWithError.reduce(
        (acc: FormationFieldErrorMap, cur: FormationFields) => ({ ...acc, [cur]: { invalid: true } }),
        {} as FormationFieldErrorMap
      );
      setErrorMap({ ...state.errorMap, ...newErrorMappedFields });

      return;
    } else {
      setShowRequiredFieldsError(false);

      setIsLoading(true);
      analytics.event.business_formation_billing_step_continue_button.click.go_to_next_formation_step();
      const newUserData = await api.postBusinessFormation(
        {
          ...userData,
          formationData: {
            ...userData.formationData,
            formationFormData: state.formationFormData,
          },
        },
        window.location.href
      );

      update(newUserData);

      if (
        newUserData.formationData.formationResponse?.success &&
        newUserData.formationData.formationResponse?.redirect
      ) {
        await router.replace(newUserData.formationData.formationResponse.redirect);
      } else {
        setIsLoading(false);
        setShowResponseAlert(true);
      }
    }
  };

  return (
    <div data-testid="payment-section">
      <Content>{state.displayContent.contactInformation.contentMd}</Content>
      <div className="grid-row grid-gap-2 margin-top-2">
        <div className="form-input margin-bottom-2 tablet:grid-col-6">
          <ContactFirstName />
        </div>
        <div className="form-input margin-bottom-2 tablet:grid-col-6">
          <ContactLastName />
        </div>
      </div>
      <div className="grid-row">
        <div className="tablet:grid-col-6">
          <ContactPhoneNumber />
        </div>
      </div>
      <hr className="margin-bottom-2" />
      <Content>{state.displayContent.services.contentMd}</Content>
      <BusinessFormationDocuments />
      <PaymentTypeTable />
      <BusinessFormationNotifications />
      <div className="margin-top-3">
        <Content>{state.displayContent.disclaimer.contentMd}</Content>
      </div>
      <BusinessFormationFieldAlert
        showRequiredFieldsError={showRequiredFieldsError}
        requiredFieldsWithError={requiredFieldsWithError}
      />
      {userData?.formationData.formationResponse &&
        state.showResponseAlert &&
        !isLoading &&
        !showRequiredFieldsError &&
        userData.formationData.formationResponse.errors.length > 0 && (
          <Alert variant="error" heading={Config.businessFormationDefaults.submitErrorHeading}>
            <ul style={{ wordBreak: "break-word" }}>
              {userData.formationData.formationResponse.errors.map((it) => (
                <li key={it.field}>
                  {it.field}
                  <ul>
                    <li>
                      <Content>{it.message}</Content>
                    </li>
                  </ul>
                </li>
              ))}
            </ul>
          </Alert>
        )}
      <div className="margin-top-2 ">
        <div className="padding-3 bg-base-lightest flex flex-justify-end task-submit-button-background">
          <Button
            style="secondary"
            widthAutoOnMobile
            onClick={() => {
              setTab(state.tab - 1);
              scrollToTop();
              setShowResponseAlert(false);
            }}
          >
            {Config.businessFormationDefaults.previousButtonText}
          </Button>
          <Button
            loading={isLoading}
            widthAutoOnMobile
            noRightMargin
            style="primary"
            onClick={submitFormationFormData}
          >
            {Config.businessFormationDefaults.submitButtonText}
          </Button>
        </div>
      </div>
    </div>
  );
};

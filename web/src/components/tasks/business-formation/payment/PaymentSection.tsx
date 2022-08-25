import { Content } from "@/components/Content";
import { Button } from "@/components/njwds-extended/Button";
import { BusinessFormationInlineFieldAlert } from "@/components/tasks/business-formation/BusinessFormationInlineFieldAlert";
import { BusinessFormationTextField } from "@/components/tasks/business-formation/BusinessFormationTextField";
import { FormationChooseDocuments } from "@/components/tasks/business-formation/payment/FormationChooseDocuments";
import { FormationChooseNotifications } from "@/components/tasks/business-formation/payment/FormationChooseNotifications";
import { PaymentTypeTable } from "@/components/tasks/business-formation/payment/PaymentTypeTable";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import * as api from "@/lib/api-client/apiClient";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { MediaQueries } from "@/lib/PageSizes";
import { FormationFieldErrorMap } from "@/lib/types/types";
import analytics from "@/lib/utils/analytics";
import { getPhoneNumberFormat, scrollToTop } from "@/lib/utils/helpers";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { FormationFields } from "@businessnjgovnavigator/shared";
import { useMediaQuery } from "@mui/material";
import { useRouter } from "next/router";
import { ReactElement, useContext, useMemo, useState } from "react";

export const PaymentSection = (): ReactElement => {
  const { state, setErrorMap, setTab, setShowResponseAlert, setShowErrors, fieldsAreInvalid } =
    useContext(BusinessFormationContext);
  const { userData, update } = useUserData();
  const router = useRouter();
  const isTabletAndUp = useMediaQuery(MediaQueries.tabletAndUp);

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
      setShowErrors(true);
      const newErrorMappedFields = requiredFieldsWithError.reduce(
        (acc: FormationFieldErrorMap, cur: FormationFields) => ({ ...acc, [cur]: { invalid: true } }),
        {} as FormationFieldErrorMap
      );
      setErrorMap({ ...state.errorMap, ...newErrorMappedFields });
      scrollToTop({ smooth: true });
      return;
    }

    setShowErrors(false);

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
      analytics.event.business_formation.submit.go_to_NIC_formation_processing();
      await router.replace(newUserData.formationData.formationResponse.redirect);
    } else {
      analytics.event.business_formation.submit.error_remain_at_formation();
      setIsLoading(false);
      scrollToTop({ smooth: true });
      setShowResponseAlert(true);
    }
  };

  return (
    <div data-testid="payment-section">
      <Content>{Config.businessFormationDefaults.contactInformationHeader}</Content>
      <div className="grid-row grid-gap-2 margin-top-2">
        <div className="form-input margin-bottom-2 tablet:grid-col-6">
          <BusinessFormationTextField
            label={Config.businessFormationDefaults.contactFirstNameLabel}
            placeholder={Config.businessFormationDefaults.contactFirstNamePlaceholder}
            fieldName="contactFirstName"
            required={true}
            error={fieldsAreInvalid(["contactFirstName", "contactLastName"])}
            validationText={Config.businessFormationDefaults.contactFirstNameErrorText}
          />
        </div>
        <div className="form-input margin-bottom-2 tablet:grid-col-6">
          <BusinessFormationTextField
            label={Config.businessFormationDefaults.contactLastNameLabel}
            placeholder={Config.businessFormationDefaults.contactLastNamePlaceholder}
            fieldName="contactLastName"
            inlineErrorStyling={isTabletAndUp}
            required={true}
            validationText={Config.businessFormationDefaults.contactLastNameErrorText}
          />
        </div>
      </div>
      <div className="grid-row">
        <div className="tablet:grid-col-6">
          <div className="form-input margin-bottom-2">
            <BusinessFormationTextField
              validationText={Config.businessFormationDefaults.contactPhoneNumberErrorText}
              label={Config.businessFormationDefaults.contactPhoneNumberLabel}
              placeholder={Config.businessFormationDefaults.contactPhoneNumberPlaceholder}
              fieldName={"contactPhoneNumber"}
              numericProps={{
                maxLength: 10,
              }}
              visualFilter={getPhoneNumberFormat}
            />
          </div>
        </div>
      </div>
      <hr className="margin-bottom-2" />
      <Content>{state.displayContent.services.contentMd}</Content>
      <BusinessFormationInlineFieldAlert fields={["paymentType"]} />
      <FormationChooseDocuments />

      <PaymentTypeTable />
      <hr className="margin-top-4" />
      <FormationChooseNotifications />
      <div className="margin-top-3">
        <Content>{Config.businessFormationDefaults.paymentDisclaimerText}</Content>
      </div>
      <div className="margin-top-2 ">
        <div className="flex flex-justify-end bg-base-lightest margin-x-neg-4 padding-3 margin-top-3 margin-bottom-neg-4">
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

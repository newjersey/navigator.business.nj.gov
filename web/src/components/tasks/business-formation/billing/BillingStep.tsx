import { Content } from "@/components/Content";
import { FormationChooseDocuments } from "@/components/tasks/business-formation/billing/FormationChooseDocuments";
import { FormationChooseNotifications } from "@/components/tasks/business-formation/billing/FormationChooseNotifications";
import { PaymentTypeTable } from "@/components/tasks/business-formation/billing/PaymentTypeTable";
import { BusinessFormationTextField } from "@/components/tasks/business-formation/BusinessFormationTextField";
import { WithErrorBar } from "@/components/WithErrorBar";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useFormationErrors } from "@/lib/data-hooks/useFormationErrors";
import { getPhoneNumberFormat } from "@/lib/utils/helpers";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { ReactElement, useContext } from "react";

export const BillingStep = (): ReactElement => {
  const { state } = useContext(BusinessFormationContext);
  const { doSomeFieldsHaveError, getFieldErrorLabel } = useFormationErrors();

  return (
    <div data-testid="billing-step">
      <Content>{Config.businessFormationDefaults.contactInformationHeader}</Content>
      <WithErrorBar
        hasError={doSomeFieldsHaveError(["contactFirstName", "contactLastName"])}
        type="DESKTOP-ONLY"
        className="grid-row grid-gap-2 margin-top-2"
      >
        <div className="form-input tablet:grid-col-6">
          <BusinessFormationTextField
            label={Config.businessFormationDefaults.contactFirstNameLabel}
            placeholder={Config.businessFormationDefaults.contactFirstNamePlaceholder}
            fieldName="contactFirstName"
            errorBarType="MOBILE-ONLY"
            required={true}
            validationText={getFieldErrorLabel("contactFirstName")}
          />
        </div>
        <div className="form-input tablet:grid-col-6">
          <BusinessFormationTextField
            label={Config.businessFormationDefaults.contactLastNameLabel}
            placeholder={Config.businessFormationDefaults.contactLastNamePlaceholder}
            fieldName="contactLastName"
            errorBarType="MOBILE-ONLY"
            required={true}
            validationText={getFieldErrorLabel("contactLastName")}
          />
        </div>
      </WithErrorBar>
      <div className="grid-row">
        <div className="tablet:grid-col-6">
          <div className="form-input">
            <BusinessFormationTextField
              validationText={Config.businessFormationDefaults.contactPhoneNumberErrorText}
              label={Config.businessFormationDefaults.contactPhoneNumberLabel}
              placeholder={Config.businessFormationDefaults.contactPhoneNumberPlaceholder}
              errorBarType="ALWAYS"
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
      <FormationChooseDocuments />

      <PaymentTypeTable />
      <hr className="margin-top-4" />
      <FormationChooseNotifications />
      <div className="margin-top-3">
        <Content>{Config.businessFormationDefaults.paymentDisclaimerText}</Content>
      </div>
    </div>
  );
};

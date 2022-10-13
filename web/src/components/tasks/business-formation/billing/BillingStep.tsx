import { Content } from "@/components/Content";
import { Alert } from "@/components/njwds-extended/Alert";
import { FormationChooseDocuments } from "@/components/tasks/business-formation/billing/FormationChooseDocuments";
import { FormationChooseNotifications } from "@/components/tasks/business-formation/billing/FormationChooseNotifications";
import { PaymentTypeTable } from "@/components/tasks/business-formation/billing/PaymentTypeTable";
import { BusinessFormationTextField } from "@/components/tasks/business-formation/BusinessFormationTextField";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useFormationErrors } from "@/lib/data-hooks/useFormationErrors";
import { MediaQueries } from "@/lib/PageSizes";
import { getPhoneNumberFormat } from "@/lib/utils/helpers";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { useMediaQuery } from "@mui/material";
import { ReactElement, useContext } from "react";

export const BillingStep = (): ReactElement => {
  const { state } = useContext(BusinessFormationContext);
  const isTabletAndUp = useMediaQuery(MediaQueries.tabletAndUp);
  const { doSomeFieldsHaveError, doesFieldHaveError } = useFormationErrors();

  return (
    <div data-testid="billing-step">
      <Content>{Config.businessFormationDefaults.contactInformationHeader}</Content>
      <div
        className={`grid-row grid-gap-2 margin-top-2 ${isTabletAndUp ? "input-error-bar" : ""} ${
          doSomeFieldsHaveError(["contactFirstName", "contactLastName"]) ? "error" : ""
        }`}
      >
        <div className="form-input tablet:grid-col-6">
          <BusinessFormationTextField
            label={Config.businessFormationDefaults.contactFirstNameLabel}
            placeholder={Config.businessFormationDefaults.contactFirstNamePlaceholder}
            fieldName="contactFirstName"
            required={true}
            inlineErrorStyling={isTabletAndUp}
            error={doesFieldHaveError("contactFirstName")}
            validationText={Config.businessFormationDefaults.contactFirstNameErrorText}
          />
        </div>
        <div className="form-input tablet:grid-col-6">
          <BusinessFormationTextField
            label={Config.businessFormationDefaults.contactLastNameLabel}
            placeholder={Config.businessFormationDefaults.contactLastNamePlaceholder}
            fieldName="contactLastName"
            inlineErrorStyling={isTabletAndUp}
            required={true}
            error={doesFieldHaveError("contactLastName")}
            validationText={Config.businessFormationDefaults.contactLastNameErrorText}
          />
        </div>
      </div>
      <div className="grid-row">
        <div className="tablet:grid-col-6">
          <div className="form-input">
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
      {doesFieldHaveError("paymentType") && (
        <Alert dataTestid="payment-alert" variant="error">
          {Config.businessFormationDefaults.paymentTypeErrorMessage}
        </Alert>
      )}
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

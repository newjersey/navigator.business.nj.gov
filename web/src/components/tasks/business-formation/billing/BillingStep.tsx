import { Content } from "@/components/Content";
import { FormationChooseDocuments } from "@/components/tasks/business-formation/billing/FormationChooseDocuments";
import { FormationChooseNotifications } from "@/components/tasks/business-formation/billing/FormationChooseNotifications";
import { PaymentTypeTable } from "@/components/tasks/business-formation/billing/PaymentTypeTable";
import { BusinessFormationTextField } from "@/components/tasks/business-formation/BusinessFormationTextField";
import { WithErrorBar } from "@/components/WithErrorBar";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useFormationErrors } from "@/lib/data-hooks/useFormationErrors";
import { getPhoneNumberFormat } from "@/lib/utils/helpers";
import { ReactElement } from "react";

export const BillingStep = (): ReactElement => {
  const { Config } = useConfig();
  const { doSomeFieldsHaveError, getFieldErrorLabel } = useFormationErrors();

  return (
    <div data-testid="billing-step">
      <h3>{Config.formation.sections.contactInfoHeader}</h3>
      <WithErrorBar
        hasError={doSomeFieldsHaveError(["contactFirstName", "contactLastName"])}
        type="DESKTOP-ONLY"
        className="grid-row grid-gap-2 margin-top-2"
      >
        <div className="form-input tablet:grid-col-6">
          <BusinessFormationTextField
            label={Config.formation.fields.contactFirstName.label}
            placeholder={Config.formation.fields.contactFirstName.placeholder}
            fieldName="contactFirstName"
            errorBarType="MOBILE-ONLY"
            required={true}
            validationText={getFieldErrorLabel("contactFirstName")}
          />
        </div>
        <div className="form-input tablet:grid-col-6">
          <BusinessFormationTextField
            label={Config.formation.fields.contactLastName.label}
            placeholder={Config.formation.fields.contactLastName.placeholder}
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
              validationText={Config.formation.fields.contactPhoneNumber.error}
              label={Config.formation.fields.contactPhoneNumber.label}
              placeholder={Config.formation.fields.contactPhoneNumber.placeholder}
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
      <h3>{Config.formation.sections.servicesHeader}</h3>
      <Content>{Config.formation.sections.servicesDescription}</Content>
      <FormationChooseDocuments />

      <PaymentTypeTable />
      <hr className="margin-top-4" />
      <FormationChooseNotifications />
      <div className="margin-top-3">
        <Content>{Config.formation.general.paymentDisclaimer}</Content>
      </div>
    </div>
  );
};

import { Content } from "@/components/Content";
import { Heading } from "@/components/njwds-extended/Heading";
import { FormationChooseDocuments } from "@/components/tasks/business-formation/billing/FormationChooseDocuments";
import { FormationChooseNotifications } from "@/components/tasks/business-formation/billing/FormationChooseNotifications";
import { PaymentTypeTable } from "@/components/tasks/business-formation/billing/PaymentTypeTable";
import { BusinessFormationTextField } from "@/components/tasks/business-formation/BusinessFormationTextField";
import { FormationField } from "@/components/tasks/business-formation/FormationField";
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
      <Heading level={3}>{Config.formation.sections.contactInfoHeader}</Heading>
      <WithErrorBar
        hasError={doSomeFieldsHaveError(["contactFirstName", "contactLastName"])}
        type="DESKTOP-ONLY"
      >
        <div className="grid-row grid-gap-1">
          <div className="margin-top-2 tablet:grid-col-6">
            <FormationField fieldName="contactFirstName">
              <BusinessFormationTextField
                label={Config.formation.fields.contactFirstName.label}
                fieldName="contactFirstName"
                errorBarType="MOBILE-ONLY"
                required={true}
                validationText={getFieldErrorLabel("contactFirstName")}
              />
            </FormationField>
          </div>
          <div className="margin-top-2 tablet:grid-col-6">
            <FormationField fieldName="contactLastName">
              <BusinessFormationTextField
                label={Config.formation.fields.contactLastName.label}
                fieldName="contactLastName"
                errorBarType="MOBILE-ONLY"
                required={true}
                validationText={getFieldErrorLabel("contactLastName")}
              />
            </FormationField>
          </div>
        </div>
      </WithErrorBar>
      <div className="grid-row grid-gap-1">
        <div className="margin-top-2 tablet:grid-col-6">
          <FormationField fieldName="contactPhoneNumber">
            <BusinessFormationTextField
              validationText={Config.formation.fields.contactPhoneNumber.error}
              label={Config.formation.fields.contactPhoneNumber.label}
              errorBarType="ALWAYS"
              fieldName="contactPhoneNumber"
              numericProps={{
                maxLength: 10,
              }}
              visualFilter={getPhoneNumberFormat}
            />
          </FormationField>
        </div>
      </div>
      <hr className="margin-y-3" />
      <Heading level={3}>{Config.formation.sections.servicesHeader}</Heading>
      <Content>{Config.formation.sections.servicesDescription}</Content>
      <FormationChooseDocuments />
      <PaymentTypeTable />
      <div className="padding-top-2">
        <em className="padding-left-2">{Config.formation.fields.paymentType.costTotalPaymentDisclaimer}</em>
      </div>
      <hr className="margin-y-3" />
      <FormationChooseNotifications />
      <div className="margin-y-1">
        <Content>{Config.formation.general.paymentDisclaimer}</Content>
      </div>
    </div>
  );
};

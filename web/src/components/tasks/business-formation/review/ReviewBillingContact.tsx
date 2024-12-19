import { ReviewLineItem } from "@/components/tasks/business-formation/review/section/ReviewLineItem";
import { ReviewSubSection } from "@/components/tasks/business-formation/review/section/ReviewSubSection";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { getPhoneNumberFormat } from "@/lib/utils/helpers";
import { ReactElement, useContext } from "react";

export const ReviewBillingContact = (): ReactElement<any> => {
  const { Config } = useConfig();
  const { state } = useContext(BusinessFormationContext);

  return (
    <ReviewSubSection
      header={Config.formation.sections.review.billingContactHeader}
      marginOverride="margin-top-0"
    >
      <ReviewLineItem
        label={Config.formation.fields.contactFirstName.label}
        value={state.formationFormData.contactFirstName}
      />
      <ReviewLineItem
        label={Config.formation.fields.contactLastName.label}
        value={state.formationFormData.contactLastName}
      />
      <ReviewLineItem
        label={Config.formation.fields.contactPhoneNumber.label}
        value={state.formationFormData.contactPhoneNumber}
        dataTestId="contact-phone-number-field"
        formatter={state.formationFormData.contactPhoneNumber ? getPhoneNumberFormat : undefined}
      />
    </ReviewSubSection>
  );
};

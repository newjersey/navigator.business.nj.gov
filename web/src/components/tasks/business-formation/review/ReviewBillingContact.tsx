import { ReviewLineItem } from "@/components/tasks/business-formation/review/section/ReviewLineItem";
import { ReviewSection } from "@/components/tasks/business-formation/review/section/ReviewSection";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { ReactElement, useContext } from "react";

export const ReviewBillingContact = (): ReactElement => {
  const { Config } = useConfig();
  const { state } = useContext(BusinessFormationContext);
  const italicNotEnteredText = `*${Config.formation.general.notEntered}*`;

  return (
    <ReviewSection
      buttonText={Config.formation.general.editButtonText}
      header={Config.formation.sections.review.billingContactHeader}
      stepName="Billing"
      testId="edit-billing-contact-step"
    >
      <ReviewLineItem
        label={Config.formation.fields.contactFirstName.label}
        value={state.formationFormData.contactFirstName || italicNotEnteredText}
      />
      <ReviewLineItem
        label={Config.formation.fields.contactLastName.label}
        value={state.formationFormData.contactLastName || italicNotEnteredText}
      />
      <ReviewLineItem
        label={Config.formation.fields.contactPhoneNumber.label}
        value={state.formationFormData.contactPhoneNumber || italicNotEnteredText}
      />
    </ReviewSection>
  );
};

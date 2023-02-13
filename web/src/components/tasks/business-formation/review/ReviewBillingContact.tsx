import { ReviewLineItem } from "@/components/tasks/business-formation/review/ReviewLineItem";
import { ReviewSectionHeader } from "@/components/tasks/business-formation/review/ReviewSectionHeader";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { ReactElement, useContext } from "react";

export const ReviewBillingContact = (): ReactElement => {
  const { Config } = useConfig();
  const { state } = useContext(BusinessFormationContext);
  const italicNotEnteredText = `*${Config.formation.general.notEntered}*`;

  return (
    <>
      <ReviewSectionHeader
        header={Config.formation.sections.review.billingContactHeader}
        stepName="Billing"
        testId="billing-contact"
      />
      <ReviewLineItem
        label={Config.formation.fields.contactFirstName.reviewStepLabel}
        value={state.formationFormData.contactFirstName || italicNotEnteredText}
      />
      <ReviewLineItem
        label={Config.formation.fields.contactLastName.reviewStepLabel}
        value={state.formationFormData.contactLastName || italicNotEnteredText}
      />
      <ReviewLineItem
        label={Config.formation.fields.contactPhoneNumber.reviewStepLabel}
        value={state.formationFormData.contactPhoneNumber || italicNotEnteredText}
      />
      <hr className="margin-y-205" />
    </>
  );
};

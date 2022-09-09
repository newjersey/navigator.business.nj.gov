import { ReviewLineItem } from "@/components/tasks/business-formation/review/ReviewLineItem";
import { ReviewSectionHeader } from "@/components/tasks/business-formation/review/ReviewSectionHeader";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { ReactElement, useContext } from "react";

export const ReviewBillingContact = (): ReactElement => {
  const { state } = useContext(BusinessFormationContext);
  const italicNotEnteredText = `*${Config.businessFormationDefaults.reviewStepNotEnteredText}*`;

  return (
    <>
      <ReviewSectionHeader
        header={Config.businessFormationDefaults.reviewStepBillingContactHeader}
        stepName="Billing"
        testId="billing-contact"
      />
      <ReviewLineItem
        label={Config.businessFormationDefaults.reviewStepContactFirstName}
        value={state.formationFormData.contactFirstName || italicNotEnteredText}
      />
      <ReviewLineItem
        label={Config.businessFormationDefaults.reviewStepContactLastName}
        value={state.formationFormData.contactLastName || italicNotEnteredText}
      />
      <ReviewLineItem
        label={Config.businessFormationDefaults.reviewStepContactPhone}
        value={state.formationFormData.contactPhoneNumber || italicNotEnteredText}
      />
      <hr className="margin-y-205" />
    </>
  );
};

import { ReviewLineItem } from "@/components/tasks/business-formation/review/ReviewLineItem";
import { ReviewSectionHeader } from "@/components/tasks/business-formation/review/ReviewSectionHeader";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { ReactElement, useContext } from "react";

export const ReviewBillingServices = (): ReactElement => {
  const { state } = useContext(BusinessFormationContext);
  const italicNotEnteredText = `*${Config.businessFormationDefaults.reviewStepNotEnteredText}*`;

  const getDocumentsList = (): string => {
    const docs = [];
    if (state.formationFormData.officialFormationDocument) {
      docs.push(Config.businessFormationDefaults.reviewStepFormationDoc);
    }
    if (state.formationFormData.certificateOfStanding) {
      docs.push(Config.businessFormationDefaults.reviewStepGoodStandingDoc);
    }
    if (state.formationFormData.certifiedCopyOfFormationDocument) {
      docs.push(Config.businessFormationDefaults.reviewStepCertifiedCopyDoc);
    }
    if (docs.length === 0) {
      return italicNotEnteredText;
    }

    return docs.join(", ");
  };

  const getPaymentTypeLabel = (): string => {
    switch (state.formationFormData.paymentType) {
      case "CC":
        return Config.businessFormationDefaults.creditCardPaymentTypeLabel;
      case "ACH":
        return Config.businessFormationDefaults.achPaymentTypeLabel;
      default:
        return italicNotEnteredText;
    }
  };

  return (
    <>
      <ReviewSectionHeader
        header={Config.businessFormationDefaults.reviewStepBillingServicesHeader}
        stepName="Billing"
        testId="billing-services"
      />
      <ReviewLineItem
        label={Config.businessFormationDefaults.reviewStepServices}
        value={getDocumentsList()}
      />
      <ReviewLineItem
        label={Config.businessFormationDefaults.reviewStepPaymentType}
        value={getPaymentTypeLabel()}
      />
    </>
  );
};

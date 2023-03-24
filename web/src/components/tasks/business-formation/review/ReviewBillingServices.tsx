import { ReviewLineItem } from "@/components/tasks/business-formation/review/section/ReviewLineItem";
import { ReviewSection } from "@/components/tasks/business-formation/review/section/ReviewSection";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { ReactElement, useContext } from "react";

export const ReviewBillingServices = (): ReactElement => {
  const { Config } = useConfig();
  const { state } = useContext(BusinessFormationContext);
  const italicNotEnteredText = `*${Config.formation.general.notEntered}*`;

  const getDocumentsList = (): string => {
    const docs = [];
    if (state.formationFormData.officialFormationDocument) {
      docs.push(Config.formation.fields.officialFormationDocument.label);
    }
    if (state.formationFormData.certificateOfStanding) {
      docs.push(Config.formation.fields.certificateOfStanding.label);
    }
    if (state.formationFormData.certifiedCopyOfFormationDocument) {
      docs.push(Config.formation.fields.certifiedCopyOfFormationDocument.label);
    }
    if (docs.length === 0) {
      return italicNotEnteredText;
    }

    return docs.join(", ");
  };

  const getPaymentTypeLabel = (): string => {
    switch (state.formationFormData.paymentType) {
      case "CC":
        return Config.formation.fields.paymentType.creditCardLabel;
      case "ACH":
        return Config.formation.fields.paymentType.achLabel;
      default:
        return italicNotEnteredText;
    }
  };

  return (
    <ReviewSection
      buttonText={Config.formation.general.editButtonText}
      header={Config.formation.fields.paymentType.reviewStepServicesHeader}
      stepName="Billing"
      testId="edit-billing-services-step"
    >
      <ReviewLineItem
        label={Config.formation.fields.paymentType.reviewStepsServicesSelected}
        value={getDocumentsList()}
      />
      <ReviewLineItem label={Config.formation.fields.paymentType.label} value={getPaymentTypeLabel()} />
    </ReviewSection>
  );
};

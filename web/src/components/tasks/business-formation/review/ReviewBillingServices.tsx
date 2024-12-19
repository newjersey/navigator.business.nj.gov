import { ReviewLineItem } from "@/components/tasks/business-formation/review/section/ReviewLineItem";
import { ReviewSubSection } from "@/components/tasks/business-formation/review/section/ReviewSubSection";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { ReactElement, useContext } from "react";

export const ReviewBillingServices = (): ReactElement<any> => {
  const { Config } = useConfig();
  const { state } = useContext(BusinessFormationContext);

  const getDocumentsList = (): string | undefined => {
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
      return undefined;
    }

    return docs.join(", ");
  };

  const getPaymentTypeLabel = (): string | undefined => {
    switch (state.formationFormData.paymentType) {
      case "CC":
        return Config.formation.fields.paymentType.creditCardLabel;
      case "ACH":
        return Config.formation.fields.paymentType.achLabel;
      default:
        return undefined;
    }
  };

  return (
    <ReviewSubSection header={Config.formation.fields.paymentType.reviewStepServicesHeader}>
      <ReviewLineItem
        label={Config.formation.fields.paymentType.reviewStepsServicesSelected}
        value={getDocumentsList()}
      />
      <ReviewLineItem label={Config.formation.fields.paymentType.label} value={getPaymentTypeLabel()} />
    </ReviewSubSection>
  );
};

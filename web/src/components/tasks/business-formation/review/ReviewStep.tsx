import { Content } from "@/components/Content";
import { Alert } from "@/components/njwds-extended/Alert";
import { BusinessNameAndLegalStructure } from "@/components/tasks/business-formation/business/BusinessNameAndLegalStructure";
import { ReviewBillingContact } from "@/components/tasks/business-formation/review/ReviewBillingContact";
import { ReviewBillingServices } from "@/components/tasks/business-formation/review/ReviewBillingServices";
import { ReviewBusinessSuffixAndStartDate } from "@/components/tasks/business-formation/review/ReviewBusinessSuffixAndStartDate";
import { ReviewMainBusinessLocation } from "@/components/tasks/business-formation/review/ReviewMainBusinessLocation";
import { ReviewMembers } from "@/components/tasks/business-formation/review/ReviewMembers";
import { ReviewPartnership } from "@/components/tasks/business-formation/review/ReviewPartnership";
import { ReviewProvisions } from "@/components/tasks/business-formation/review/ReviewProvisions";
import { ReviewRegisteredAgent } from "@/components/tasks/business-formation/review/ReviewRegisteredAgent";
import { ReviewSignatures } from "@/components/tasks/business-formation/review/ReviewSignatures";
import { ReviewText } from "@/components/tasks/business-formation/review/ReviewText";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import analytics from "@/lib/utils/analytics";
import { ReactElement, useContext } from "react";

export const ReviewStep = (): ReactElement => {
  const { state } = useContext(BusinessFormationContext);
  const { Config } = useConfig();

  const isLP = state.formationFormData.legalType === "limited-partnership";
  const hasProvisions = (state.formationFormData.provisions?.length ?? 0) > 0;
  const hasPurpose = !!state.formationFormData.businessPurpose;
  const hasMembers = (state.formationFormData.members?.length ?? 0) > 0;

  return (
    <>
      <div data-testid="review-step">
        <BusinessNameAndLegalStructure isReviewStep />
        <ReviewBusinessSuffixAndStartDate />
        <ReviewMainBusinessLocation />
        {isLP && (
          <ReviewText
            header={Config.formation.fields.combinedInvestment.label}
            fieldName={"combinedInvestment"}
            stepName={"Business"}
          />
        )}
        {isLP && (
          <ReviewText
            header={Config.formation.fields.withdrawals.label}
            fieldName={"withdrawals"}
            stepName={"Business"}
          />
        )}
        {isLP && <ReviewPartnership />}
        {isLP && (
          <ReviewText
            header={Config.formation.fields.dissolution.label}
            fieldName={"dissolution"}
            stepName={"Business"}
          />
        )}
        {hasProvisions && <ReviewProvisions />}
        {hasPurpose && (
          <ReviewText
            header={Config.formation.fields.businessPurpose.label}
            fieldName={"businessPurpose"}
            stepName={"Business"}
          />
        )}
        <ReviewRegisteredAgent />
        {hasMembers && !isLP && <ReviewMembers />}
        <ReviewSignatures />
        <ReviewBillingContact />
        <ReviewBillingServices />
        <hr className="margin-y-205" />
        <Alert variant="info">
          <Content
            onClick={() => {
              return analytics.event.business_formation_review_amendments_external_link;
            }}
          >
            {Config.formation.general.amendmentInfo}
          </Content>
        </Alert>
      </div>
    </>
  );
};

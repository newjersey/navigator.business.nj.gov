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
import { ReviewSection } from "@/components/tasks/business-formation/review/section/ReviewSection";
import { ReviewText } from "@/components/tasks/business-formation/review/section/ReviewText";
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
          <ReviewSection
            buttonText={Config.formation.general.editButtonText}
            header={Config.formation.fields.combinedInvestment.label}
            stepName={"Business"}
            testId="edit-combined-investment-step"
          >
            <ReviewText fieldName={"combinedInvestment"} />
          </ReviewSection>
        )}
        {isLP && (
          <ReviewSection
            buttonText={Config.formation.general.editButtonText}
            header={Config.formation.fields.withdrawals.label}
            stepName={"Business"}
            testId="edit-withdrawls-step"
          >
            <ReviewText fieldName={"withdrawals"} />
          </ReviewSection>
        )}
        {isLP && <ReviewPartnership />}
        {isLP && (
          <ReviewSection
            buttonText={Config.formation.general.editButtonText}
            header={Config.formation.fields.dissolution.label}
            stepName={"Business"}
            testId="edit-dissolution-step"
          >
            <ReviewText fieldName={"dissolution"} />
          </ReviewSection>
        )}
        {hasProvisions && <ReviewProvisions />}
        {hasPurpose && (
          <ReviewSection
            buttonText={Config.formation.general.editButtonText}
            header={Config.formation.fields.businessPurpose.label}
            stepName={"Business"}
            testId="edit-business-purpose-step"
          >
            <ReviewText fieldName={"businessPurpose"} isExpandable={true} />
          </ReviewSection>
        )}
        <ReviewRegisteredAgent />
        {hasMembers && !isLP && <ReviewMembers />}
        <ReviewSignatures />
        <ReviewBillingContact />
        <ReviewBillingServices />
        <Alert variant="info">
          <Content
            onClick={(): void => {
              analytics.event.business_formation_review_amendments_external_link.click.go_to_Treasury_amendments_page();
            }}
          >
            {Config.formation.general.amendmentInfo}
          </Content>
        </Alert>
      </div>
    </>
  );
};

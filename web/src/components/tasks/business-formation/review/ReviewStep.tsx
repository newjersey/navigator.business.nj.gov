import { Content } from "@/components/Content";
import { Alert } from "@/components/njwds-extended/Alert";
import { BusinessNameAndLegalStructure } from "@/components/tasks/business-formation/business/BusinessNameAndLegalStructure";
import { ReviewBillingContact } from "@/components/tasks/business-formation/review/ReviewBillingContact";
import { ReviewBillingServices } from "@/components/tasks/business-formation/review/ReviewBillingServices";
import { ReviewBusinessSuffixAndStartDate } from "@/components/tasks/business-formation/review/ReviewBusinessSuffixAndStartDate";
import { ReviewForeignCertificate } from "@/components/tasks/business-formation/review/ReviewForeignCertificate";
import { ReviewMainBusinessLocation } from "@/components/tasks/business-formation/review/ReviewMainBusinessLocation";
import { ReviewMembers } from "@/components/tasks/business-formation/review/ReviewMembers";
import { ReviewPartnership } from "@/components/tasks/business-formation/review/ReviewPartnership";
import { ReviewProvisions } from "@/components/tasks/business-formation/review/ReviewProvisions";
import { ReviewRegisteredAgent } from "@/components/tasks/business-formation/review/ReviewRegisteredAgent";
import { ReviewSignatures } from "@/components/tasks/business-formation/review/ReviewSignatures";
import { ReviewWillPracticeLaw } from "@/components/tasks/business-formation/review/ReviewWillPracticeLaw";
import { ReviewSection } from "@/components/tasks/business-formation/review/section/ReviewSection";
import { ReviewSubSection } from "@/components/tasks/business-formation/review/section/ReviewSubSection";
import { ReviewText } from "@/components/tasks/business-formation/review/section/ReviewText";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import analytics from "@/lib/utils/analytics";
import { ReactElement, useContext } from "react";

export const ReviewStep = (): ReactElement => {
  const { state } = useContext(BusinessFormationContext);
  const { Config } = useConfig();

  const isLP = state.formationFormData.legalType === "limited-partnership";
  const isForeignCCorp = state.formationFormData.legalType === "foreign-c-corporation";
  const hasProvisions = (state.formationFormData.provisions?.length ?? 0) > 0;
  const hasPurpose = !!state.formationFormData.businessPurpose;
  const hasMembers = (state.formationFormData.members?.length ?? 0) > 0;

  return (
    <>
      <div data-testid="review-step">
        <ReviewSection stepName={"Business"} testId="edit-business-name-step">
          <BusinessNameAndLegalStructure isReviewStep />
          <ReviewBusinessSuffixAndStartDate />
          {isForeignCCorp && (
            <>
              <ReviewWillPracticeLaw willPracticeLaw={state.formationFormData.willPracticeLaw} />
              <ReviewForeignCertificate foreignGoodStandingFile={state.foreignGoodStandingFile} />
            </>
          )}
          <ReviewMainBusinessLocation />

          {isLP && (
            <>
              <ReviewSubSection header={Config.formation.fields.combinedInvestment.label}>
                <ReviewText fieldName={"combinedInvestment"} />
              </ReviewSubSection>
              <ReviewSubSection header={Config.formation.fields.withdrawals.label}>
                <ReviewText fieldName={"withdrawals"} />
              </ReviewSubSection>
              <ReviewPartnership />
              <ReviewSubSection header={Config.formation.fields.dissolution.label}>
                <ReviewText fieldName={"dissolution"} />
              </ReviewSubSection>
            </>
          )}
          {hasProvisions && <ReviewProvisions />}
          {hasPurpose && (
            <ReviewSubSection header={Config.formation.fields.businessPurpose.label}>
              <ReviewText fieldName={"businessPurpose"} isExpandable={true} />
            </ReviewSubSection>
          )}
        </ReviewSection>
        <ReviewSection stepName={"Contacts"} testId="edit-contacts-step">
          <ReviewRegisteredAgent />
          {hasMembers && !isLP && <ReviewMembers />}
          <ReviewSignatures />
        </ReviewSection>
        <ReviewSection stepName={"Billing"} testId="edit-billing-step">
          <ReviewBillingContact />
          <ReviewBillingServices />
        </ReviewSection>
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

import { Content } from "@/components/Content";
import { Alert } from "@/components/njwds-extended/Alert";
import { BusinessNameAndLegalStructure } from "@/components/tasks/business-formation/business/BusinessNameAndLegalStructure";
import { BusinessFormationReviewSection } from "@/components/tasks/business-formation/review/BusinessFormationReviewSection";
import { BusinessFormationReviewText } from "@/components/tasks/business-formation/review/BusinessFormationReviewText";
import { ReviewAdditionalProvisions } from "@/components/tasks/business-formation/review/ReviewAdditionalProvisions";
import { ReviewBillingContact } from "@/components/tasks/business-formation/review/ReviewBillingContact";
import { ReviewBillingServices } from "@/components/tasks/business-formation/review/ReviewBillingServices";
import { ReviewBusinessSuffixAndStartDate } from "@/components/tasks/business-formation/review/ReviewBusinessSuffixAndStartDate";
import { ReviewConfirmation } from "@/components/tasks/business-formation/review/ReviewConfirmation";
import { ReviewForeignCertificate } from "@/components/tasks/business-formation/review/ReviewForeignCertificate";
import { ReviewIsVeteranNonprofit } from "@/components/tasks/business-formation/review/ReviewIsVeteranNonprofit";
import { ReviewMainBusinessLocation } from "@/components/tasks/business-formation/review/ReviewMainBusinessLocation";
import { ReviewMembers } from "@/components/tasks/business-formation/review/ReviewMembers";
import { ReviewNonprofitProvisions } from "@/components/tasks/business-formation/review/ReviewNonprofitProvisions";
import { ReviewPartnership } from "@/components/tasks/business-formation/review/ReviewPartnership";
import { ReviewRegisteredAgent } from "@/components/tasks/business-formation/review/ReviewRegisteredAgent";
import { ReviewSignatures } from "@/components/tasks/business-formation/review/ReviewSignatures";
import { ReviewSubSection } from "@/components/tasks/review-screen-components/ReviewSubSection";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import analytics from "@/lib/utils/analytics";
import { shouldDisplayAddressSection } from "@/lib/utils/formation-helpers";
import { isForeignCorporationOrNonprofit } from "@/lib/utils/helpers";
import { corpLegalStructures } from "@businessnjgovnavigator/shared/formationData";
import { ReactElement, useContext } from "react";

export const ReviewStep = (): ReactElement => {
  const { state } = useContext(BusinessFormationContext);
  const { Config } = useConfig();

  const isLP = state.formationFormData.legalType === "limited-partnership";
  const hasProvisions = (state.formationFormData.additionalProvisions?.length ?? 0) > 0;
  const hasPurpose = !!state.formationFormData.businessPurpose;
  const hasMembers = (state.formationFormData.members?.length ?? 0) > 0;
  const isCorp = corpLegalStructures.includes(state.formationFormData.legalType);
  const isNonProfit = state.formationFormData.legalType === "nonprofit";

  const getProvisionsAndPurposeSections = (): ReactElement => {
    return (
      <>
        {hasProvisions && <ReviewAdditionalProvisions />}
        {hasPurpose && (
          <ReviewSubSection header={Config.formation.fields.businessPurpose.label}>
            <BusinessFormationReviewText fieldName={"businessPurpose"} isExpandable={true} />
          </ReviewSubSection>
        )}
      </>
    );
  };

  return (
    <>
      <Alert variant="warning" className="margin-bottom-4">
        <Content
          onClick={(): void => {
            analytics.event.business_formation_review_amendments_external_link.click.go_to_Treasury_amendments_page();
          }}
        >
          {Config.formation.sections.review.warningAlert}
        </Content>
      </Alert>
      <div data-testid="review-step">
        <BusinessFormationReviewSection stepName={"Business"} dataTestId="edit-business-name-step">
          <BusinessNameAndLegalStructure isReviewStep />
          <ReviewBusinessSuffixAndStartDate />
          {isNonProfit && (
            <ReviewIsVeteranNonprofit value={state.formationFormData.isVeteranNonprofit} />
          )}
          {isForeignCorporationOrNonprofit(state.formationFormData.legalType) && (
            <>
              <hr className="margin-y-205" />
              <ReviewForeignCertificate foreignGoodStandingFile={state.foreignGoodStandingFile} />
            </>
          )}
          {isNonProfit && (
            <>
              <ReviewNonprofitProvisions />
              {getProvisionsAndPurposeSections()}
            </>
          )}
          {shouldDisplayAddressSection(state.formationFormData) && <ReviewMainBusinessLocation />}
          {isLP && (
            <>
              <ReviewSubSection header={Config.formation.fields.combinedInvestment.label}>
                <BusinessFormationReviewText fieldName={"combinedInvestment"} />
              </ReviewSubSection>
              <ReviewSubSection header={Config.formation.fields.withdrawals.label}>
                <BusinessFormationReviewText fieldName={"withdrawals"} />
              </ReviewSubSection>
              <ReviewPartnership />
              <ReviewSubSection header={Config.formation.fields.dissolution.label}>
                <BusinessFormationReviewText fieldName={"dissolution"} />
              </ReviewSubSection>
            </>
          )}
          {!isNonProfit && getProvisionsAndPurposeSections()}
        </BusinessFormationReviewSection>
        <BusinessFormationReviewSection stepName={"Contacts"} dataTestId="edit-contacts-step">
          <ReviewRegisteredAgent />
          {(isNonProfit || isCorp || (!isLP && hasMembers)) && <ReviewMembers />}
          <ReviewSignatures />
        </BusinessFormationReviewSection>
        <BusinessFormationReviewSection stepName={"Billing"} dataTestId="edit-billing-step">
          <ReviewBillingContact />
          <ReviewBillingServices />
        </BusinessFormationReviewSection>
        <ReviewConfirmation />
      </div>
    </>
  );
};

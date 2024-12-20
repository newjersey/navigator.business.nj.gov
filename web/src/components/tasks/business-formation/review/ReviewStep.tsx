import { Content } from "@/components/Content";
import { Alert } from "@/components/njwds-extended/Alert";
import { BusinessNameAndLegalStructure } from "@/components/tasks/business-formation/business/BusinessNameAndLegalStructure";
import { ReviewAdditionalProvisions } from "@/components/tasks/business-formation/review/ReviewAdditionalProvisions";
import { ReviewBillingContact } from "@/components/tasks/business-formation/review/ReviewBillingContact";
import { ReviewBillingServices } from "@/components/tasks/business-formation/review/ReviewBillingServices";
import { ReviewBusinessSuffixAndStartDate } from "@/components/tasks/business-formation/review/ReviewBusinessSuffixAndStartDate";
import { ReviewForeignCertificate } from "@/components/tasks/business-formation/review/ReviewForeignCertificate";
import { ReviewIsVeteranNonprofit } from "@/components/tasks/business-formation/review/ReviewIsVeteranNonprofit";
import { ReviewMainBusinessLocation } from "@/components/tasks/business-formation/review/ReviewMainBusinessLocation";
import { ReviewMembers } from "@/components/tasks/business-formation/review/ReviewMembers";
import { ReviewNonprofitProvisions } from "@/components/tasks/business-formation/review/ReviewNonprofitProvisions";
import { ReviewPartnership } from "@/components/tasks/business-formation/review/ReviewPartnership";
import { ReviewRegisteredAgent } from "@/components/tasks/business-formation/review/ReviewRegisteredAgent";
import { ReviewSignatures } from "@/components/tasks/business-formation/review/ReviewSignatures";
import { ReviewSection } from "@/components/tasks/business-formation/review/section/ReviewSection";
import { ReviewSubSection } from "@/components/tasks/business-formation/review/section/ReviewSubSection";
import { ReviewText } from "@/components/tasks/business-formation/review/section/ReviewText";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import analytics from "@/lib/utils/analytics";
import { shouldDisplayAddressSection } from "@/lib/utils/formation-helpers";
import { isForeignCorporationOrNonprofit } from "@/lib/utils/helpers";
import { corpLegalStructures } from "@businessnjgovnavigator/shared/formationData";
import { ReactElement, useContext } from "react";

export const ReviewStep = (): ReactElement<any> => {
  const { state } = useContext(BusinessFormationContext);
  const { Config } = useConfig();

  const isLP = state.formationFormData.legalType === "limited-partnership";
  const hasProvisions = (state.formationFormData.additionalProvisions?.length ?? 0) > 0;
  const hasPurpose = !!state.formationFormData.businessPurpose;
  const hasMembers = (state.formationFormData.members?.length ?? 0) > 0;
  const isCorp = corpLegalStructures.includes(state.formationFormData.legalType);
  const isNonProfit = state.formationFormData.legalType === "nonprofit";

  const getProvisionsAndPurposeSections = (): ReactElement<any> => {
    return (
      <>
        {hasProvisions && <ReviewAdditionalProvisions />}
        {hasPurpose && (
          <ReviewSubSection header={Config.formation.fields.businessPurpose.label}>
            <ReviewText fieldName={"businessPurpose"} isExpandable={true} />
          </ReviewSubSection>
        )}
      </>
    );
  };

  return (
    <>
      <div data-testid="review-step">
        <ReviewSection stepName={"Business"} testId="edit-business-name-step">
          <BusinessNameAndLegalStructure isReviewStep />
          <ReviewBusinessSuffixAndStartDate />
          {isNonProfit && <ReviewIsVeteranNonprofit value={state.formationFormData.isVeteranNonprofit} />}
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
          {!isNonProfit && getProvisionsAndPurposeSections()}
        </ReviewSection>
        <ReviewSection stepName={"Contacts"} testId="edit-contacts-step">
          <ReviewRegisteredAgent />
          {(isNonProfit || isCorp || (!isLP && hasMembers)) && <ReviewMembers />}
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

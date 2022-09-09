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
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { ReactElement, useContext } from "react";

export const ReviewStep = (): ReactElement => {
  const { state } = useContext(BusinessFormationContext);

  const isLP = state.legalStructureId == "limited-partnership";
  const hasProvisions = state.formationFormData.provisions.length > 0;
  const hasPurpose = !!state.formationFormData.businessPurpose;
  const hasMembers = state.formationFormData.members.length > 0;

  return (
    <>
      <div data-testid="review-step">
        <BusinessNameAndLegalStructure isReviewStep />
        <ReviewBusinessSuffixAndStartDate />
        <ReviewMainBusinessLocation />
        {isLP && (
          <ReviewText
            header={Config.businessFormationDefaults.reviewStepCombinedInvestmentHeader}
            fieldName={"combinedInvestment"}
            stepName={"Business"}
          />
        )}
        {isLP && (
          <ReviewText
            header={Config.businessFormationDefaults.reviewStepWithdrawalsHeader}
            fieldName={"withdrawals"}
            stepName={"Business"}
          />
        )}
        {isLP && <ReviewPartnership />}
        {isLP && (
          <ReviewText
            header={Config.businessFormationDefaults.reviewStepDissolutionHeader}
            fieldName={"dissolution"}
            stepName={"Business"}
          />
        )}
        {hasProvisions && <ReviewProvisions />}
        {hasPurpose && (
          <ReviewText
            header={Config.businessFormationDefaults.reviewStepBusinessPurposeHeader}
            fieldName={"businessPurpose"}
            stepName={"Business"}
          />
        )}
        <ReviewRegisteredAgent />
        {hasMembers && !isLP && <ReviewMembers />}
        <ReviewSignatures />
        <ReviewBillingContact />
        <ReviewBillingServices />
      </div>
    </>
  );
};

import { BusinessNameAndLegalStructure } from "@/components/tasks/business-formation/business/BusinessNameAndLegalStructure";
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

export const ReviewSection = (): ReactElement => {
  const { state } = useContext(BusinessFormationContext);

  return (
    <>
      <div data-testid="review-section">
        <BusinessNameAndLegalStructure reviewPage />
        <ReviewBusinessSuffixAndStartDate />
        <ReviewMainBusinessLocation />
        {state.legalStructureId == "limited-partnership" ? (
          <ReviewText
            header={Config.businessFormationDefaults.reviewPageCombinedInvestmentHeader}
            fieldName={"combinedInvestment"}
            stepName={"Business"}
          />
        ) : null}
        {state.legalStructureId == "limited-partnership" ? (
          <ReviewText
            header={Config.businessFormationDefaults.reviewPageWithdrawalsHeader}
            fieldName={"withdrawals"}
            stepName={"Business"}
          />
        ) : null}
        {state.legalStructureId == "limited-partnership" ? <ReviewPartnership /> : <></>}
        {state.legalStructureId == "limited-partnership" ? (
          <ReviewText
            header={Config.businessFormationDefaults.reviewPageDissolutionHeader}
            fieldName={"dissolution"}
            stepName={"Business"}
          />
        ) : null}
        {state.formationFormData.provisions.length > 0 ? <ReviewProvisions /> : null}
        {state.formationFormData.businessPurpose ? (
          <ReviewText
            header={Config.businessFormationDefaults.reviewPageBusinessPurposeHeader}
            fieldName={"businessPurpose"}
            stepName={"Business"}
          />
        ) : null}
        <ReviewRegisteredAgent />
        {state.formationFormData.members.length > 0 && state.legalStructureId != "limited-partnership" ? (
          <ReviewMembers />
        ) : null}
        <ReviewSignatures />
      </div>
    </>
  );
};

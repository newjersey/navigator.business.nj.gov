import { Content } from "@/components/Content";
import { ModifiedContent } from "@/components/ModifiedContent";
import { ReviewSection } from "@/components/tasks/business-formation/review/section/ReviewSection";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { ReactElement, useContext } from "react";

export const ReviewPartnership = (): ReactElement => {
  const { Config } = useConfig();
  const { state } = useContext(BusinessFormationContext);

  const notEnteredText = (question: string): ReactElement => {
    return (
      <>
        <div>
          <em>{Config.formation.general.notEntered}</em> - {question}
        </div>
      </>
    );
  };

  const displayPartnershipAnswer = (params: {
    radioData: boolean | undefined;
    termsData: string;
    questionText: string;
    yesBody: string;
    noBody: string;
  }): ReactElement => {
    return (
      <>
        {params.radioData === undefined ? (
          notEnteredText(params.questionText)
        ) : (
          <Content className="margin-bottom-2">{params.radioData ? params.yesBody : params.noBody}</Content>
        )}
        {params.radioData && (
          <div className="margin-left-4">
            <em>
              <ModifiedContent>{Config.formation.partnershipRights.reviewStepTermsLabel}</ModifiedContent>
            </em>
            <span className="margin-left-1">{params.termsData}</span>
          </div>
        )}
      </>
    );
  };

  return (
    <ReviewSection
      buttonText={Config.formation.general.editButtonText}
      header={Config.formation.partnershipRights.label}
      stepName="Business"
      testId="edit-partnership-step"
    >
      <div className="" data-testid="partnership">
        <div className="margin-bottom-3">
          {displayPartnershipAnswer({
            radioData: state.formationFormData.canCreateLimitedPartner,
            termsData: state.formationFormData.createLimitedPartnerTerms,
            questionText: Config.formation.fields.canCreateLimitedPartner.body,
            yesBody: Config.formation.fields.canCreateLimitedPartner.reviewStepYes,
            noBody: Config.formation.fields.canCreateLimitedPartner.reviewStepNo,
          })}
        </div>
        <div className="margin-bottom-3">
          {displayPartnershipAnswer({
            radioData: state.formationFormData.canGetDistribution,
            termsData: state.formationFormData.getDistributionTerms,
            questionText: Config.formation.fields.canGetDistribution.body,
            yesBody: Config.formation.fields.canGetDistribution.reviewStepYes,
            noBody: Config.formation.fields.canGetDistribution.reviewStepNo,
          })}
        </div>
        <div className="margin-bottom-3">
          {displayPartnershipAnswer({
            radioData: state.formationFormData.canMakeDistribution,
            termsData: state.formationFormData.makeDistributionTerms,
            questionText: Config.formation.fields.canMakeDistribution.body,
            yesBody: Config.formation.fields.canMakeDistribution.reviewStepYes,
            noBody: Config.formation.fields.canMakeDistribution.reviewStepNo,
          })}
        </div>
      </div>
    </ReviewSection>
  );
};

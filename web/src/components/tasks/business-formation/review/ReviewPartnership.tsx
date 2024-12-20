import { Content } from "@/components/Content";
import { ModifiedContent } from "@/components/ModifiedContent";
import { ReviewSubSection } from "@/components/tasks/business-formation/review/section/ReviewSubSection";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { ReactElement, useContext } from "react";

export const ReviewPartnership = (): ReactElement<any> => {
  const { Config } = useConfig();
  const { state } = useContext(BusinessFormationContext);

  const notEnteredText = (question: string): ReactElement<any> => {
    return (
      <>
        <span className={"bg-accent-warm-extra-light text-italic"}>
          {Config.formation.general.notEntered}
        </span>
        <span>{`- ${question}`}</span>
      </>
    );
  };

  const displayPartnershipAnswer = (params: {
    radioData: boolean | undefined;
    termsData: string;
    questionText: string;
    yesBody: string;
    noBody: string;
  }): ReactElement<any> => {
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
    <ReviewSubSection header={Config.formation.partnershipRights.label}>
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
    </ReviewSubSection>
  );
};

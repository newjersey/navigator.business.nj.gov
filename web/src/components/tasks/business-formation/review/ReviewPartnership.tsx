import { Content } from "@/components/Content";
import { ReviewSectionHeader } from "@/components/tasks/business-formation/review/ReviewSectionHeader";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { ReactElement, useContext } from "react";

export const ReviewPartnership = () => {
  const { Config } = useConfig();
  const { state } = useContext(BusinessFormationContext);

  const notEnteredText = (question: string): ReactElement => {
    return (
      <>
        <div>
          <i>{Config.formation.general.notEntered}</i> - {question}
        </div>
      </>
    );
  };

  const displayPartnershipAnswer = (config: {
    radioData: boolean | undefined;
    termsData: string;
    questionText: string;
    yesBody: string;
    noBody: string;
  }): ReactElement => {
    return (
      <>
        {config.radioData === undefined ? (
          notEnteredText(config.questionText)
        ) : (
          <Content className="margin-bottom-2">{config.radioData ? config.yesBody : config.noBody}</Content>
        )}
        {config.radioData && (
          <Content className="margin-left-4">
            {`${Config.formation.partnershipRights.reviewStepTermsLabel} ${config.termsData}`}
          </Content>
        )}
      </>
    );
  };

  return (
    <>
      <ReviewSectionHeader
        header={Config.formation.partnershipRights.reviewStepHeader}
        stepName="Business"
        testId="partnership"
      />
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
      <hr className="margin-y-205" />
    </>
  );
};

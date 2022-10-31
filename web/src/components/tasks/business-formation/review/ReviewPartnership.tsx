import { Content } from "@/components/Content";
import { ReviewSectionHeader } from "@/components/tasks/business-formation/review/ReviewSectionHeader";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { ReactElement, useContext } from "react";

export const ReviewPartnership = () => {
  const { state } = useContext(BusinessFormationContext);

  const notEnteredText = (question: string): ReactElement => {
    return (
      <>
        <div>
          <i>{Config.businessFormationDefaults.reviewStepNotEnteredText}</i> - {question}
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
            {`${Config.businessFormationDefaults.reviewStepPartnershipTermTitle} ${config.termsData}`}
          </Content>
        )}
      </>
    );
  };

  return (
    <>
      <ReviewSectionHeader
        header={Config.businessFormationDefaults.reviewStepPartnershipHeader}
        stepName="Business"
        testId="partnership"
      />
      <div className="" data-testid="partnership">
        <div className="margin-bottom-3">
          {displayPartnershipAnswer({
            radioData: state.formationFormData.canCreateLimitedPartner,
            termsData: state.formationFormData.createLimitedPartnerTerms,
            questionText: Config.businessFormationDefaults.partnershipRightsCanAssignRights,
            yesBody: Config.businessFormationDefaults.reviewStepPartnershipYesLimitedPartnerBody,
            noBody: Config.businessFormationDefaults.reviewStepPartnershipNoLimitedPartnerBody,
          })}
        </div>
        <div className="margin-bottom-3">
          {displayPartnershipAnswer({
            radioData: state.formationFormData.canGetDistribution,
            termsData: state.formationFormData.getDistributionTerms,
            questionText: Config.businessFormationDefaults.partnershipRightsCanReceiveDistributions,
            yesBody: Config.businessFormationDefaults.reviewStepPartnershipYesCanReceiveDistributions,
            noBody: Config.businessFormationDefaults.reviewStepPartnershipNoCanReceiveDistributions,
          })}
        </div>
        <div className="margin-bottom-3">
          {displayPartnershipAnswer({
            radioData: state.formationFormData.canMakeDistribution,
            termsData: state.formationFormData.makeDistributionTerms,
            questionText: Config.businessFormationDefaults.partnershipRightsCanMakeDistributions,
            yesBody: Config.businessFormationDefaults.reviewStepPartnershipYesCanMakeDistributions,
            noBody: Config.businessFormationDefaults.reviewStepPartnershipNoCanMakeDistributions,
          })}
        </div>
      </div>
      <hr className="margin-y-205" />
    </>
  );
};

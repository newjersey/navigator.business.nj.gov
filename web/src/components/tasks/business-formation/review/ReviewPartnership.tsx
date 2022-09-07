import { Content } from "@/components/Content";
import { Button } from "@/components/njwds-extended/Button";
import { LookupTabIndexByName } from "@/components/tasks/business-formation/BusinessFormationTabsConfiguration";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { scrollToTop, setHeaderRole } from "@/lib/utils/helpers";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { ReactElement, useContext } from "react";

export const ReviewPartnership = () => {
  const { state, setTab } = useContext(BusinessFormationContext);
  const headerLevelTwo = setHeaderRole(2, "h3-styling");

  const notEnteredText = (question: string): ReactElement => (
    <>
      <div>
        <i>{Config.businessFormationDefaults.reviewPageNotEnteredText}</i> - {question}
      </div>
    </>
  );

  const displayPartnershipAnswer = (config: {
    radioData: boolean | undefined;
    termsData: string;
    questionText: string;
    yesBody: string;
    noBody: string;
  }): ReactElement => (
    <>
      {config.radioData === undefined ? (
        notEnteredText(config.questionText)
      ) : (
        <Content className="margin-bottom-2">{config.radioData ? config.yesBody : config.noBody}</Content>
      )}
      {config.radioData && (
        <Content className="margin-left-4">
          {`${Config.businessFormationDefaults.reviewPagePartnershipTermTitle} ${config.termsData}`}
        </Content>
      )}
    </>
  );

  return (
    <>
      <div className="flex space-between">
        <div className="maxw-mobile-lg margin-bottom-2">
          <Content overrides={{ h3: headerLevelTwo }}>
            {Config.businessFormationDefaults.reviewPagePartnershipHeader}
          </Content>
        </div>
        <div className="margin-left-2">
          <Button
            style="tertiary"
            onClick={() => {
              setTab(LookupTabIndexByName("Business"));
              scrollToTop();
            }}
            underline
            dataTestid="edit-partnership"
          >
            {Config.businessFormationDefaults.editButtonText}
          </Button>
        </div>
      </div>
      <div className="" data-testid="partnership">
        <div className="margin-bottom-3">
          {displayPartnershipAnswer({
            radioData: state.formationFormData.canCreateLimitedPartner,
            termsData: state.formationFormData.createLimitedPartnerTerms,
            questionText: Config.businessFormationDefaults.partnershipRightsCanAssignRights,
            yesBody: Config.businessFormationDefaults.reviewPagePartnershipYesLimitedPartnerBody,
            noBody: Config.businessFormationDefaults.reviewPagePartnershipNoLimitedPartnerBody,
          })}
        </div>
        <div className="margin-bottom-3">
          {displayPartnershipAnswer({
            radioData: state.formationFormData.canGetDistribution,
            termsData: state.formationFormData.getDistributionTerms,
            questionText: Config.businessFormationDefaults.partnershipRightsCanReceiveDistributions,
            yesBody: Config.businessFormationDefaults.reviewPagePartnershipYesCanReceiveDistributions,
            noBody: Config.businessFormationDefaults.reviewPagePartnershipNoCanReceiveDistributions,
          })}
        </div>
        <div className="margin-bottom-3">
          {displayPartnershipAnswer({
            radioData: state.formationFormData.canMakeDistribution,
            termsData: state.formationFormData.makeDistributionTerms,
            questionText: Config.businessFormationDefaults.partnershipRightsCanMakeDistributions,
            yesBody: Config.businessFormationDefaults.reviewPagePartnershipYesCanMakeDistributions,
            noBody: Config.businessFormationDefaults.reviewPagePartnershipNoCanMakeDistributions,
          })}
        </div>
      </div>
      <hr className="margin-y-205" />
    </>
  );
};

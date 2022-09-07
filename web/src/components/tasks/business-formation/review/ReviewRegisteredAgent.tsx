import { Content } from "@/components/Content";
import { Button } from "@/components/njwds-extended/Button";
import { LookupTabIndexByName } from "@/components/tasks/business-formation/BusinessFormationTabsConfiguration";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { getStringifiedAddress, scrollToTop, setHeaderRole } from "@/lib/utils/helpers";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { ReactElement, useContext } from "react";

export const ReviewRegisteredAgent = (): ReactElement => {
  const { state, setTab } = useContext(BusinessFormationContext);
  const headerLevelTwo = setHeaderRole(2, "h3-styling");
  const italicNotEnteredText = `*${Config.businessFormationDefaults.reviewPageNotEnteredText}*`;

  return (
    <>
      <div className="flex space-between">
        <div className="maxw-mobile-lg margin-bottom-2">
          <Content overrides={{ h3: headerLevelTwo }}>
            {Config.businessFormationDefaults.reviewPageRegisteredAgentHeader}
          </Content>
        </div>
        <div className="margin-left-2">
          <Button
            style="tertiary"
            onClick={() => {
              setTab(LookupTabIndexByName("Contacts"));
              scrollToTop();
            }}
            underline
            dataTestid="edit-registered-agent-section"
          >
            {Config.businessFormationDefaults.editButtonText}
          </Button>
        </div>
      </div>
      {state.formationFormData.agentNumberOrManual === "NUMBER" && (
        <div className="display-block tablet:display-flex" data-testid="agent-number">
          <div className="text-bold width-11rem">
            <Content>{Config.businessFormationDefaults.reviewPageRegisteredAgentNumberLabel}</Content>
          </div>
          <div>
            {state.formationFormData.agentNumber || (
              <i>{Config.businessFormationDefaults.reviewPageNotEnteredText}</i>
            )}
          </div>
        </div>
      )}
      {state.formationFormData.agentNumberOrManual === "MANUAL_ENTRY" && (
        <div data-testid="agent-manual-entry">
          <div className="display-block tablet:display-flex">
            <div className="text-bold width-11rem">
              <Content>{Config.businessFormationDefaults.reviewPageRegisteredAgentNameLabel}</Content>
            </div>
            <div>
              {state.formationFormData.agentName || (
                <i>{Config.businessFormationDefaults.reviewPageNotEnteredText}</i>
              )}
            </div>
          </div>
          <div className="display-block tablet:display-flex margin-top-1">
            <div className="text-bold width-11rem">
              <Content>{Config.businessFormationDefaults.reviewPageEmailLabel}</Content>
            </div>
            <div>
              {state.formationFormData.agentEmail || (
                <i>{Config.businessFormationDefaults.reviewPageNotEnteredText}</i>
              )}
            </div>
          </div>
          <div className="display-block tablet:display-flex margin-top-1">
            <div className="text-bold width-11rem">
              <Content>{Config.businessFormationDefaults.reviewPageAddressLabel}</Content>
            </div>
            <Content>
              {getStringifiedAddress(
                state.formationFormData.agentOfficeAddressLine1 || italicNotEnteredText,
                state.formationFormData.agentOfficeAddressCity || italicNotEnteredText,
                state.formationFormData.agentOfficeAddressState || italicNotEnteredText,
                state.formationFormData.agentOfficeAddressZipCode || italicNotEnteredText,
                state.formationFormData.agentOfficeAddressLine2
              )}
            </Content>
          </div>
        </div>
      )}

      <hr className="margin-y-205" />
    </>
  );
};

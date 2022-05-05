import { Content } from "@/components/Content";
import { Button } from "@/components/njwds-extended/Button";
import { FormationContext } from "@/components/tasks/business-formation/BusinessFormation";
import { businessFormationTabs } from "@/components/tasks/business-formation/businessFormationTabs";
import { getStringifiedAddress, scrollToTop, setHeaderRole } from "@/lib/utils/helpers";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import React, { ReactElement, useContext } from "react";

export const ReviewRegisteredAgent = (): ReactElement => {
  const { state, setTab } = useContext(FormationContext);
  const headerLevelTwo = setHeaderRole(2, "h3-styling");

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
              setTab(businessFormationTabs.findIndex((obj) => obj.section === "Business"));
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
          <div>{state.formationFormData.agentNumber}</div>
        </div>
      )}
      {state.formationFormData.agentNumberOrManual === "MANUAL_ENTRY" && (
        <div data-testid="agent-manual-entry">
          <div className="display-block tablet:display-flex">
            <div className="text-bold width-11rem">
              <Content>{Config.businessFormationDefaults.reviewPageRegisteredAgentNameLabel}</Content>
            </div>
            <div>{state.formationFormData.agentName}</div>
          </div>
          <div className="display-block tablet:display-flex margin-top-1">
            <div className="text-bold width-11rem">
              <Content>{Config.businessFormationDefaults.reviewPageEmailLabel}</Content>
            </div>
            <div>{state.formationFormData.agentEmail}</div>
          </div>
          <div className="display-block tablet:display-flex margin-top-1">
            <div className="text-bold width-11rem">
              <Content>{Config.businessFormationDefaults.reviewPageAddressLabel}</Content>
            </div>
            <div>
              {getStringifiedAddress(
                state.formationFormData.agentOfficeAddressLine1,
                state.formationFormData.agentOfficeAddressCity,
                state.formationFormData.agentOfficeAddressState,
                state.formationFormData.agentOfficeAddressZipCode,
                state.formationFormData.agentOfficeAddressLine2
              )}
            </div>
          </div>
        </div>
      )}

      <hr className="margin-y-205" />
    </>
  );
};

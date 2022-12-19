import { Content } from "@/components/Content";
import { Button } from "@/components/njwds-extended/Button";
import { LookupStepIndexByName } from "@/components/tasks/business-formation/BusinessFormationStepsConfiguration";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { getStringifiedAddress } from "@/lib/utils/formatters";
import { scrollToTop } from "@/lib/utils/helpers";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { ReactElement, useContext } from "react";

export const ReviewRegisteredAgent = (): ReactElement => {
  const { state, setStepIndex } = useContext(BusinessFormationContext);
  const italicNotEnteredText = `*${Config.businessFormationDefaults.reviewStepNotEnteredText}*`;

  return (
    <>
      <div className="flex space-between">
        <div className="maxw-mobile-lg margin-bottom-2">
          <h2 className="h3-styling">{Config.businessFormationDefaults.reviewStepRegisteredAgentHeader}</h2>
        </div>
        <div className="margin-left-2">
          <Button
            style="tertiary"
            onClick={() => {
              setStepIndex(LookupStepIndexByName("Contacts"));
              scrollToTop();
            }}
            underline
            dataTestid="edit-registered-agent-step"
          >
            {Config.businessFormationDefaults.editButtonText}
          </Button>
        </div>
      </div>
      {state.formationFormData.agentNumberOrManual === "NUMBER" && (
        <div className="display-block tablet:display-flex" data-testid="agent-number">
          <div className="text-bold width-11rem">
            <Content>{Config.businessFormationDefaults.reviewStepRegisteredAgentNumberLabel}</Content>
          </div>
          <div>
            {state.formationFormData.agentNumber || (
              <i>{Config.businessFormationDefaults.reviewStepNotEnteredText}</i>
            )}
          </div>
        </div>
      )}
      {state.formationFormData.agentNumberOrManual === "MANUAL_ENTRY" && (
        <div data-testid="agent-manual-entry">
          <div className="display-block tablet:display-flex">
            <div className="text-bold width-11rem">
              <Content>{Config.businessFormationDefaults.reviewStepRegisteredAgentNameLabel}</Content>
            </div>
            <div>
              {state.formationFormData.agentName || (
                <i>{Config.businessFormationDefaults.reviewStepNotEnteredText}</i>
              )}
            </div>
          </div>
          <div className="display-block tablet:display-flex margin-top-1">
            <div className="text-bold width-11rem">
              <Content>{Config.businessFormationDefaults.reviewStepEmailLabel}</Content>
            </div>
            <div>
              {state.formationFormData.agentEmail || (
                <i>{Config.businessFormationDefaults.reviewStepNotEnteredText}</i>
              )}
            </div>
          </div>
          <div className="display-block tablet:display-flex margin-top-1">
            <div className="text-bold width-11rem">
              <Content>{Config.businessFormationDefaults.reviewStepAddressLabel}</Content>
            </div>
            <Content>
              {getStringifiedAddress({
                addressLine1: state.formationFormData.agentOfficeAddressLine1 || italicNotEnteredText,
                city: state.formationFormData.agentOfficeAddressMunicipality?.name || italicNotEnteredText,
                zipcode: state.formationFormData.agentOfficeAddressZipCode || italicNotEnteredText,
                state: "NJ",
                addressLine2: state.formationFormData.agentOfficeAddressLine2,
              })}
            </Content>
          </div>
        </div>
      )}

      <hr className="margin-y-205" />
    </>
  );
};

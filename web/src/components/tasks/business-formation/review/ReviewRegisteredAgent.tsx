import { UnStyledButton } from "@/components/njwds-extended/UnStyledButton";
import { LookupStepIndexByName } from "@/components/tasks/business-formation/BusinessFormationStepsConfiguration";
import { ReviewLineItem } from "@/components/tasks/business-formation/review/ReviewLineItem";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { getStringifiedAddress } from "@/lib/utils/formatters";
import { scrollToTop } from "@/lib/utils/helpers";
import { ReactElement, useContext } from "react";

export const ReviewRegisteredAgent = (): ReactElement => {
  const { Config } = useConfig();
  const { state, setStepIndex } = useContext(BusinessFormationContext);
  const italicNotEnteredText = `*${Config.formation.general.notEntered}*`;

  return (
    <>
      <div className="flex space-between">
        <div className="maxw-mobile-lg margin-bottom-2">
          <h2 className="h3-styling">{Config.formation.registeredAgent.label}</h2>
        </div>
        <div className="margin-left-2">
          <UnStyledButton
            style="tertiary"
            onClick={(): void => {
              setStepIndex(LookupStepIndexByName("Contacts"));
              scrollToTop();
            }}
            underline
            dataTestid="edit-registered-agent-step"
          >
            {Config.formation.general.editButtonText}
          </UnStyledButton>
        </div>
      </div>
      {state.formationFormData.agentNumberOrManual === "NUMBER" && (
        <ReviewLineItem
          label={Config.formation.fields.agentNumber.label}
          value={state.formationFormData.agentNumber || italicNotEnteredText}
          marginOverride="margin-top-0"
          dataTestId="agent-number"
        />
      )}
      {state.formationFormData.agentNumberOrManual === "MANUAL_ENTRY" && (
        <div data-testid="agent-manual-entry">
          <ReviewLineItem
            label={Config.formation.fields.agentName.label}
            value={state.formationFormData.agentName || italicNotEnteredText}
            marginOverride="margin-top-0"
          />

          <ReviewLineItem
            label={Config.formation.fields.agentEmail.label}
            value={state.formationFormData.agentEmail || italicNotEnteredText}
          />

          <ReviewLineItem
            label={Config.formation.sections.review.addressLabel}
            value={getStringifiedAddress({
              addressLine1: state.formationFormData.agentOfficeAddressLine1 || italicNotEnteredText,
              city: state.formationFormData.agentOfficeAddressMunicipality?.name || italicNotEnteredText,
              zipcode: state.formationFormData.agentOfficeAddressZipCode || italicNotEnteredText,
              state: "NJ",
              addressLine2: state.formationFormData.agentOfficeAddressLine2,
            })}
          />
        </div>
      )}

      <hr className="margin-y-205" />
    </>
  );
};

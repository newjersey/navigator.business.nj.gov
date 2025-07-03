import { ReviewLineItem } from "@/components/tasks/review-screen-components/ReviewLineItem";
import { ReviewSubSection } from "@/components/tasks/review-screen-components/ReviewSubSection";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { ReactElement, useContext } from "react";

export const ReviewRegisteredAgent = (): ReactElement => {
  const { Config } = useConfig();
  const { state } = useContext(BusinessFormationContext);

  return (
    <ReviewSubSection header={Config.formation.registeredAgent.label} marginOverride="margin-top-0">
      {state.formationFormData.agentType === "MYSELF" ||
      state.formationFormData.agentType === "AUTHORIZED_REP" ||
      (state.formationFormData.agentType === "PROFESSIONAL_SERVICE" &&
        state.formationFormData.showManualEntry === true) ? (
        <div data-testid="agent-manual-entry-review">
          <ReviewLineItem
            label={Config.formation.fields.agentName.label}
            value={state.formationFormData.agentName}
            dataTestId="agent-name"
          />

          <ReviewLineItem
            label={Config.formation.fields.agentEmail.label}
            value={state.formationFormData.agentEmail}
            dataTestId="agent-email"
          />

          <ReviewLineItem
            label={Config.formation.fields.agentOfficeAddressLine1.label}
            value={state.formationFormData.agentOfficeAddressLine1}
            dataTestId="agent-office-address-line1"
          />
          {state.formationFormData.addressLine2 && (
            <ReviewLineItem
              label={Config.formation.fields.agentOfficeAddressLine2.label}
              value={state.formationFormData.agentOfficeAddressLine2}
              dataTestId="agent-office-address-line2"
            />
          )}
          <ReviewLineItem
            label={Config.formation.fields.agentOfficeAddressCity.label}
            value={state.formationFormData.agentOfficeAddressCity}
            dataTestId="agent-office-address-city"
          />
          <ReviewLineItem
            label={Config.formation.fields.agentOfficeAddressState.label}
            value={"NJ"}
            dataTestId="agent-office-address-state"
          />
          <ReviewLineItem
            label={Config.formation.fields.agentOfficeAddressZipCode.label}
            value={state.formationFormData.agentOfficeAddressZipCode}
            dataTestId="agent-office-address-zip-code"
          />
        </div>
      ) : (
        state.formationFormData.agentType === "PROFESSIONAL_SERVICE" &&
        state.formationFormData.showManualEntry === false && (
          <div data-testid="agent-professional-service-review">
            <ReviewLineItem
              label={Config.formation.fields.agentNumber.label}
              value={state.formationFormData.agentNumber}
              marginOverride="margin-top-0"
              dataTestId="agent-number"
            />
          </div>
        )
      )}
    </ReviewSubSection>
  );
};

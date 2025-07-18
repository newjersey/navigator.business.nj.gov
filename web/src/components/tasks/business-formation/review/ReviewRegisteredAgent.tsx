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
        <div role="region" aria-label="Manual agent entry review">
          <ReviewLineItem
            label={Config.formation.fields.agentName.label}
            value={state.formationFormData.agentName}
          />

          <ReviewLineItem
            label={Config.formation.fields.agentEmail.label}
            value={state.formationFormData.agentEmail}
          />

          <ReviewLineItem
            label={Config.formation.fields.agentOfficeAddressLine1.label}
            value={state.formationFormData.agentOfficeAddressLine1}
          />
          {state.formationFormData.addressLine2 && (
            <ReviewLineItem
              label={Config.formation.fields.agentOfficeAddressLine2.label}
              value={state.formationFormData.agentOfficeAddressLine2}
            />
          )}
          <ReviewLineItem
            label={Config.formation.fields.agentOfficeAddressCity.label}
            value={state.formationFormData.agentOfficeAddressCity}
          />
          <ReviewLineItem
            label={Config.formation.fields.agentOfficeAddressState.label}
            value={"NJ"}
          />
          <ReviewLineItem
            label={Config.formation.fields.agentOfficeAddressZipCode.label}
            value={state.formationFormData.agentOfficeAddressZipCode}
          />
        </div>
      ) : (
        state.formationFormData.agentType === "PROFESSIONAL_SERVICE" &&
        state.formationFormData.showManualEntry === false && (
          <div role="region" aria-label="Professional service agent review">
            <ReviewLineItem
              label={Config.formation.fields.agentNumber.label}
              value={state.formationFormData.agentNumber}
              marginOverride="margin-top-0"
            />
          </div>
        )
      )}
    </ReviewSubSection>
  );
};

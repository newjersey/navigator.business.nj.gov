import { ReviewLineItem } from "@/components/tasks/business-formation/review/section/ReviewLineItem";
import { ReviewSubSection } from "@/components/tasks/business-formation/review/section/ReviewSubSection";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { ReactElement, useContext } from "react";

export const ReviewRegisteredAgent = (): ReactElement<any> => {
  const { Config } = useConfig();
  const { state } = useContext(BusinessFormationContext);

  return (
    <ReviewSubSection header={Config.formation.registeredAgent.label} marginOverride="margin-top-0">
      {state.formationFormData.agentNumberOrManual === "NUMBER" && (
        <ReviewLineItem
          label={Config.formation.fields.agentNumber.label}
          value={state.formationFormData.agentNumber}
          marginOverride="margin-top-0"
          dataTestId="agent-number"
        />
      )}
      {state.formationFormData.agentNumberOrManual === "MANUAL_ENTRY" && (
        <div data-testid="agent-manual-entry">
          <ReviewLineItem
            label={Config.formation.fields.agentName.label}
            value={state.formationFormData.agentName}
            marginOverride="margin-top-0"
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
          <ReviewLineItem label={Config.formation.fields.agentOfficeAddressState.label} value={"NJ"} />
          <ReviewLineItem
            label={Config.formation.fields.agentOfficeAddressZipCode.label}
            value={state.formationFormData.agentOfficeAddressZipCode}
          />
        </div>
      )}
    </ReviewSubSection>
  );
};

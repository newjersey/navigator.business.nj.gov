import { ReviewLineItem } from "@/components/tasks/business-formation/review/section/ReviewLineItem";
import { ReviewSubSection } from "@/components/tasks/business-formation/review/section/ReviewSubSection";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { getStringifiedAddress } from "@/lib/utils/formatters";
import { ReactElement, useContext } from "react";

export const ReviewRegisteredAgent = (): ReactElement => {
  const { Config } = useConfig();
  const { state } = useContext(BusinessFormationContext);
  const italicNotEnteredText = `*${Config.formation.general.notEntered}*`;

  return (
    <ReviewSubSection header={Config.formation.registeredAgent.label} marginOverride="margin-top-0">
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
    </ReviewSubSection>
  );
};

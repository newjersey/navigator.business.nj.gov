import { Content } from "@/components/Content";
import { getErrorStateForField } from "@/components/tasks/business-formation/getErrorStateForField";
import { SearchBusinessNameForm } from "@/components/tasks/search-business-name/SearchBusinessNameForm";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useFormationErrors } from "@/lib/data-hooks/useFormationErrors";
import { ReactElement, useContext } from "react";
import { BusinessNameUnavailable } from "./BusinessNameUnavailable";

export const BusinessNameStep = (): ReactElement => {
  const { Config } = useConfig();
  const { state } = useContext(BusinessFormationContext);
  const { doesFieldHaveError } = useFormationErrors();
  const FIELD_NAME = "businessName";
  const hasError = doesFieldHaveError(FIELD_NAME);
  
  return (
    <div data-testid="business-name-step">
      <h3>{Config.formation.fields.businessName.header}</h3>
      <Content>{Config.formation.fields.businessName.description}</Content>
      <SearchBusinessNameForm
        businessName={state.formationFormData.businessName}
        config={{
          availableAlertText: Config.formation.fields.businessName.alertAvailable,
          helperText: hasError
            ? getErrorStateForField({
                field: FIELD_NAME,
                formationFormData: state.formationFormData,
                businessNameAvailability: state.businessNameAvailability,
              }).label
            : undefined,
          searchButtonTestId: "business-name-search-submit",
          searchButtonText: Config.searchBusinessNameTask.searchButtonText,
        }}
        hasError={hasError}
        nameAvailability={state.businessNameAvailability}
        unavailable={BusinessNameUnavailable}
      />
    </div>
  );
};

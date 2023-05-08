import { Content } from "@/components/Content";
import { getErrorStateForField } from "@/components/tasks/business-formation/getErrorStateForField";
import { SearchBusinessNameForm } from "@/components/tasks/search-business-name/SearchBusinessNameForm";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useBusinessNameSearch } from "@/lib/data-hooks/useBusinessNameSearch";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useFormationErrors } from "@/lib/data-hooks/useFormationErrors";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { FocusEvent, ReactElement, useContext, useEffect, useRef } from "react";
import { BusinessNameUnavailable } from "./BusinessNameUnavailable";

export const BusinessNameStep = (): ReactElement => {
  const FIELD_NAME = "businessName";
  const { Config } = useConfig();
  const { state, setFormationFormData, setFieldsInteracted } = useContext(BusinessFormationContext);
  const { userData } = useUserData();
  const { updateCurrentName, onBlurNameField } = useBusinessNameSearch({
    isBusinessFormation: true,
    isDba: false,
  });
  const { doesFieldHaveError } = useFormationErrors();
  const mountEffectOccurred = useRef<boolean>(false);

  useEffect(() => {
    if (!userData || !state.hasSetStateFirstTime || mountEffectOccurred.current) return;
    const nameToSet = state.formationFormData.businessName || userData.profileData.businessName;
    updateCurrentName(nameToSet);

    setFormationFormData((prev) => ({ ...prev, businessName: nameToSet }));
    mountEffectOccurred.current = true;
  }, [
    userData,
    state.hasSetStateFirstTime,
    mountEffectOccurred,
    state.formationFormData,
    updateCurrentName,
    setFormationFormData,
  ]);

  const onSubmit = (): void => {
    setFieldsInteracted([FIELD_NAME]);
  };

  const hasError = doesFieldHaveError(FIELD_NAME);
  return (
    <div data-testid="business-name-step">
      <h3>{Config.formation.fields.businessName.header}</h3>
      <Content>{Config.formation.fields.businessName.description}</Content>
      <SearchBusinessNameForm
        unavailable={BusinessNameUnavailable}
        availableAlertText={Config.formation.fields.businessName.alertAvailable}
        onSubmit={onSubmit}
        config={{
          searchButtonText: Config.searchBusinessNameTask.searchButtonText,
          searchButtonTestId: "business-name-search-submit",
        }}
        onBlur={(event: FocusEvent<HTMLInputElement>): void => {
          setFieldsInteracted([FIELD_NAME]);
          onBlurNameField(event.target.value);
        }}
        hasError={hasError}
        helperText={
          hasError
            ? getErrorStateForField({
                field: "businessName",
                formationFormData: state.formationFormData,
                businessNameAvailability: state.businessNameAvailability,
              }).label
            : undefined
        }
      />
    </div>
  );
};

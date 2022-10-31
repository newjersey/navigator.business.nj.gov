import { MunicipalityDropdown } from "@/components/onboarding/MunicipalityDropdown";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { ProfileFieldErrorMap, ProfileFields } from "@/lib/types/types";
import { Municipality } from "@businessnjgovnavigator/shared/";
import { FocusEvent, ReactElement, useContext } from "react";

interface Props {
  onValidation: (field: ProfileFields, invalid: boolean) => void;
  fieldStates: ProfileFieldErrorMap;
}

export const OnboardingMunicipality = (props: Props): ReactElement => {
  const { state, setProfileData } = useContext(ProfileDataContext);
  const { Config } = useConfig();

  const onValidation = (event: FocusEvent<HTMLInputElement>): void => {
    const valid = event.target.value.length > 0;
    props.onValidation(fieldName, !valid);
  };

  const handleChange = (): void => {
    return props.onValidation(fieldName, false);
  };

  const fieldName = "municipality";

  const onSelect = (value: Municipality | undefined): void => {
    setProfileData({
      ...state.profileData,
      municipality: value,
    });
  };

  return (
    <div className="form-input margin-top-2">
      <MunicipalityDropdown
        municipalities={state.municipalities}
        ariaLabel="Location"
        onValidation={onValidation}
        fieldName={fieldName}
        error={props.fieldStates[fieldName].invalid}
        validationLabel="Error"
        handleChange={handleChange}
        value={state.profileData.municipality}
        onSelect={onSelect}
        placeholderText={Config.profileDefaults[state.flow].municipality.placeholder ?? ""}
        helperText={Config.profileDefaults[state.flow].municipality.errorTextRequired ?? " "}
      />
    </div>
  );
};

import { MunicipalityDropdown } from "@/components/onboarding/MunicipalityDropdown";
import { ConfigType } from "@/contexts/configContext";
import { MunicipalitiesContext } from "@/contexts/municipalitiesContext";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { profileFormContext } from "@/contexts/profileFormContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useFormContextFieldHelpers } from "@/lib/data-hooks/useFormContextFieldHelpers";
import { getProfileConfig } from "@/lib/domain-logic/getProfileConfig";
import { isMunicipalityRequired } from "@/lib/domain-logic/isMunicipalityRequired";
import { FormContextFieldProps } from "@/lib/types/types";
import { Municipality } from "@businessnjgovnavigator/shared";
import { FocusEvent, ReactElement, useContext } from "react";

interface Props extends FormContextFieldProps {
  hideErrorLabel?: boolean;
  required?: boolean;
}

export const ProfileMunicipality = (props: Props): ReactElement => {
  const { state, setProfileData } = useContext(ProfileDataContext);
  const { municipalities } = useContext(MunicipalitiesContext);
  const { Config } = useConfig();
  const fieldName = "municipality";

  const { RegisterForOnSubmit, Validate, isFormFieldInValid } = useFormContextFieldHelpers(
    fieldName,
    profileFormContext,
    props.errorTypes
  );

  const contentFromConfig: ConfigType["profileDefaults"]["fields"]["municipality"]["default"] =
    getProfileConfig({
      config: Config,
      persona: state.flow,
      fieldName: fieldName,
    });

  RegisterForOnSubmit(() =>
    isMunicipalityRequired({
      legalStructureId: state.profileData.legalStructureId,
      operatingPhase: state.profileData.operatingPhase,
    }) || props.required
      ? state.profileData[fieldName] !== undefined
      : true
  );

  const onValidation = (event: FocusEvent<HTMLInputElement>): void => {
    if (
      isMunicipalityRequired({
        legalStructureId: state.profileData.legalStructureId,
        operatingPhase: state.profileData.operatingPhase,
      }) ||
      props.required
    ) {
      const valid = event.target.value.length > 0;
      Validate(!valid);
    } else {
      Validate(false);
    }
  };

  const handleChange = (): void => {
    return Validate(false);
  };

  const onSelect = (value: Municipality | undefined): void => {
    setProfileData({
      ...state.profileData,
      municipality: value,
    });
  };

  return (
    <div className="form-input margin-top-2">
      <MunicipalityDropdown
        municipalities={municipalities}
        ariaLabel="Location"
        onValidation={onValidation}
        fieldName={fieldName}
        error={isFormFieldInValid}
        validationLabel="Error"
        handleChange={handleChange}
        value={state.profileData.municipality}
        onSelect={onSelect}
        helperText={contentFromConfig.errorTextRequired ?? " "}
        hideErrorLabel={props.hideErrorLabel}
      />
    </div>
  );
};

import { MunicipalityDropdown } from "@/components/data-fields/MunicipalityDropdown";
import { DataFormErrorMapContext } from "@/contexts/dataFormErrorMapContext";
import { MunicipalitiesContext } from "@/contexts/municipalitiesContext";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useFormContextFieldHelpers } from "@/lib/data-hooks/useFormContextFieldHelpers";
import { getProfileConfig } from "@/lib/domain-logic/getProfileConfig";
import { isMunicipalityRequired } from "@/lib/domain-logic/isMunicipalityRequired";
import { Municipality } from "@businessnjgovnavigator/shared";
import { ConfigType } from "@businessnjgovnavigator/shared/contexts";
import { FormContextFieldProps } from "@businessnjgovnavigator/shared/types";
import { FocusEvent, ReactElement, useContext } from "react";

interface Props extends FormContextFieldProps {
  hideErrorLabel?: boolean;
  required?: boolean;
}

export const MunicipalityField = (props: Props): ReactElement => {
  const { state, setProfileData } = useContext(ProfileDataContext);
  const { municipalities } = useContext(MunicipalitiesContext);
  const { Config } = useConfig();
  const fieldName = "municipality";

  const { RegisterForOnSubmit, setIsValid, isFormFieldInvalid } = useFormContextFieldHelpers(
    fieldName,
    DataFormErrorMapContext,
    props.errorTypes,
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
      : true,
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
      setIsValid(valid);
    } else {
      setIsValid(true);
    }
  };

  const handleChange = (): void => {
    return setIsValid(true);
  };

  const onSelect = (value: Municipality | undefined): void => {
    setProfileData({
      ...state.profileData,
      municipality: value,
    });
  };

  return (
    <MunicipalityDropdown
      municipalities={municipalities}
      ariaLabel="Location"
      onValidation={onValidation}
      fieldName={fieldName}
      error={isFormFieldInvalid}
      validationLabel="Error"
      handleChange={handleChange}
      value={state.profileData.municipality}
      onSelect={onSelect}
      helperText={contentFromConfig.errorTextRequired ?? ""}
      hideErrorLabel={props.hideErrorLabel}
    />
  );
};

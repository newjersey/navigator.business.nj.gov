import { OnboardingNumericField } from "@/components/onboarding/OnboardingNumericField";
import { ConfigType } from "@/contexts/configContext";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { getProfileConfig } from "@/lib/domain-logic/getProfileConfig";
import { ProfileFieldErrorMap, ProfileFields } from "@/lib/types/types";
import { ReactElement, ReactNode, useContext } from "react";

interface Props {
  onValidation: (field: ProfileFields, invalid: boolean) => void;
  fieldStates: ProfileFieldErrorMap;
  children?: ReactNode;
  handleChangeOverride?: (value: string) => void;
}

export const OnboardingTaxPin = (props: Props): ReactElement => {
  const fieldName = "taxPin";
  const { Config } = useConfig();
  const { state } = useContext(ProfileDataContext);

  const contentFromConfig: ConfigType["profileDefaults"]["fields"]["taxPin"]["default"] = getProfileConfig({
    config: Config,
    persona: state.flow,
    fieldName: fieldName,
  });

  return (
    <>
      <OnboardingNumericField
        onValidation={props.onValidation}
        error={props.fieldStates[fieldName].invalid}
        fieldName={fieldName}
        maxLength={4}
        minLength={4}
        validationText={contentFromConfig.errorTextRequired}
        handleChange={props.handleChangeOverride}
      />
      {props.children}
    </>
  );
};

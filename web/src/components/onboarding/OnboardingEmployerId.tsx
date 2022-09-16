import { OnboardingNumericField } from "@/components/onboarding/OnboardingNumericField";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { ProfileFieldErrorMap, ProfileFields } from "@/lib/types/types";
import { displayAsEin } from "@/lib/utils/displayAsEin";
import { templateEval } from "@/lib/utils/helpers";
import { ReactElement, useContext } from "react";

interface Props {
  onValidation: (field: ProfileFields, invalid: boolean) => void;
  fieldStates: ProfileFieldErrorMap;
  headerAriaLevel?: number;
  handleChangeOverride?: (value: string) => void;
}

export const OnboardingEmployerId = ({ headerAriaLevel = 2, ...props }: Props): ReactElement => {
  const { state } = useContext(ProfileDataContext);
  const { Config } = useConfig();
  const fieldName = "employerId";

  return (
    <>
      <div role="heading" aria-level={headerAriaLevel} className="h3-styling margin-bottom-2">
        {Config.profileDefaults[state.flow].employerId.header}{" "}
        <span className="text-light">{Config.profileDefaults[state.flow].employerId.headerNotBolded}</span>
      </div>
      <OnboardingNumericField
        fieldName={fieldName}
        hideHeader={true}
        onValidation={props.onValidation}
        error={props.fieldStates[fieldName].invalid}
        validationText={templateEval(Config.onboardingDefaults.errorTextMinimumNumericField, {
          length: "9",
        })}
        visualFilter={displayAsEin}
        maxLength={9}
        minLength={9}
        headerAriaLevel={headerAriaLevel}
        handleChange={props.handleChangeOverride}
      />
    </>
  );
};

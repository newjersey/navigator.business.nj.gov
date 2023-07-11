import { ProfileNumericField } from "@/components/profile/ProfileNumericField";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { displayAsEin } from "@/lib/utils/displayAsEin";
import { templateEval } from "@/lib/utils/helpers";
import { ReactElement } from "react";

interface Props {
  handleChangeOverride?: (value: string) => void;
}

export const ProfileEmployerId = (props: Props): ReactElement => {
  const { Config } = useConfig();
  const fieldName = "employerId";

  return (
    <>
      <ProfileNumericField
        inputWidth="default"
        fieldName={fieldName}
        validationText={templateEval(Config.onboardingDefaults.errorTextMinimumNumericField, {
          length: "9",
        })}
        visualFilter={displayAsEin}
        maxLength={9}
        minLength={9}
        handleChange={props.handleChangeOverride}
      />
    </>
  );
};

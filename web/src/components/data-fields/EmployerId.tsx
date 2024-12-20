import { NumericField } from "@/components/data-fields/NumericField";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { displayAsEin } from "@/lib/utils/displayAsEin";
import { templateEval } from "@/lib/utils/helpers";
import { ReactElement } from "react";

interface Props {
  handleChangeOverride?: (value: string) => void;
}

export const EmployerId = (props: Props): ReactElement<any> => {
  const { Config } = useConfig();
  const fieldName = "employerId";

  return (
    <>
      <NumericField
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

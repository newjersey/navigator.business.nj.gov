import { NumericField } from "@/components/data-fields/NumericField";
import { ConfigType } from "@/contexts/configContext";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { getProfileConfig } from "@/lib/domain-logic/getProfileConfig";
import { ReactElement, ReactNode, useContext } from "react";

interface Props {
  children?: ReactNode;
  handleChangeOverride?: (value: string) => void;
  inputWidth?: "full" | "default" | "reduced";
  required?: boolean | false;
}

export const TaxPin = (props: Props): ReactElement => {
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
      <NumericField
        inputWidth={props.inputWidth ?? "default"}
        fieldName={fieldName}
        maxLength={4}
        minLength={4}
        validationText={contentFromConfig.errorTextRequired}
        handleChange={props.handleChangeOverride}
        required={props.required}
      />
      {props.children}
    </>
  );
};

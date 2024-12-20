import { NumericField } from "@/components/data-fields/NumericField";
import { ConfigType } from "@/contexts/configContext";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { getProfileConfig } from "@/lib/domain-logic/getProfileConfig";
import { ReactElement, ReactNode, useContext } from "react";

interface Props {
  children?: ReactNode;
  handleChangeOverride?: (value: string) => void;
}

export const TaxPin = (props: Props): ReactElement<any> => {
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
        inputWidth="default"
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

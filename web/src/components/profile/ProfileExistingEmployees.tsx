import { ProfileNumericField } from "@/components/profile/ProfileNumericField";
import { ConfigType } from "@/contexts/configContext";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { getProfileConfig } from "@/lib/domain-logic/getProfileConfig";
import { ReactElement, ReactNode, useContext } from "react";

interface Props {
  children?: ReactNode;
  required?: boolean;
}

export const ProfileExistingEmployees = (props: Props): ReactElement => {
  const fieldName = "existingEmployees";
  const { Config } = useConfig();
  const { state } = useContext(ProfileDataContext);

  const contentFromConfig: ConfigType["profileDefaults"]["fields"]["existingEmployees"]["default"] =
    getProfileConfig({
      config: Config,
      persona: state.flow,
      fieldName: fieldName,
    });

  return (
    <>
      <ProfileNumericField
        inputWidth="default"
        fieldName={fieldName}
        maxLength={7}
        minLength={1}
        validationText={contentFromConfig.errorTextRequired}
        required={props.required}
      />
      {props.children}
    </>
  );
};

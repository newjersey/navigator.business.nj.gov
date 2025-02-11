import { Content } from "@/components/Content";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { getProfileConfig } from "@/lib/domain-logic/getProfileConfig";
import { ReactElement, useContext } from "react";

import { ProfileContentField } from "@/contexts/profileFormContext";

interface Props {
  fieldName: ProfileContentField;
  bold?: boolean;
  isAltDescriptionDisplayed?: boolean;
}

export const FieldLabelDescriptionOnly = (props: Props): ReactElement => {
  const { Config } = useConfig();
  const { state } = useContext(ProfileDataContext);

  const contentFromConfig = getProfileConfig({
    config: Config,
    persona: state.flow,
    fieldName: props.fieldName,
    onboarding: true,
  });

  const description = contentFromConfig.description;
  const altDescription = contentFromConfig.altDescription;

  return (
    <>
      <Content className={`${props.bold ? "text-bold" : ""} margin-bottom-05`}>
        {props.isAltDescriptionDisplayed ? altDescription : description}
      </Content>
    </>
  );
};

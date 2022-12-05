import { Content } from "@/components/Content";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { getProfileConfig } from "@/lib/domain-logic/getProfileConfig";
import { ProfileContentField } from "@/lib/types/types";
import { useContext } from "react";

interface Props {
  fieldName: ProfileContentField;
  isAltDescriptionDisplayed?: boolean;
}

export const FieldLabelProfile = (props: Props) => {
  const { Config } = useConfig();
  const { state } = useContext(ProfileDataContext);

  const contentFromConfig = getProfileConfig({
    config: Config,
    persona: state.flow,
    fieldName: props.fieldName,
  });

  const unboldedHeader = contentFromConfig.headerNotBolded;
  const description = contentFromConfig.description;
  const altDescription = contentFromConfig.altDescription;

  return (
    <>
      <div role="heading" aria-level={3} className="h3-styling margin-bottom-2">
        {contentFromConfig.header}
        {unboldedHeader && (
          <>
            {" "}
            <span className="text-light">{unboldedHeader}</span>
          </>
        )}
      </div>
      {props.isAltDescriptionDisplayed && altDescription && <Content>{altDescription}</Content>}
      {!props.isAltDescriptionDisplayed && description && <Content>{description}</Content>}
    </>
  );
};

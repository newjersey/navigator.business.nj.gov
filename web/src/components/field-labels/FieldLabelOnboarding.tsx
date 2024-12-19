import { Content } from "@/components/Content";
import { ContextualInfoButton } from "@/components/ContextualInfoButton";
import { Heading } from "@/components/njwds-extended/Heading";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { getProfileConfig } from "@/lib/domain-logic/getProfileConfig";
import { FlowType, ProfileContentField } from "@/lib/types/types";
import { ReactElement, useContext } from "react";

interface Props {
  fieldName: ProfileContentField;
  isAltDescriptionDisplayed?: boolean;
  CMS_ONLY_flow?: FlowType;
}

export const FieldLabelOnboarding = (props: Props): ReactElement<any> => {
  const { Config } = useConfig();
  const { state } = useContext(ProfileDataContext);

  const contentFromConfig = getProfileConfig({
    config: Config,
    persona: props.CMS_ONLY_flow ?? state.flow,
    fieldName: props.fieldName,
    onboarding: true,
  });

  const unboldedHeader = contentFromConfig.headerNotBolded;
  const description = contentFromConfig.description;
  const altDescription = contentFromConfig.altDescription;

  return (
    <>
      <Heading level={2} styleVariant="h3" className="margin-bottom-05-override">
        {contentFromConfig.headerContextualInfo ? (
          <ContextualInfoButton text={contentFromConfig.header} id={contentFromConfig.headerContextualInfo} />
        ) : (
          contentFromConfig.header
        )}
        {unboldedHeader && (
          <>
            {" "}
            <span className="text-light">{unboldedHeader}</span>
          </>
        )}
      </Heading>
      {props.isAltDescriptionDisplayed && altDescription && <Content>{altDescription}</Content>}
      {!props.isAltDescriptionDisplayed && description && <Content>{description}</Content>}
    </>
  );
};

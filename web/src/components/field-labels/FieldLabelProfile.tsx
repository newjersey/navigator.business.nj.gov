import { ArrowTooltip } from "@/components/ArrowTooltip";
import { Content } from "@/components/Content";
import { ContextualInfoButton } from "@/components/ContextualInfoButton";
import { Icon } from "@/components/njwds/Icon";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { getProfileConfig } from "@/lib/domain-logic/getProfileConfig";
import { convertTextToMarkdownBold } from "@/lib/utils/content-helpers";
import { ProfileContentField } from "@businessnjgovnavigator/shared/types";
import { ReactElement, useContext } from "react";

interface Props {
  fieldName: ProfileContentField;
  isAltDescriptionDisplayed?: boolean;
  locked?: boolean;
  hideHeader?: boolean;
  boldAltDescription?: boolean;
  ignoreContextualInfo?: boolean;
  boldDescription?: boolean;
  optionalText?: boolean;
}

export const FieldLabelProfile = (props: Props): ReactElement => {
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

  const showHeader = !props.hideHeader;

  const showDescription = !props.locked;
  const showLockedTooltip = !!props.locked;
  const showUnboldedHeader = unboldedHeader && !props.locked;
  const isHeaderInConfig = unboldedHeader || contentFromConfig.header;

  const optionalTagText = props.optionalText
    ? Config.profileDefaults.fields.nonEssentialQuestions.default.optionalText
    : "";

  const getDescriptionContentText = (text: string, bold: boolean | undefined): string => {
    return bold ? convertTextToMarkdownBold(text) : text;
  };

  return (
    <>
      <div className="flex flex-row fac margin-bottom-05">
        {isHeaderInConfig && showHeader && (
          <div className="text-bold">
            {contentFromConfig.headerContextualInfo && !props.ignoreContextualInfo ? (
              <ContextualInfoButton
                text={contentFromConfig.header}
                id={contentFromConfig.headerContextualInfo}
              />
            ) : (
              contentFromConfig.header
            )}
            {showUnboldedHeader && (
              <>
                {" "}
                <span className="text-light">{unboldedHeader}</span>
              </>
            )}
          </div>
        )}
        {showLockedTooltip && (
          <div className="margin-left-1">
            <ArrowTooltip
              title={Config.profileDefaults.default.lockedFieldTooltipText}
              data-testid={`${props.fieldName}-locked-tooltip`}
            >
              <div className="fdr fac font-body-lg">
                <Icon iconName="help_outline" />
              </div>
            </ArrowTooltip>
          </div>
        )}
      </div>
      {showDescription && (
        <>
          {props.isAltDescriptionDisplayed && altDescription && (
            <Content>
              {`${getDescriptionContentText(
                altDescription,
                props.boldAltDescription,
              )} ${optionalTagText}`}
            </Content>
          )}
          {!props.isAltDescriptionDisplayed && description && (
            <Content>
              {`${getDescriptionContentText(
                description,
                props.boldDescription,
              )} ${optionalTagText}`}
            </Content>
          )}
        </>
      )}
    </>
  );
};

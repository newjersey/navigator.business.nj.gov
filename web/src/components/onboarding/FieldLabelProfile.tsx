import { ArrowTooltip } from "@/components/ArrowTooltip";
import { Content } from "@/components/Content";
import { ContextualInfoButton } from "@/components/ContextualInfoButton";
import { Icon } from "@/components/njwds/Icon";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { getProfileConfig } from "@/lib/domain-logic/getProfileConfig";
import { ProfileContentField } from "@/lib/types/types";
import { ReactElement, useContext } from "react";

interface Props {
  fieldName: ProfileContentField;
  isAltDescriptionDisplayed?: boolean;
  locked?: boolean;
  hideHeader?: boolean;
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

  return (
    <>
      <div className="flex flex-row fac">
        {isHeaderInConfig && showHeader && (
          <div role="heading" aria-level={3} className="text-bold margin-bottom-05">
            {contentFromConfig.headerContextualInfo ? (
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
          <div className="margin-left-1 margin-bottom-2">
            <ArrowTooltip
              title={Config.profileDefaults.lockedFieldTooltipText}
              data-testid={`${props.fieldName}-locked-tooltip`}
            >
              <div className="fdr fac  font-body-lg">
                <Icon>help_outline</Icon>
              </div>
            </ArrowTooltip>
          </div>
        )}
      </div>
      {showDescription && (
        <>
          {props.isAltDescriptionDisplayed && altDescription && <Content>{altDescription}</Content>}
          {!props.isAltDescriptionDisplayed && description && <Content>{description}</Content>}
        </>
      )}
    </>
  );
};

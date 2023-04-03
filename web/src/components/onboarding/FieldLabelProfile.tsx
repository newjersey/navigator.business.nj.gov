import { ArrowTooltip } from "@/components/ArrowTooltip";
import { Content } from "@/components/Content";
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

  const showDescription = !props.locked;
  const showLockedTooltip = !!props.locked;
  const showUnboldedHeader = unboldedHeader && !props.locked;
  const isHeaderInConfig = unboldedHeader || contentFromConfig.header;
  return (
    <>
      <div className="flex flex-row fac">
        {isHeaderInConfig && (
          <div role="heading" aria-level={3} className="h3-styling margin-bottom-2">
            {contentFromConfig.header}
            {showUnboldedHeader && (
              <>
                {" "}
                <span className="text-light">{unboldedHeader}</span>
              </>
            )}
          </div>
        )}
        {showLockedTooltip && (
          <ArrowTooltip title={Config.profileDefaults.lockedFieldTooltipText}>
            <div className="fdr fac margin-left-1 margin-bottom-2 font-body-lg">
              <Icon>help_outline</Icon>
            </div>
          </ArrowTooltip>
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

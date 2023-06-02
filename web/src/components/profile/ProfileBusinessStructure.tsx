import { ArrowTooltip } from "@/components/ArrowTooltip";
import { Content } from "@/components/Content";
import { Icon } from "@/components/njwds/Icon";
import { FieldLabelProfile } from "@/components/onboarding/FieldLabelProfile";
import { ConfigType } from "@/contexts/configContext";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useRoadmap } from "@/lib/data-hooks/useRoadmap";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { getProfileConfig } from "@/lib/domain-logic/getProfileConfig";
import { isGetFilingResponseSuccussful } from "@/lib/domain-logic/isGetFilingResponseSuccussful";
import { getTaskFromRoadmap } from "@/lib/utils/roadmap-helpers";
import { LookupLegalStructureById } from "@businessnjgovnavigator/shared/legalStructure";
import { ReactElement, useContext, useMemo } from "react";

export const ProfileBusinessStructure = (): ReactElement => {
  const { state } = useContext(ProfileDataContext);
  const { Config } = useConfig();
  const { roadmap } = useRoadmap();
  const { updateQueue } = useUserData();
  const isFormed = isGetFilingResponseSuccussful(updateQueue?.current());

  const contentFromConfig: ConfigType["profileDefaults"]["fields"]["legalStructureId"]["default"] =
    getProfileConfig({
      config: Config,
      persona: state.flow,
      fieldName: "legalStructureId",
    });

  const businessStructureTaskUrl = useMemo(() => {
    const urlSlug = getTaskFromRoadmap(roadmap, "business-structure")?.urlSlug ?? "";
    return `/tasks/${urlSlug}`;
  }, [roadmap]);

  return (
    <div data-testid="business-structure">
      <div className="flex flex-row">
        <FieldLabelProfile fieldName="legalStructureId" />
        {isFormed ? (
          <div className="margin-left-2">
            <ArrowTooltip
              title={Config.profileDefaults.lockedFieldTooltipText}
              data-testid="business-structure-tooltip"
            >
              <div className="fdr fac font-body-lg">
                <Icon>help_outline</Icon>
              </div>
            </ArrowTooltip>
          </div>
        ) : (
          <a
            className="margin-left-2"
            href={businessStructureTaskUrl}
            data-testid={"business-structure-task-link"}
          >
            {state.profileData.legalStructureId ? contentFromConfig.editText : contentFromConfig.addText}
          </a>
        )}
      </div>
      {state.profileData.legalStructureId && (
        <div data-testid="legal-structure">
          {LookupLegalStructureById(state.profileData.legalStructureId).name}
        </div>
      )}
      {!state.profileData.legalStructureId && (
        <div data-testid="not-entered">
          <Content>{contentFromConfig.notEnteredText}</Content>
        </div>
      )}
    </div>
  );
};

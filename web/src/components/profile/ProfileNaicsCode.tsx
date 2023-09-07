import { ArrowTooltip } from "@/components/ArrowTooltip";
import { Icon } from "@/components/njwds/Icon";
import { FieldLabelProfile } from "@/components/onboarding/FieldLabelProfile";
import { ConfigType } from "@/contexts/configContext";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useRoadmap } from "@/lib/data-hooks/useRoadmap";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { getProfileConfig } from "@/lib/domain-logic/getProfileConfig";
import { lookupNaicsCode } from "@/lib/domain-logic/lookupNaicsCode";
import { getTaskFromRoadmap } from "@/lib/utils/roadmap-helpers";
import { ReactElement, useContext, useMemo } from "react";

export const ProfileNaicsCode = (): ReactElement => {
  const { state } = useContext(ProfileDataContext);
  const { business } = useUserData();
  const { Config } = useConfig();
  const { roadmap } = useRoadmap();

  const contentFromConfig: ConfigType["profileDefaults"]["fields"]["naicsCode"]["default"] = getProfileConfig(
    {
      config: Config,
      persona: state.flow,
      fieldName: "naicsCode",
    }
  );

  const naicsTaskUrl = useMemo(() => {
    const urlSlug = getTaskFromRoadmap(roadmap, "determine-naics-code")?.urlSlug ?? "";
    return `/tasks/${urlSlug}`;
  }, [roadmap]);

  const shouldLockFieldForStartingAndNexus = (): boolean => {
    return state.profileData.naicsCode !== "" && business?.taxFilingData.state === "SUCCESS";
  };

  const shouldLockFieldForOwning = (): boolean => {
    return state.profileData.naicsCode !== "" && state.profileData.operatingPhase === "UP_AND_RUNNING_OWNING";
  };

  const shouldLockField = (): boolean => {
    return shouldLockFieldForStartingAndNexus() || shouldLockFieldForOwning();
  };

  return (
    <>
      <div className="flex flex-row flex-align-center">
        <FieldLabelProfile fieldName="naicsCode" />
        {shouldLockField() ? (
          <div className="margin-left-2">
            <ArrowTooltip
              title={Config.profileDefaults.default.lockedFieldTooltipText}
              data-testid="naics-code-tooltip"
            >
              <div className="fdr fac font-body-lg">
                <Icon>help_outline</Icon>
              </div>
            </ArrowTooltip>
          </div>
        ) : (
          <a className="text-accent-cool-darker margin-left-2" href={naicsTaskUrl}>
            {state.profileData.naicsCode ? contentFromConfig.editText : contentFromConfig.addText}
          </a>
        )}
      </div>
      {state.profileData.naicsCode && (
        <>
          <span className="text-bold margin-right-">{state.profileData.naicsCode}</span>
          {" - "}
          <span className="margin-left-">
            {lookupNaicsCode(state.profileData.naicsCode)?.SixDigitDescription}
          </span>
        </>
      )}
      {!state.profileData.naicsCode && (
        <div className={"text-italic"}>{contentFromConfig.notEnteredText}</div>
      )}
    </>
  );
};

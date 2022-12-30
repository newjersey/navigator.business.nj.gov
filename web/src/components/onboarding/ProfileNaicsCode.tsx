import { Content } from "@/components/Content";
import { FieldLabelProfile } from "@/components/onboarding/FieldLabelProfile";
import { ConfigType } from "@/contexts/configContext";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useRoadmap } from "@/lib/data-hooks/useRoadmap";
import { getProfileConfig } from "@/lib/domain-logic/getProfileConfig";
import { lookupNaicsCode } from "@/lib/domain-logic/lookupNaicsCode";
import { getTaskFromRoadmap } from "@/lib/utils/roadmap-helpers";
import { ReactElement, useContext, useMemo } from "react";

export const ProfileNaicsCode = (): ReactElement => {
  const { state } = useContext(ProfileDataContext);
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

  return (
    <>
      <div className="flex flex-row">
        <FieldLabelProfile fieldName="naicsCode" />
        <a className="margin-left-2" href={naicsTaskUrl}>
          {state.profileData.naicsCode ? contentFromConfig.editText : contentFromConfig.addText}
        </a>
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
        <div data-testid="not-entered">
          <Content>{contentFromConfig.notEnteredText}</Content>
        </div>
      )}
    </>
  );
};

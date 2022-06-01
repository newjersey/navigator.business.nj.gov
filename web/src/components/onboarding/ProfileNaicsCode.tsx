import { Content } from "@/components/Content";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useRoadmap } from "@/lib/data-hooks/useRoadmap";
import { lookupNaicsCode } from "@/lib/domain-logic/lookupNaicsCode";
import { getFlow, getTaskFromRoadmap, setHeaderRole } from "@/lib/utils/helpers";
import { ReactElement, useContext, useMemo } from "react";

export const ProfileNaicsCode = (): ReactElement => {
  const { state } = useContext(ProfileDataContext);
  const { Config } = useConfig();
  const { roadmap } = useRoadmap();

  const naicsTaskUrl = useMemo(() => {
    const urlSlug = getTaskFromRoadmap(roadmap, "determine-naics-code")?.urlSlug ?? "";
    return `/tasks/${urlSlug}`;
  }, [roadmap]);

  return (
    <>
      <div className="flex flex-row">
        <Content overrides={{ h2: setHeaderRole(3, "h3-styling") }}>
          {Config.profileDefaults[getFlow(state.profileData)].naicsCode.header}
        </Content>
        <a className="margin-left-2" href={naicsTaskUrl}>
          {Config.profileDefaults[getFlow(state.profileData)].naicsCode.editText}
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
        <Content>{Config.profileDefaults[getFlow(state.profileData)].naicsCode.notEnteredText}</Content>
      )}
    </>
  );
};

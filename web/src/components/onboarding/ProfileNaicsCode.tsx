import { Content } from "@/components/Content";
import { FieldLabelProfile } from "@/components/onboarding/FieldLabelProfile";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useRoadmap } from "@/lib/data-hooks/useRoadmap";
import { lookupNaicsCode } from "@/lib/domain-logic/lookupNaicsCode";
import { getFlow, getTaskFromRoadmap } from "@/lib/utils/helpers";
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
        <FieldLabelProfile fieldName="naicsCode" />
        <a className="margin-left-2" href={naicsTaskUrl}>
          {state.profileData.naicsCode
            ? Config.profileDefaults[getFlow(state.profileData)].naicsCode.editText
            : Config.profileDefaults[getFlow(state.profileData)].naicsCode.addText}
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
          <Content>{Config.profileDefaults[getFlow(state.profileData)].naicsCode.notEnteredText}</Content>
        </div>
      )}
    </>
  );
};

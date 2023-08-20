import { FieldLabelProfile } from "@/components/onboarding/FieldLabelProfile";
import { ConfigType } from "@/contexts/configContext";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useRoadmap } from "@/lib/data-hooks/useRoadmap";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { getProfileConfig } from "@/lib/domain-logic/getProfileConfig";
import { getTaskFromRoadmap } from "@/lib/utils/roadmap-helpers";
import { hasCompletedFormation } from "@businessnjgovnavigator/shared/";
import { LookupLegalStructureById } from "@businessnjgovnavigator/shared/legalStructure";
import { ReactElement, useContext, useEffect, useMemo, useState } from "react";

export const ProfileBusinessStructure = (): ReactElement => {
  const { state } = useContext(ProfileDataContext);
  const { Config } = useConfig();
  const { roadmap } = useRoadmap();
  const { business } = useUserData();
  const [isFormed, setIsFormed] = useState(false);

  useEffect(() => {
    setIsFormed(hasCompletedFormation(business));
  }, [business]);

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
      <div className="flex flex-row flex-align-center">
        <FieldLabelProfile fieldName="legalStructureId" />
        {!isFormed && (
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
        <div className={"text-italic"}>{contentFromConfig.notEnteredText}</div>
      )}
    </div>
  );
};

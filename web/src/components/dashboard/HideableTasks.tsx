import { SecondaryButton } from "@/components//njwds-extended/SecondaryButton";
import { Roadmap } from "@/components/dashboard/Roadmap";
import { Heading } from "@/components/njwds-extended/Heading";
import { Icon } from "@/components/njwds/Icon";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useRoadmap } from "@/lib/data-hooks/useRoadmap";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { MediaQueries } from "@/lib/PageSizes";
import { templateEval } from "@/lib/utils/helpers";
import { useMediaQuery } from "@mui/material";
import { ReactElement } from "react";

export const HideableTasks = (): ReactElement => {
  const { updateQueue, business } = useUserData();
  const { roadmap } = useRoadmap();
  const { Config } = useConfig();
  const isXSMobile = useMediaQuery(MediaQueries.isXSMobile);

  const handleToggleClick = (): void => {
    if (!business || !updateQueue) {
      return;
    }

    updateQueue
      .queuePreferences({
        isHideableRoadmapOpen: !business.preferences.isHideableRoadmapOpen,
      })
      .update();
  };

  const hiddenTasksCount = (): number => {
    if (!roadmap) {
      return 0;
    }
    return roadmap.tasks.length;
  };

  return (
    <div className="margin-top-7" data-testid="hideableTasks">
      <div className={`flex flex-align-center margin-bottom-205`}>
        <Heading level={2} className="margin-bottom-0 text-medium">
          {Config.dashboardRoadmapHeaderDefaults.RoadmapTasksHeaderText}
        </Heading>
        <div className={`mla`}>
          <SecondaryButton
            className={`${isXSMobile ? "padding-x-0 margin-bottom-2" : ""}`}
            size={"small"}
            isColor={"border-base-light"}
            onClick={handleToggleClick}
          >
            <div className="fdr fac">
              <Icon>{business?.preferences.isHideableRoadmapOpen ? "visibility_off" : "visibility"}</Icon>
              <span className="margin-left-05 line-height-sans-2">
                {business?.preferences.isHideableRoadmapOpen
                  ? Config.dashboardDefaults.hideTaskText
                  : Config.dashboardDefaults.showTaskText}
              </span>
            </div>
          </SecondaryButton>
        </div>
      </div>
      <hr className="margin-bottom-3 margin-top-0" aria-hidden={true} />

      {business?.preferences.isHideableRoadmapOpen ? (
        <Roadmap />
      ) : (
        <div className="text-base">
          {templateEval(Config.dashboardDefaults.hiddenTasksText, {
            count: String(hiddenTasksCount()),
          })}
        </div>
      )}
    </div>
  );
};

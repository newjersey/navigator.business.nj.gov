import { Roadmap } from "@/components/dashboard/Roadmap";
import { UnStyledButton } from "@/components/njwds-extended/UnStyledButton";
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
  const isTabletAndUp = useMediaQuery(MediaQueries.tabletAndUp);

  const handleToggleClick = (): void => {
    if (!business || !updateQueue) {
      return;
    }

    updateQueue
      .queuePreferences({
        isHideableRoadmapOpen: !business.preferences.isHideableRoadmapOpen
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
      <div className={`${isTabletAndUp ? "flex flex-align-center" : ""} margin-bottom-205`}>
        <h2 className="margin-bottom-0 text-medium">{Config.dashboardDefaults.upAndRunningTaskHeader}</h2>
        <div className={`mla ${isTabletAndUp ? "" : "margin-top-2"}`}>
          <UnStyledButton
            style={"transparentBgColor"}
            className={"usa-tag text-normal text-base border-1px border-base-light hide-unhide-button"}
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
          </UnStyledButton>
        </div>
      </div>
      <hr className="margin-bottom-3 margin-top-0" aria-hidden={true} />

      {business?.preferences.isHideableRoadmapOpen ? (
        <Roadmap />
      ) : (
        <div className="text-base">
          {templateEval(Config.dashboardDefaults.hiddenTasksText, {
            count: String(hiddenTasksCount())
          })}
        </div>
      )}
    </div>
  );
};

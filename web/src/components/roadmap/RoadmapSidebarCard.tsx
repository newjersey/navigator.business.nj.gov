import { Content } from "@/components/Content";
import { Button } from "@/components/njwds-extended/Button";
import { Icon } from "@/components/njwds/Icon";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useRoadmap } from "@/lib/data-hooks/useRoadmap";
import { useRoadmapSidebarCards } from "@/lib/data-hooks/useRoadmapSidebarCards";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { SidebarCardContent } from "@/lib/types/types";
import analytics from "@/lib/utils/analytics";
import { templateEval } from "@/lib/utils/helpers";
import { styled } from "@mui/material";
import LinearProgress, { linearProgressClasses } from "@mui/material/LinearProgress";
import { useState } from "react";
import { GraduationModal } from "./GraduationModal";

type Props = {
  card: SidebarCardContent;
};

const BorderLinearProgress = styled(LinearProgress)(() => ({
  height: 11,
  borderRadius: 5,
  border: "1px solid #0076D6",
  backgroundColor: "#D9E8F6",
  [`& .${linearProgressClasses.determinate}`]: {
    backgroundColor: "#2378C3",
  },
}));

export const RoadmapSidebarCard = (props: Props) => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const { hideCard } = useRoadmapSidebarCards();
  const { userData } = useUserData();
  const { roadmap } = useRoadmap();
  const { Config } = useConfig();

  const closeSelf = async () => {
    await hideCard(props.card.id);
  };

  const totalTasks = (): number => {
    if (!roadmap) return 1;
    let totalSumOfTasks = 0;
    for (const step of roadmap.steps) {
      totalSumOfTasks += step.tasks.length;
    }
    return totalSumOfTasks;
  };

  const tasksCompleted = (): number => {
    if (!userData || !roadmap) return 0;
    let totalTasksCompleted = 0;
    for (const step of roadmap.steps) {
      for (const task of step.tasks) {
        if (userData.taskProgress[task.id] === "COMPLETED") {
          totalTasksCompleted += 1;
        }
      }
    }
    return totalTasksCompleted;
  };

  const getIncompleteTaskCount = (): { required: number; optional: number } => {
    if (!roadmap || !userData) return { required: 0, optional: 0 };

    let incompleteOptionalTaskCount = 0;
    let incompleteRequiredTotalTaskCount = 0;
    const optionalTasksIds: string[] = [];
    const requiredTasksIds: string[] = [];
    for (const step of roadmap.steps) {
      for (const task of step.tasks) {
        task.required ? requiredTasksIds.push(task.id) : optionalTasksIds.push(task.id);
      }
    }

    for (const id of optionalTasksIds) {
      if (userData.taskProgress[id] !== "COMPLETED") {
        incompleteOptionalTaskCount += 1;
      }
    }

    for (const id of requiredTasksIds) {
      if (userData.taskProgress[id] !== "COMPLETED") {
        incompleteRequiredTotalTaskCount += 1;
      }
    }

    return {
      required: incompleteRequiredTotalTaskCount,
      optional: incompleteOptionalTaskCount,
    };
  };

  const constructIncompleteTaskPhrase = (): { required: string; optional: string } => {
    const { optional, required } = getIncompleteTaskCount();

    const optionalTaskPhrase =
      optional === 1
        ? templateEval(Config.taskProgressCard.optionalTasksSingular, { numTasks: optional.toString() })
        : templateEval(Config.taskProgressCard.optionalTasksPlural, { numTasks: optional.toString() });

    const requiredTaskPhrase =
      required === 1
        ? templateEval(Config.taskProgressCard.requiredTasksSingular, { numTasks: required.toString() })
        : templateEval(Config.taskProgressCard.requiredTasksPlural, { numTasks: required.toString() });

    return {
      required: requiredTaskPhrase,
      optional: optionalTaskPhrase,
    };
  };

  const progressBarValue = (): number => {
    return Math.round((tasksCompleted() / totalTasks()) * 100);
  };

  const getHeader = (): string => {
    if (props.card.notStartedHeader && progressBarValue() === 0) {
      return props.card.notStartedHeader;
    } else if (props.card.completedHeader && progressBarValue() === 100) {
      return props.card.completedHeader;
    }
    return templateEval(props.card.header, { percentDone: `${progressBarValue()}%` });
  };

  const getContent = (): string => {
    const { optional, required } = constructIncompleteTaskPhrase();
    return templateEval(props.card.contentMd, {
      numberOptionalTasks: optional,
      numberRequiredTasks: required,
    });
  };

  const ctaOnClickMap = {
    graduation: (): void => {
      analytics.event.roadmap_graduate_button.click.view_graduation_modal();
      setModalOpen(true);
    },
  } as Record<string, () => void>;

  return (
    <>
      <GraduationModal open={modalOpen} handleClose={() => setModalOpen(false)} />

      <div
        className={`border radius-md border-${props.card.borderColor} box-shadow-${props.card.shadowColor} margin-left-05 margin-bottom-3`}
        {...{ "data-testid": props.card.id }}
      >
        {props.card.header && (
          <div className={`bg-${props.card.shadowColor} padding-y-105 padding-x-205 radius-top-md`}>
            {props.card.hasCloseButton ? (
              <div className="flex flex-justify">
                <h3
                  className={`margin-bottom-0 text-${props.card.color} ${
                    props.card.imgPath ? "flex flex-align-end" : ""
                  }`}
                >
                  {props.card.imgPath && (
                    <img
                      role="presentation"
                      className="margin-right-2 height-4 width-4"
                      src={props.card.imgPath}
                      alt=""
                    />
                  )}
                  <span>{getHeader()}</span>
                </h3>
                <Button style="tertiary" onClick={closeSelf} ariaLabel="Close">
                  <Icon className={`font-sans-xl text-${props.card.color}`}>close</Icon>
                </Button>
              </div>
            ) : (
              <h3
                className={`margin-bottom-0 text-${props.card.color} ${
                  props.card.imgPath ? "flex flex-align-end" : ""
                }`}
              >
                {props.card.imgPath && (
                  <img
                    role="presentation"
                    className="margin-right-2 height-4 width-4"
                    src={props.card.imgPath}
                    alt=""
                  />
                )}
                <span>{getHeader()}</span>
              </h3>
            )}
          </div>
        )}
        <div
          className={`bg-white padding-205 text-base radius-bottom-md ${
            !props.card.header && "radius-top-md"
          }`}
        >
          {props.card.id === "task-progress" && (
            <div className={`padding-bottom-205`}>
              <BorderLinearProgress
                variant="determinate"
                color="secondary"
                value={progressBarValue()}
                aria-label="Task progress bar"
              />
            </div>
          )}
          <Content>{getContent()}</Content>
          {ctaOnClickMap[props.card.id] && (
            <div className="margin-top-205 flex flex-justify-end">
              <Button
                style="primary"
                onClick={ctaOnClickMap[props.card.id]}
                noRightMargin
                dataTestid={`cta-${props.card.id}`}
                widthAutoOnMobile
              >
                {props.card.ctaText}
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

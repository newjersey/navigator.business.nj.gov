import { SidebarCardGeneric } from "@/components/dashboard/SidebarCardGeneric";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useRoadmap } from "@/lib/data-hooks/useRoadmap";
import { useUserData } from "@/lib/data-hooks/useUserData";
import {
  getCompletedTaskCount,
  getIncompleteTaskCount,
  getTotalTaskCount,
} from "@/lib/domain-logic/roadmapTaskCounters";
import { roadmapWithSectionSpecificTasks } from "@/lib/domain-logic/roadmapWithSectionSpecificTasks";
import { SidebarCardContent } from "@/lib/types/types";
import { templateEval } from "@/lib/utils/helpers";
import { LookupOperatingPhaseById } from "@businessnjgovnavigator/shared/";
import { styled } from "@mui/material";
import LinearProgress, { linearProgressClasses } from "@mui/material/LinearProgress";
import { ReactElement, ReactNode } from "react";

const BorderLinearProgress = styled(LinearProgress)(() => {
  return {
    height: 11,
    borderRadius: 5,
    border: "1px solid #0076D6",
    backgroundColor: "#D9E8F6",
    [`& .${linearProgressClasses.determinate}`]: {
      backgroundColor: "#2378C3",
    },
  };
});

type Props = {
  card: SidebarCardContent;
};

export const SidebarCardTaskProgress = (props: Props): ReactElement => {
  const { Config } = useConfig();
  const { business } = useUserData();
  const { roadmap } = useRoadmap();
  const modifiedRoadmap = LookupOperatingPhaseById(business?.profileData.operatingPhase)
    .displayBusinessStructurePrompt
    ? roadmapWithSectionSpecificTasks(roadmap, "PLAN")
    : roadmap;

  const constructIncompleteTaskPhrase = (): { required: string; optional: string } => {
    const { optional, required } = getIncompleteTaskCount(modifiedRoadmap, business);

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
    const completedCount = getCompletedTaskCount(modifiedRoadmap, business).total;
    const totalCount = getTotalTaskCount(modifiedRoadmap);

    return Math.round((completedCount / totalCount) * 100);
  };

  const getHeader = (): string => {
    if (props.card.notStartedHeader && progressBarValue() === 0) {
      return props.card.notStartedHeader;
    } else if (props.card.completedHeader && progressBarValue() === 100) {
      return props.card.completedHeader;
    } else if (props.card.header) {
      return templateEval(props.card.header, { percentDone: `${progressBarValue()}%` });
    }

    return "";
  };

  const getContent = (): string => {
    const { optional, required } = constructIncompleteTaskPhrase();
    return templateEval(props.card.contentMd, {
      numberOptionalTasks: optional,
      numberRequiredTasks: required,
    });
  };

  const renderProgressBar = (): ReactNode => {
    return (
      <BorderLinearProgress
        variant="determinate"
        color="secondary"
        value={progressBarValue()}
        aria-label="Task progress bar"
      />
    );
  };

  return (
    <SidebarCardGeneric
      card={props.card}
      headerText={getHeader()}
      bodyText={getContent()}
      preBodyContent={renderProgressBar()}
    />
  );
};

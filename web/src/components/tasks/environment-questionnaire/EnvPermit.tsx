import { TaskHeader } from "@/components/TaskHeader";
import { EnvQuestionnaireStepper } from "@/components/tasks/environment-questionnaire/EnvQuestionnaireStepper";
import { mediaAreaToNotApplicableOption } from "@/components/tasks/environment-questionnaire/helpers";
import { UnlockedBy } from "@/components/tasks/UnlockedBy";
import { EnvPermitContext } from "@/contexts/EnvPermitContext";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { MediaQueries } from "@/lib/PageSizes";
import { Task } from "@/lib/types/types";
import {
  generateEmptyEnvironmentQuestionnaireData,
  MediaArea,
  Questionnaire,
} from "@businessnjgovnavigator/shared/environment";
import { useMediaQuery } from "@mui/material";
import { ReactElement, useState } from "react";
import { EnvPermitsResults } from "./EnvPermitsResults";

interface Props {
  task: Task;
}

export const EnvPermit = (props: Props): ReactElement => {
  const { business, updateQueue } = useUserData();

  const [submitted, setSubmitted] = useState<boolean>(
    business?.environmentData?.submitted ?? false,
  );
  const [stepIndex, setStepIndex] = useState<number>(0);

  const [questionnaireData, setQuestionnaireData] = useState(
    business?.environmentData?.questionnaireData ?? generateEmptyEnvironmentQuestionnaireData(),
  );

  const isMobile = useMediaQuery(MediaQueries.isMobile);

  const onSubmit = (): void => {
    if (mediaAreasWithErrors().length > 0) {
      return;
    }

    updateQueue
      ?.queueEnvironmentData({
        questionnaireData: questionnaireData,
        submitted: stepIndex === 5 ? true : undefined,
      })
      .queueTaskProgress({
        ["env-permitting"]: "COMPLETED",
      })
      .update();
  };

  const onClickForEdit = (): void => {
    setStepIndex(0);
    setSubmitted(false);
    updateQueue
      ?.queueEnvironmentData({
        submitted: false,
      })
      .queueTaskProgress({
        ["env-permitting"]: "TO_DO",
      })
      .update();
  };

  const isMediaAreaApplicable = (mediaArea: MediaArea): boolean => {
    const noSelectionOption = mediaAreaToNotApplicableOption[mediaArea];
    const mediaAreaData: Questionnaire = questionnaireData[mediaArea] as Questionnaire;
    return (
      Object.values(questionnaireData[mediaArea]).includes(true) &&
      !mediaAreaData[noSelectionOption]
    );
  };

  const applicableMediaAreas = (): MediaArea[] =>
    Object.keys(questionnaireData).filter((mediaArea) => {
      return isMediaAreaApplicable(mediaArea as MediaArea);
    }) as MediaArea[];

  const mediaAreaContainsError = (mediaArea: MediaArea): boolean => {
    return !Object.values(questionnaireData[mediaArea]).includes(true);
  };

  const mediaAreasWithErrors = (): MediaArea[] =>
    Object.keys(questionnaireData).filter((mediaArea) => {
      return mediaAreaContainsError(mediaArea as MediaArea);
    }) as MediaArea[];

  return (
    <EnvPermitContext.Provider
      value={{
        state: {
          questionnaireData,
          stepIndex,
          submitted,
        },
        setQuestionnaireData,
        setStepIndex,
        setSubmitted,
        onSubmit,
        onClickForEdit,
        applicableMediaAreas,
        mediaAreasWithErrors,
      }}
    >
      <div>
        <TaskHeader task={props.task} />
        <UnlockedBy task={props.task} />
        {business?.environmentData?.submitted ? (
          <EnvPermitsResults />
        ) : (
          <>
            {isMobile && <div className="margin-bottom-105">{props.task.summaryDescriptionMd}</div>}
            <EnvQuestionnaireStepper />
          </>
        )}
      </div>
    </EnvPermitContext.Provider>
  );
};

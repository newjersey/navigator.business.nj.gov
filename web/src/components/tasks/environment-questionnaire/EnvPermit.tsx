import { TaskHeader } from "@/components/TaskHeader";
import { EnvQuestionnaireStepper } from "@/components/tasks/environment-questionnaire/EnvQuestionnaireStepper";
import { mediaAreaToNotApplicableOption } from "@/components/tasks/environment-questionnaire/helpers";
import { UnlockedBy } from "@/components/tasks/UnlockedBy";
import { EnvPermitContext } from "@/contexts/EnvPermitContext";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { MediaQueries } from "@/lib/PageSizes";
import analytics from "@/lib/utils/analytics";
import {
  generateEmptyEnvironmentQuestionnaireData,
  MediaArea,
  Questionnaire,
} from "@businessnjgovnavigator/shared/environment";
import { Task } from "@businessnjgovnavigator/shared/types";
import { useMediaQuery } from "@mui/material";
import { ReactElement, useEffect, useState } from "react";
import { EnvPermitsResults } from "./EnvPermitsResults";

interface Props {
  task: Task;
}

export const EnvPermit = (props: Props): ReactElement => {
  useEffect(() => {
    analytics.event.gen_guidance_stepper_initiated.arrive.general_guidance_initiated();
  }, []);
  const { business, updateQueue } = useUserData();

  const [submitted, setSubmitted] = useState<boolean>(
    business?.environmentData?.submitted ?? false,
  );

  const [sbapEmailSent, setEmailSent] = useState<boolean>(
    business?.environmentData?.sbapEmailSent ?? false,
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

    analytics.event.gen_guidance_stepper_save_see_results.click.general_guidance_save_see_results();
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
          sbapEmailSent,
        },
        setQuestionnaireData,
        setStepIndex,
        setSubmitted,
        setEmailSent,
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

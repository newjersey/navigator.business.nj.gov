import { Content } from "@/components/Content";
import { Alert } from "@/components/njwds-extended/Alert";
import { SecondaryButton } from "@/components/njwds-extended/SecondaryButton";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { MediaQueries } from "@/lib/PageSizes";
import { scrollToTop, templateEval } from "@/lib/utils/helpers";
import {
  MediaArea,
  Questionnaire,
  QuestionnaireConfig,
  QuestionnaireFieldIds,
} from "@businessnjgovnavigator/shared/environment";
import { Checkbox, FormControl, FormControlLabel, FormGroup, FormLabel, useMediaQuery } from "@mui/material";
import { ChangeEvent, ReactElement, useState } from "react";

interface Props {
  taskId: string;
  mediaArea: MediaArea;
  noSelectionOption: QuestionnaireFieldIds;
}

export const EnvQuestionnaire = (props: Props): ReactElement => {
  const { updateQueue, business } = useUserData();
  const { Config } = useConfig();
  const isMobile = useMediaQuery(MediaQueries.isMobile);

  const optionsTextConfig = Config.envQuestionPage[props.mediaArea]
    .questionnaireOptions as QuestionnaireConfig;
  const questionnaireFieldIds = Object.keys(optionsTextConfig);

  const setUpQuestionnaireData = (): Questionnaire => {
    const questionnaire = {} as Questionnaire;
    const questionnaireInUserData = business?.environmentData?.[props.mediaArea]
      ?.questionnaireData as Questionnaire;
    for (const option of questionnaireFieldIds) {
      questionnaire[option as QuestionnaireFieldIds] =
        questionnaireInUserData?.[option as QuestionnaireFieldIds] ?? false;
    }
    return questionnaire;
  };

  const emptyQuestionnaireData = (): Questionnaire => {
    const questionnaire = {} as Questionnaire;
    for (const option of questionnaireFieldIds) {
      questionnaire[option as QuestionnaireFieldIds] = false;
    }
    return questionnaire;
  };

  const [questionnaireData, setQuestionnaireData] = useState<Questionnaire>(setUpQuestionnaireData());
  const [showError, setShowError] = useState<boolean>(false);

  const noSelectionMade = (): boolean => {
    if (!questionnaireData) return false;
    for (const selected of Object.values(questionnaireData)) {
      if (selected) {
        return false;
      }
    }
    return true;
  };

  const onSave = (): void => {
    if (noSelectionMade()) {
      setShowError(true);
    } else {
      updateQueue
        ?.queueEnvironmentData({
          [props.mediaArea]: {
            questionnaireData,
            submitted: true,
          },
        })
        .queueTaskProgress({
          [props.taskId]: "COMPLETED",
        })
        .update();
    }
    scrollToTop();
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const value: QuestionnaireFieldIds = event.target.id as QuestionnaireFieldIds;
    if (value === props.noSelectionOption) {
      const emptyQuestionnaire = emptyQuestionnaireData();
      setQuestionnaireData({ ...emptyQuestionnaire, [props.noSelectionOption]: true });
    } else {
      setQuestionnaireData({
        ...questionnaireData,
        [value]: event.target.checked,
        [props.noSelectionOption]: questionnaireData[props.noSelectionOption]
          ? false
          : questionnaireData[props.noSelectionOption],
      });
    }
  };

  return (
    <div className={"bg-accent-cooler-50 padding-2 radius-lg"}>
      {!isMobile && <h3>{Config.envQuestionPage.generic.title}</h3>}
      {showError && <Alert variant={"error"}>{Config.envQuestionPage.generic.errorText}</Alert>}
      <FormControl component="fieldset" variant="standard" fullWidth={true}>
        <FormLabel component="legend" className="text-base-darkest text-bold">
          {Config.envQuestionPage.generic.question}
        </FormLabel>
        <FormGroup className={`margin-y-1 ${isMobile ? "" : "margin-left-105"}`}>
          {questionnaireFieldIds.map((fieldId) => {
            return (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={questionnaireData[fieldId as QuestionnaireFieldIds]}
                    onChange={handleChange}
                    name={fieldId}
                    id={fieldId}
                  />
                }
                label={<Content>{optionsTextConfig?.[fieldId as QuestionnaireFieldIds]}</Content>}
                key={fieldId}
              />
            );
          })}
        </FormGroup>
      </FormControl>
      <div className={"margin-bottom-1"}>
        <Content>
          {templateEval(Config.envQuestionPage.generic.footerText, {
            mediaAreaText: Config.envQuestionPage[props.mediaArea].mediaAreaText,
            mediaAreaLink: Config.envQuestionPage[props.mediaArea].mediaAreaLink,
          })}
        </Content>
      </div>
      <div className={"flex flex-row flex-justify-end"}>
        <SecondaryButton
          isVerticalPaddingRemoved
          isRightMarginRemoved
          isColor="accent-cooler"
          onClick={() => onSave()}
        >
          {Config.envQuestionPage.generic.buttonText}
        </SecondaryButton>
      </div>
    </div>
  );
};

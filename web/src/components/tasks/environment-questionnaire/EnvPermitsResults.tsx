import { Callout } from "@/components/Callout";
import { Content } from "@/components/Content";
import { Alert } from "@/components/njwds-extended/Alert";
import { UnStyledButton } from "@/components/njwds-extended/UnStyledButton";
import { ContactDep } from "@/components/tasks/environment-questionnaire/results/ContactDep";
import { PersonalizedSupport } from "@/components/tasks/environment-questionnaire/results/PersonalizedSupport";
import { SeeYourResponses } from "@/components/tasks/environment-questionnaire/results/SeeYourResponses";
import { getMergedConfig } from "@/contexts/configContext";
import { useUserData } from "@/lib/data-hooks/useUserData";
import {
  MediaArea,
  QuestionnaireConfig,
  QuestionnaireFieldIds,
} from "@businessnjgovnavigator/shared/environment";
import { ReactElement } from "react";

interface Props {
  taskId: string;
  mediaArea: MediaArea;
  noSelectionOption: QuestionnaireFieldIds;
}

export const EnvPermitsResults = (props: Props): ReactElement => {
  const { business, updateQueue } = useUserData();

  const Config = getMergedConfig();

  const questionnaireData = business?.environmentData?.[props.mediaArea]?.questionnaireData;

  const responseTexts = (): string[] => {
    if (!questionnaireData) return [];

    const optionsMarkedTrue: string[] = [];
    const questionnaireConfig = Config.envQuestionPage[props.mediaArea]
      .questionnaireOptions as QuestionnaireConfig;

    for (const [optionId, selected] of Object.entries(questionnaireData)) {
      const text = questionnaireConfig[optionId as QuestionnaireFieldIds];
      selected === true && optionsMarkedTrue.push(text);
    }

    return optionsMarkedTrue;
  };

  const onClick = (): void => {
    if (!props.mediaArea) return;
    updateQueue
      ?.queueEnvironmentData({
        [props.mediaArea]: {
          ...business?.environmentData?.[props.mediaArea],
          submitted: false,
        },
      })
      .queueTaskProgress({
        [props.taskId]: "IN_PROGRESS",
      })
      .update();
  };

  const isLowApplicability = (): boolean => {
    return questionnaireData?.[props.noSelectionOption as keyof typeof questionnaireData] ?? false;
  };

  const highApplicability = (): ReactElement => {
    return (
      <>
        <div className={"padding-bottom-3"}>
          {Config.envResultsPage.summary.partOne}
          <span className={"text-bold margin-x-05"}>
            {Config.envResultsPage.summary.mediaAreaText[props.mediaArea]}
          </span>
          {Config.envResultsPage.summary.partTwo}
        </div>
        <PersonalizedSupport />
        <ContactDep mediaArea={props.mediaArea} />
        <SeeYourResponses responseTexts={responseTexts()} />
      </>
    );
  };

  const lowApplicability = (): ReactElement => {
    return (
      <>
        <div className={"padding-y-1"}>
          <div>
            <span className={"text-bold margin-bottom-1"}>
              {Config.envResultsPage.lowApplicability.summaryLineOne}
            </span>
            <Content>{Config.envResultsPage.lowApplicability.summaryLineTwo}</Content>
          </div>
        </div>
        <Callout calloutType={"note"} showIcon showHeader={false} showIconInBody={true}>
          <span>
            {Config.envResultsPage.lowApplicability.callout}
            <UnStyledButton className={"margin-left-05"} isUnderline onClick={onClick}>
              {Config.envResultsPage.lowApplicability.calloutRedo}
            </UnStyledButton>
          </span>
        </Callout>
      </>
    );
  };

  return (
    <>
      <h2>{Config.envResultsPage.title}</h2>
      <Alert variant={"success"}>
        <span className={"margin-right-05"}>{Config.envResultsPage.editInfo}</span>
        <UnStyledButton isUnderline onClick={onClick}>
          {Config.envResultsPage.editText}
        </UnStyledButton>
      </Alert>
      {isLowApplicability() ? lowApplicability() : highApplicability()}
    </>
  );
};

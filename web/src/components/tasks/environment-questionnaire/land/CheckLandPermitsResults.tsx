import { Callout } from "@/components/Callout";
import { Content } from "@/components/Content";
import { Alert } from "@/components/njwds-extended/Alert";
import { UnStyledButton } from "@/components/njwds-extended/UnStyledButton";
import { Icon } from "@/components/njwds/Icon";
import { EnvQuestionnaireResultsAccordion } from "@/components/tasks/environment-questionnaire/EnvQuestionnaireResultsAccordion";
import { getMergedConfig } from "@/contexts/configContext";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { Task } from "@/lib/types/types";
import { LandQuestionnaireFieldIds } from "@businessnjgovnavigator/shared/environment";
import { ReactElement } from "react";

interface Props {
  task: Task;
}

export const CheckLandPermitsResults = (props: Props): ReactElement => {
  const { business, updateQueue } = useUserData();
  const Config = getMergedConfig();
  const questionnaireData = business?.environmentData?.land?.questionnaireData;

  const onClick = (): void => {
    updateQueue
      ?.queueEnvironmentData({
        land: {
          ...business?.environmentData?.land,
          submitted: false,
        },
      })
      .queueTaskProgress({
        [props.task.id]: "IN_PROGRESS",
      })
      .update();
  };

  const getResponseTexts = (): string[] => {
    if (!questionnaireData) return [];

    const optionsMarkedTrue: string[] = [];

    let fieldId: LandQuestionnaireFieldIds;
    for (fieldId in questionnaireData) {
      questionnaireData[fieldId] === true &&
        optionsMarkedTrue.push(
          Config.envReqQuestionsPage.land.questionnaireOptions[fieldId as LandQuestionnaireFieldIds]
        );
    }

    return optionsMarkedTrue;
  };

  const personalizedSupport = (): ReactElement => {
    return (
      <EnvQuestionnaireResultsAccordion title={Config.envReqResultsPage.personalizedSupport.title}>
        <div className={"padding-205 margin-y-2 bg-base-extra-light text-body radius-lg"}>
          <div className={"padding-bottom-1"}>{Config.envReqResultsPage.personalizedSupport.body}</div>
          <div className="flex flex-align-center">
            <Icon className={"margin-right-1"} iconName={"alternate_email"} />
            <div className={"text-underline"}>{Config.envReqResultsPage.personalizedSupport.contact}</div>
          </div>
        </div>
      </EnvQuestionnaireResultsAccordion>
    );
  };

  const contactDep = (): ReactElement => {
    return (
      <EnvQuestionnaireResultsAccordion title={Config.envReqResultsPage.contactDep.title}>
        <div className={"padding-205 margin-y-2 bg-base-extra-light radius-lg"}>
          <h4>{Config.envReqResultsPage.contactDep.waste.heading}</h4>
          <div className={"margin-x-105"}>
            <Content className={"padding-bottom-1"}>{Config.envReqResultsPage.contactDep.waste.body}</Content>
            <div className="flex flex-align-center">
              <Icon className={"margin-right-1"} iconName={"phone"} />
              <Content className={"text-underline"}>
                {Config.envReqResultsPage.contactDep.waste.contact}
              </Content>
            </div>
          </div>
        </div>
      </EnvQuestionnaireResultsAccordion>
    );
  };

  const seeYourResponses = (): ReactElement => {
    return (
      <EnvQuestionnaireResultsAccordion title={Config.envReqResultsPage.seeYourResponses.title}>
        <div>
          <ul>
            {getResponseTexts().map((value, i) => {
              return (
                <li key={i}>
                  <Content>{value}</Content>
                </li>
              );
            })}
          </ul>
        </div>
      </EnvQuestionnaireResultsAccordion>
    );
  };

  const highApplicability = (): ReactElement => {
    return (
      <>
        <Content className={"padding-bottom-3"}>{Config.envReqResultsPage.summary}</Content>
        {personalizedSupport()}
        {contactDep()}
        {seeYourResponses()}
      </>
    );
  };

  const lowApplicability = (): ReactElement => {
    return (
      <>
        <div className={"padding-y-1"}>
          <div>
            <span className={"text-bold margin-right-05"}>
              {Config.envReqResultsPage.lowApplicability.summaryLine1}
            </span>
            <Content>{Config.envReqResultsPage.lowApplicability.summaryLine2}</Content>
          </div>
        </div>
        <Callout calloutType={"note"} showIcon showHeader={false} showIconInBody={true}>
          <span>
            {Config.envReqResultsPage.lowApplicability.callout}
            <UnStyledButton className={"margin-left-05"} isUnderline onClick={onClick}>
              {Config.envReqResultsPage.lowApplicability.calloutRedo}
            </UnStyledButton>
          </span>
        </Callout>
      </>
    );
  };

  const isLowApplicability = (): boolean =>
    business?.environmentData?.land?.questionnaireData?.noLand ?? false;

  return (
    <>
      <h2>{Config.envReqResultsPage.title}</h2>
      <Alert variant={"success"}>
        <span className={"margin-right-05"}>{Config.envReqResultsPage.editInfo}</span>
        <UnStyledButton isUnderline onClick={onClick}>
          {Config.envReqResultsPage.editText}
        </UnStyledButton>
      </Alert>
      {isLowApplicability() ? lowApplicability() : highApplicability()}
    </>
  );
};

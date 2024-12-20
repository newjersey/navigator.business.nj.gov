import { Callout } from "@/components/Callout";
import { Content } from "@/components/Content";
import { Alert } from "@/components/njwds-extended/Alert";
import { UnStyledButton } from "@/components/njwds-extended/UnStyledButton";
import { Icon } from "@/components/njwds/Icon";
import { CheckWasteResultsAccordion } from "@/components/tasks/environment-questionnaire/CheckWasteResultsAccordion";
import { getMergedConfig } from "@/contexts/configContext";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { Task } from "@/lib/types/types";
import { WasteQuestionnaireFieldIds } from "@businessnjgovnavigator/shared/environment";
import { ReactElement } from "react";

interface Props {
  task: Task;
}

export const CheckWastePermitsResults = (props: Props): ReactElement<any> => {
  const { business, updateQueue } = useUserData();
  const Config = getMergedConfig();
  const questionnaireData = business?.environmentData?.waste?.questionnaireData;

  const onClick = (): void => {
    updateQueue
      ?.queueEnvironmentData({
        waste: {
          ...business?.environmentData?.waste,
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

    let fieldId: WasteQuestionnaireFieldIds;
    for (fieldId in questionnaireData) {
      questionnaireData[fieldId] === true &&
        optionsMarkedTrue.push(
          Config.wasteQuestionnaireQuestionsPage.wasteQuestionnaireOptions[
            fieldId as WasteQuestionnaireFieldIds
          ]
        );
    }

    return optionsMarkedTrue;
  };

  const personalizedSupport = (): ReactElement<any> => {
    return (
      <CheckWasteResultsAccordion title={Config.wasteQuestionnaireResultsPage.personalizedSupport.title}>
        <div className={"padding-205 margin-y-2 bg-base-extra-light text-body radius-lg"}>
          <div className={"padding-bottom-1"}>
            {Config.wasteQuestionnaireResultsPage.personalizedSupport.body}
          </div>
          <div className="flex flex-align-center">
            <Icon className={"margin-right-1"} iconName={"alternate_email"} />
            <div className={"text-underline"}>
              {Config.wasteQuestionnaireResultsPage.personalizedSupport.contact}
            </div>
          </div>
        </div>
      </CheckWasteResultsAccordion>
    );
  };

  const contactDep = (): ReactElement<any> => {
    return (
      <CheckWasteResultsAccordion title={Config.wasteQuestionnaireResultsPage.contactDep.title}>
        <div className={"padding-205 margin-y-2 bg-base-extra-light radius-lg"}>
          <h4>{Config.wasteQuestionnaireResultsPage.contactDep.heading}</h4>
          <div className={"margin-x-105"}>
            <Content className={"padding-bottom-1"}>
              {Config.wasteQuestionnaireResultsPage.contactDep.body}
            </Content>
            <div className="flex flex-align-center">
              <Icon className={"margin-right-1"} iconName={"phone"} />
              <Content className={"text-underline"}>
                {Config.wasteQuestionnaireResultsPage.contactDep.contact}
              </Content>
            </div>
          </div>
        </div>
      </CheckWasteResultsAccordion>
    );
  };

  const seeYourResponses = (): ReactElement<any> => {
    return (
      <CheckWasteResultsAccordion title={Config.wasteQuestionnaireResultsPage.seeYourResponses.title}>
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
      </CheckWasteResultsAccordion>
    );
  };

  const highApplicability = (): ReactElement<any> => {
    return (
      <>
        <div className={"padding-bottom-3"}>
          {Config.wasteQuestionnaireResultsPage.summaryPtOne}
          <span className={"text-bold margin-x-05"}>
            {Config.wasteQuestionnaireResultsPage.summaryMediaArea}
          </span>
          {Config.wasteQuestionnaireResultsPage.summaryPtTwo}
        </div>
        {personalizedSupport()}
        {contactDep()}
        {seeYourResponses()}
      </>
    );
  };

  const lowApplicability = (): ReactElement<any> => {
    return (
      <>
        <div className={"padding-y-1"}>
          <div className={"text-bold margin-bottom-1"}>
            {Config.wasteQuestionnaireResultsPage.lowApplicability.summaryLine1}
          </div>
          <Content>{Config.wasteQuestionnaireResultsPage.lowApplicability.summaryLine2}</Content>
        </div>
        <Callout calloutType={"note"} showIcon showHeader={false} showIconInBody={true}>
          <span>
            {Config.wasteQuestionnaireResultsPage.lowApplicability.callout}
            <UnStyledButton className={"margin-left-05"} isUnderline onClick={onClick}>
              {Config.wasteQuestionnaireResultsPage.lowApplicability.calloutRedo}
            </UnStyledButton>
          </span>
        </Callout>
      </>
    );
  };

  const isLowApplicability = (): boolean =>
    business?.environmentData?.waste?.questionnaireData?.noWaste ?? false;

  return (
    <>
      <h2>{Config.wasteQuestionnaireResultsPage.title}</h2>
      <Alert variant={"success"}>
        <span className={"margin-right-05"}>{Config.wasteQuestionnaireResultsPage.editInfo}</span>
        <UnStyledButton isUnderline onClick={onClick}>
          {Config.wasteQuestionnaireResultsPage.editText}
        </UnStyledButton>
      </Alert>
      {isLowApplicability() ? lowApplicability() : highApplicability()}
    </>
  );
};

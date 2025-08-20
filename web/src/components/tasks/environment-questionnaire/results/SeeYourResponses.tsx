import { Content } from "@/components/Content";
import { ResultsSectionAccordion } from "@/components/ResultsSectionAccordion";
import { EnvPermitContext } from "@/contexts/EnvPermitContext";
import { getMergedConfig } from "@businessnjgovnavigator/shared/contexts";
import {
  MediaArea,
  Questionnaire,
  QuestionnaireConfig,
  QuestionnaireFieldIds,
} from "@businessnjgovnavigator/shared/environment";
import { ReactElement, useContext } from "react";

export const SeeYourResponses = (): ReactElement => {
  const Config = getMergedConfig();
  const envContext = useContext(EnvPermitContext);

  const optionsMarkedTrueForMediaArea = (
    questionnaire: Questionnaire,
    mediaArea: MediaArea,
  ): string[] => {
    if (!questionnaire) return [];

    const optionsMarkedTrue: string[] = [];
    const questionnaireConfig = Config.envQuestionPage[mediaArea]
      .questionnaireOptions as QuestionnaireConfig;

    for (const [optionId, selected] of Object.entries(questionnaire)) {
      const text = questionnaireConfig[optionId as QuestionnaireFieldIds];
      selected === true && optionsMarkedTrue.push(text);
    }

    return optionsMarkedTrue;
  };

  const responses: Record<string, string[]> = {};

  const mediaAreas = envContext.applicableMediaAreas();

  for (const mediaArea of mediaAreas) {
    const questionnaire = envContext.state.questionnaireData[mediaArea as MediaArea];

    const optionsMarkedTrue = optionsMarkedTrueForMediaArea(
      questionnaire as Questionnaire,
      mediaArea as MediaArea,
    );

    responses[mediaArea] = optionsMarkedTrue;
  }

  return (
    <ResultsSectionAccordion title={Config.envResultsPage.seeYourResponses.title}>
      <div>
        {mediaAreas.map((mediaArea) => (
          <div key={mediaArea}>
            {responses[mediaArea].length > 0 && (
              <div className={"text-bold"} data-testid={`${mediaArea}-responses`}>
                {Config.envResultsPage.contactDep[mediaArea as MediaArea].heading}
              </div>
            )}
            <ul>
              {responses[mediaArea].map((value, i) => {
                return (
                  <li key={i}>
                    <Content>{value}</Content>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </ResultsSectionAccordion>
  );
};

import { Content } from "@/components/Content";
import { ResultsSectionAccordion } from "@/components/ResultsSectionAccordion";
import { optionsMarkedTrueForMediaArea } from "@/components/tasks/environment-questionnaire/results/helpers";
import { EnvRequirementsContext } from "@/contexts/EnvRequirementsContext";
import analytics from "@/lib/utils/analytics";
import { getMergedConfig } from "@businessnjgovnavigator/shared/contexts";
import { MediaArea, Questionnaire } from "@businessnjgovnavigator/shared/environment";
import { ReactElement, useContext } from "react";

export const SeeYourResponses = (): ReactElement => {
  const Config = getMergedConfig();
  const envContext = useContext(EnvRequirementsContext);

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
    <ResultsSectionAccordion
      title={Config.envResultsPage.seeYourResponses.title}
      onOpenFunc={
        analytics.event.gen_guidance_stepper_responses_accordion_opened.click
          .general_guidance_resp_accordion_opened
      }
    >
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

import { Content } from "@/components/Content";
import { ResultsSectionAccordion } from "@/components/tasks/environment-questionnaire/results/ResultsSectionAccordion";
import { getMergedConfig } from "@/contexts/configContext";
import { ReactElement } from "react";

interface Props {
  responseTexts: string[];
}

export const SeeYourResponses = (props: Props): ReactElement => {
  const Config = getMergedConfig();
  return (
    <ResultsSectionAccordion title={Config.envResultsPage.seeYourResponses.title}>
      <div>
        <ul>
          {props.responseTexts.map((value, i) => {
            return (
              <li key={i}>
                <Content>{value}</Content>
              </li>
            );
          })}
        </ul>
      </div>
    </ResultsSectionAccordion>
  );
};

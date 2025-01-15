import { Icon } from "@/components/njwds/Icon";
import { ResultsSectionAccordion } from "@/components/tasks/environment-questionnaire/results/ResultsSectionAccordion";
import { getMergedConfig } from "@/contexts/configContext";
import { ReactElement } from "react";

export const PersonalizedSupport = (): ReactElement => {
  const Config = getMergedConfig();
  return (
    <ResultsSectionAccordion title={Config.envResultsPage.personalizedSupport.title}>
      <div className={"padding-205 margin-y-2 bg-base-extra-light text-body radius-lg"}>
        <div className={"padding-bottom-1"}>{Config.envResultsPage.personalizedSupport.body}</div>
        <div className="flex flex-align-center">
          <Icon className={"margin-right-1"} iconName={"alternate_email"} />
          <a
            href={`mailto:${Config.envResultsPage.personalizedSupport.contact}`}
            className={"text-underline text-base-darkest"}
          >
            {Config.envResultsPage.personalizedSupport.contact}
          </a>
        </div>
      </div>
    </ResultsSectionAccordion>
  );
};

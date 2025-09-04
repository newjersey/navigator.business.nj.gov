import { Icon } from "@/components/njwds/Icon";
import { ResultsSectionAccordion } from "@/components/ResultsSectionAccordion";
import { getMergedConfig } from "@/contexts/configContext";
import analytics from "@/lib/utils/analytics";
import { ReactElement } from "react";

export const PersonalizedSupport = (): ReactElement => {
  const Config = getMergedConfig();
  return (
    <ResultsSectionAccordion
      title={Config.envResultsPage.personalizedSupport.title}
      onOpenFunc={
        analytics.event.gen_guidance_stepper_sbap_accordion_opened.click
          .general_guidance_sbap_accordion_opened
      }
    >
      <div className={"padding-205 margin-y-2 bg-base-extra-light text-body radius-lg"}>
        <div className={"padding-bottom-1"}>{Config.envResultsPage.personalizedSupport.body}</div>
        <div className="flex flex-align-center">
          <Icon className={"margin-right-1"} iconName={"alternate_email"} />
          <a
            href={`mailto:${Config.envResultsPage.personalizedSupport.contact}`}
            className={"text-underline text-base-darkest"}
            onMouseEnter={
              analytics.event.gen_guidance_stepper_contact_info_engagement.mouseover
                .general_guidance_contact_info_engage
            }
          >
            {Config.envResultsPage.personalizedSupport.contact}
          </a>
        </div>
      </div>
    </ResultsSectionAccordion>
  );
};

import { Content } from "@/components/Content";
import { Icon } from "@/components/njwds/Icon";
import { ResultsSectionAccordion } from "@/components/ResultsSectionAccordion";
import { EnvPermitContext } from "@/contexts/EnvPermitContext";
import analytics from "@/lib/utils/analytics";
import { templateEval } from "@/lib/utils/helpers";
import { getMergedConfig } from "@businessnjgovnavigator/shared/contexts";
import { MediaArea } from "@businessnjgovnavigator/shared/environment";
import { ReactElement, useContext } from "react";

export const ContactDep = (): ReactElement => {
  const Config = getMergedConfig();
  const envContext = useContext(EnvPermitContext);

  const contactCard = (mediaArea: MediaArea): ReactElement => {
    const contactConfig = Config.envResultsPage.contactDep[mediaArea];
    return (
      <div className={"padding-205 margin-y-2 bg-base-extra-light radius-lg"}>
        <h4>{contactConfig.heading}</h4>
        <div className={"margin-x-105"}>
          <Content className={"padding-bottom-1"}>
            {templateEval(Config.envResultsPage.contactDep.body, {
              bodyLink: contactConfig.bodyLink,
            })}
          </Content>
          <div className="flex flex-align-center flex-wrap">
            <Icon className={"margin-right-1"} iconName={"phone"} />
            {contactConfig.contact.phoneInfo && (
              <span className="margin-right-05">{contactConfig.contact.phoneInfo}</span>
            )}
            <a
              className={"text-base-darkest"}
              href={`tel:${contactConfig.contact.phone}`}
              onMouseEnter={
                analytics.event.gen_guidance_stepper_contact_info_engagement.mouseover
                  .general_guidance_contact_info_engage
              }
            >
              {contactConfig.contact.phone}
            </a>
          </div>
          {contactConfig.contact.form && (
            <div
              className="flex flex-align-center margin-top-05"
              onMouseEnter={
                analytics.event.gen_guidance_stepper_contact_info_engagement.mouseover
                  .general_guidance_contact_info_engage
              }
            >
              <Icon className={"margin-right-1"} iconName={"language"} />
              <Content className={"text-underline text-base-darkest"}>
                {contactConfig.contact.form}
              </Content>
            </div>
          )}
          {contactConfig.contact.email && (
            <div
              className="flex flex-align-center margin-top-05"
              onMouseEnter={
                analytics.event.gen_guidance_stepper_contact_info_engagement.mouseover
                  .general_guidance_contact_info_engage
              }
            >
              <Icon className={"margin-right-1"} iconName={"alternate_email"} />
              <a
                href={`mailto:${contactConfig.contact.email}`}
                className={"text-underline text-base-darkest"}
              >
                {contactConfig.contact.email}
              </a>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <ResultsSectionAccordion
      title={Config.envResultsPage.contactDep.title}
      onOpenFunc={
        analytics.event.gen_guidance_stepper_dep_accordion_opened.click
          .general_guidance_dep_accordion_opened
      }
    >
      {envContext.applicableMediaAreas().map((mediaArea) => {
        return (
          <div key={mediaArea} data-testid={`contact-${mediaArea}`}>
            {contactCard(mediaArea)}
          </div>
        );
      })}
    </ResultsSectionAccordion>
  );
};

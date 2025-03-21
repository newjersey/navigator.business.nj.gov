import { Content } from "@/components/Content";
import { Icon } from "@/components/njwds/Icon";
import { ResultsSectionAccordion } from "@/components/tasks/environment-questionnaire/results/ResultsSectionAccordion";
import { getMergedConfig } from "@/contexts/configContext";
import { templateEval } from "@/lib/utils/helpers";
import { MediaArea } from "@businessnjgovnavigator/shared/environment";
import { ReactElement } from "react";

interface Props {
  mediaArea: MediaArea;
}

export const ContactDep = (props: Props): ReactElement => {
  const Config = getMergedConfig();
  const contactConfig = Config.envResultsPage.contactDep[props.mediaArea];
  return (
    <ResultsSectionAccordion title={Config.envResultsPage.contactDep.title}>
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
            <a className={"text-base-darkest"} href={`tel:${contactConfig.contact.phone}`}>
              {contactConfig.contact.phone}
            </a>
          </div>
          {contactConfig.contact.form && (
            <div className="flex flex-align-center margin-top-05">
              <Icon className={"margin-right-1"} iconName={"language"} />
              <Content className={"text-underline text-base-darkest"}>{contactConfig.contact.form}</Content>
            </div>
          )}
          {contactConfig.contact.email && (
            <div className="flex flex-align-center margin-top-05">
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
    </ResultsSectionAccordion>
  );
};

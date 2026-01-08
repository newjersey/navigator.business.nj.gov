import { Content } from "@/components/Content";
import { LargeCallout } from "@/components/njwds-extended/callout/LargeCallout";
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
    const bodyText = templateEval(Config.envResultsPage.contactDep.body, {
      bodyLink: contactConfig.bodyLink,
    });

    return (
      <div
        onMouseEnter={
          analytics.event.gen_guidance_stepper_contact_info_engagement.mouseover
            .general_guidance_contact_info_engage
        }
      >
        <LargeCallout
          calloutType="quickReference"
          showHeader={true}
          headerText={contactConfig.heading}
          phoneIconText={contactConfig.contact.phone || undefined}
          phoneIconLabel={contactConfig.contact.phoneInfo || undefined}
          emailIconText={contactConfig.contact.email || undefined}
          linkIconText={contactConfig.contact.form || undefined}
        >
          <Content>{bodyText}</Content>
        </LargeCallout>
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

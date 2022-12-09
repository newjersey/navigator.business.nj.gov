import { Content } from "@/components/Content";
import { OpportunityCard } from "@/components/dashboard/OpportunityCard";
import { SidebarCard } from "@/components/dashboard/SidebarCard";
import { Icon } from "@/components/njwds/Icon";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { Certification, Funding, SidebarCardContent } from "@/lib/types/types";
import { templateEval } from "@/lib/utils/helpers";
import { Accordion, AccordionDetails, AccordionSummary } from "@mui/material";
import { ReactElement, useState } from "react";

interface Props {
  topCards: SidebarCardContent[];
  bottomCards: SidebarCardContent[];
  fundings: Funding[];
  hiddenFundings: Funding[];
  certifications: Certification[];
  hiddenCertifications: Certification[];
  displayFundings: boolean;
  displayCertifications: boolean;
}

export const SidebarCardsList = (props: Props): ReactElement => {
  const [hiddenAccordionIsOpen, setHiddenAccordionIsOpen] = useState<boolean>(false);
  const { Config } = useConfig();

  const hiddenOpportunitiesCount = (): number => {
    if (props.displayCertifications && props.displayFundings) {
      return props.hiddenCertifications.length + props.hiddenFundings.length;
    } else if (props.displayCertifications) {
      return props.hiddenCertifications.length;
    } else if (props.hiddenFundings) {
      return props.hiddenFundings.length;
    } else {
      return 0;
    }
  };

  const showEmptyState = () => {
    return (
      props.displayCertifications &&
      props.displayFundings &&
      props.certifications.length + props.fundings.length === 0
    );
  };

  const hiddenCardsAccordion = () => {
    if (props.displayCertifications) {
      return (
        <>
          <hr className="desktop:margin-right-1 margin-top-3 bg-cool-lighter" aria-hidden={true} />
          <div className="desktop:margin-right-3 desktop:margin-bottom-1">
            <Accordion
              elevation={0}
              expanded={hiddenAccordionIsOpen}
              onChange={() => {
                return setHiddenAccordionIsOpen((prevAccordionStatus) => {
                  return !prevAccordionStatus;
                });
              }}
              sx={{
                backgroundColor: `#F9FBFB`,
              }}
            >
              <AccordionSummary
                expandIcon={<Icon className="usa-icon--size-5 margin-x-1 text-normal">expand_more</Icon>}
                aria-controls="hidden-opportunity-content"
                id="hidden-opportunity-header"
                data-testid="hidden-opportunity-header"
              >
                <div className="margin-y-2">
                  <div className="flex flex-align-center margin-0-override text-normal">
                    <div className="inline">
                      {templateEval(Config.dashboardDefaults.hiddenOpportunitiesHeader, {
                        count: String(hiddenOpportunitiesCount()),
                      })}
                    </div>
                  </div>
                </div>
              </AccordionSummary>
              <AccordionDetails data-testid="hidden-opportunities">
                {props.hiddenCertifications.map((cert) => {
                  return <OpportunityCard key={cert.id} opportunity={cert} urlPath="certification" />;
                })}
                {props.displayFundings &&
                  props.hiddenFundings.map((funding) => {
                    return <OpportunityCard key={funding.id} opportunity={funding} urlPath="funding" />;
                  })}
              </AccordionDetails>
            </Accordion>
          </div>
          <hr className="desktop:margin-right-1 margin-bottom-3 bg-cool-lighter" aria-hidden={true} />
        </>
      );
    } else {
      return <></>;
    }
  };

  const learnMoreAboutFundingsLink = () => {
    return (
      <>
        <hr className="desktop:margin-right-1 margin-top-3 bg-cool-lighter" aria-hidden={true} />
        <div className="margin-y-205 weight-unset-override">
          <Content>{Config.dashboardDefaults.learnMoreFundingOpportunities}</Content>
        </div>
      </>
    );
  };

  return (
    <>
      <h2 className="h1-styling margin-top-0">{Config.dashboardDefaults.sidebarHeading}</h2>
      <hr
        className="desktop:margin-right-1 margin-top-2 margin-bottom-3 bg-cool-lighter"
        aria-hidden={true}
      />

      <div className="dashboard-opportunities-list desktop:margin-right-1">
        <>
          {props.topCards.map((card) => {
            return <SidebarCard card={card} key={card.id} />;
          })}
        </>
        <div className="desktop:padding-right-105" data-testid="visible-opportunities">
          {props.displayCertifications &&
            props.certifications.map((cert) => {
              return <OpportunityCard key={cert.id} opportunity={cert} urlPath="certification" />;
            })}

          {props.displayFundings &&
            props.fundings.map((funding) => {
              return <OpportunityCard key={funding.id} opportunity={funding} urlPath="funding" />;
            })}
          {showEmptyState() && (
            <div className="fdc fac margin-y-3">
              <h3 className="text-normal">{Config.dashboardDefaults.emptyOpportunitiesHeader}</h3>
              <img src={`/img/signpost.svg`} className="" alt="" />
              <p className="text-center">{Config.dashboardDefaults.emptyOpportunitiesText}</p>
            </div>
          )}
        </div>
        <>
          {props.bottomCards.map((card) => {
            return <SidebarCard card={card} key={card.id} />;
          })}
        </>
      </div>
      {props.displayFundings && learnMoreAboutFundingsLink()}
      {hiddenCardsAccordion()}
    </>
  );
};

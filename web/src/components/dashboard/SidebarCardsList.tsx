import { Content } from "@/components/Content";
import { OpportunityCard } from "@/components/dashboard/OpportunityCard";
import { SidebarCard } from "@/components/dashboard/SidebarCard";
import { Heading } from "@/components/njwds-extended/Heading";
import { PrimaryButton } from "@/components/njwds-extended/PrimaryButton";
import { Icon } from "@/components/njwds/Icon";
import { MediaQueries } from "@/lib/PageSizes";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { isRemoteWorkerOrSellerBusiness } from "@/lib/domain-logic/businessPersonaHelpers";
import { getForYouCardCount } from "@/lib/domain-logic/getForYouCardCount";
import { Certification, Funding, SidebarCardContent } from "@/lib/types/types";
import analytics from "@/lib/utils/analytics";
import { openInNewTab, scrollToTopOfElement, templateEval } from "@/lib/utils/helpers";
import { Accordion, AccordionDetails, AccordionSummary, useMediaQuery } from "@mui/material";
import { ReactElement, ReactNode, useRef, useState } from "react";

export interface SidebarCardsListProps {
  topCards: SidebarCardContent[];
  bottomCards: SidebarCardContent[];
  fundings: Funding[];
  hiddenFundings: Funding[];
  certifications: Certification[];
  hiddenCertifications: Certification[];
  displayFundings: boolean;
  displayCertifications: boolean;
  isCMSPreview?: boolean;
}

export const SidebarCardsList = (props: SidebarCardsListProps): ReactElement => {
  const [hiddenAccordionIsOpen, setHiddenAccordionIsOpen] = useState<boolean>(false);
  const { Config } = useConfig();
  const { business } = useUserData();
  const accordionRef = useRef(null);

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

  const isDesktopAndUp = useMediaQuery(MediaQueries.desktopAndUp);

  const hiddenCardsAccordion = (): ReactNode => {
    if (props.displayCertifications || props.displayFundings) {
      return (
        <>
          <hr className="margin-top-3 bg-cool-lighter" aria-hidden={true} />
          <div className="desktop:margin-bottom-1">
            <Accordion
              ref={accordionRef}
              expanded={hiddenAccordionIsOpen}
              onChange={(): void => {
                if (!hiddenAccordionIsOpen) {
                  analytics.event.for_you_card_unhide_button.click.unhide_cards();
                  const element = accordionRef.current as unknown as HTMLElement;
                  if (element) {
                    const timeForAccordionToOpen = 200;
                    scrollToTopOfElement(element.parentElement as HTMLDivElement, {
                      isDesktop: isDesktopAndUp,
                      waitTime: timeForAccordionToOpen,
                    });
                  }
                }
                setHiddenAccordionIsOpen((prevAccordionStatus) => {
                  return !prevAccordionStatus;
                });
              }}
              sx={{
                backgroundColor: `#F9FBFB`,
              }}
            >
              <AccordionSummary
                expandIcon={<Icon className="usa-icon--size-5 margin-left-1">expand_more</Icon>}
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
          <hr className="margin-bottom-3 bg-cool-lighter" aria-hidden={true} />
        </>
      );
    } else {
      return <></>;
    }
  };

  const learnMoreAboutFundingsLink = (): ReactNode => {
    return (
      <>
        <hr className="margin-top-3 bg-cool-lighter" aria-hidden={true} />
        <div className="margin-y-3 weight-unset-override">
          <PrimaryButton
            isColor={"accent-cooler"}
            isRightMarginRemoved={true}
            isFullWidthOnDesktop={true}
            onClick={(): void => openInNewTab(Config.dashboardDefaults.learnMoreFundingOpportunitiesLink)}
          >
            {Config.dashboardDefaults.learnMoreFundingOpportunitiesText}
          </PrimaryButton>
        </div>
      </>
    );
  };

  const emptyForYouMessage = (): ReactNode => {
    const showEmptyOpportunitiesMsg =
      props.displayCertifications &&
      props.displayFundings &&
      props.certifications.length + props.fundings.length === 0;

    const showCompleteRequiredTasksMsg =
      !props.displayCertifications &&
      !props.displayFundings &&
      props.topCards.length + props.bottomCards.length === 0;

    const showEmptyForYouMessage =
      showEmptyOpportunitiesMsg || showCompleteRequiredTasksMsg || isRemoteWorkerOrSellerBusiness(business);

    const getTopText = (): string => {
      if (isRemoteWorkerOrSellerBusiness(business) || props.isCMSPreview)
        return Config.dashboardDefaults.emptyOpportunitiesRemoteSellerWorkerText;
      if (showCompleteRequiredTasksMsg) return Config.dashboardDefaults.completeRequiredTasksText;
      if (showEmptyOpportunitiesMsg) return Config.dashboardDefaults.emptyOpportunitiesHeader;
      return "";
    };

    const getBottomText = (): string => {
      if (showEmptyOpportunitiesMsg) return Config.dashboardDefaults.emptyOpportunitiesText;
      return "";
    };

    return (
      showEmptyForYouMessage && (
        <div className="fdc fac margin-y-3" data-testid="empty-for-you-message">
          <div className="text-center margin-bottom-3">
            <Content>{getTopText()}</Content>
          </div>
          <img src={`/img/for-you-section.svg`} aria-hidden="true" alt="" />
          <p className="text-center">{getBottomText()}</p>
        </div>
      )
    );
  };

  return (
    <>
      {isDesktopAndUp && (
        <>
          <Heading level={2} className="margin-top-0 font-weight-normal">
            {Config.dashboardDefaults.sidebarHeading}
            <span data-testid="for-you-counter" className="margin-left-05 text-base">
              ({getForYouCardCount(business, props.certifications, props.fundings)})
            </span>
          </Heading>
          <hr className="margin-top-2 margin-bottom-3 bg-cool-lighter" aria-hidden={true} />
        </>
      )}
      <div>
        <div data-testid="top-cards">
          {props.topCards.map((card) => {
            return <SidebarCard card={card} key={card.id} />;
          })}
        </div>
        {emptyForYouMessage()}
        <div data-testid="visible-opportunities">
          {props.displayCertifications &&
            props.certifications.map((cert) => {
              return <OpportunityCard key={cert.id} opportunity={cert} urlPath="certification" />;
            })}

          {props.displayFundings &&
            props.fundings.map((funding) => {
              return <OpportunityCard key={funding.id} opportunity={funding} urlPath="funding" />;
            })}
        </div>
        <div data-testid="bottom-cards">
          {props.bottomCards.map((card) => {
            return <SidebarCard card={card} key={card.id} />;
          })}
        </div>
      </div>
      {props.displayFundings && learnMoreAboutFundingsLink()}
      {hiddenCardsAccordion()}
    </>
  );
};

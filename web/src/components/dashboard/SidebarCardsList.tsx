import { Content } from "@/components/Content";
import { OpportunityCard } from "@/components/dashboard/OpportunityCard";
import { SidebarCard } from "@/components/dashboard/SidebarCard";
import { Heading } from "@/components/njwds-extended/Heading";
import { PrimaryButton } from "@/components/njwds-extended/PrimaryButton";
import { Icon } from "@/components/njwds/Icon";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { Certification, Funding, SidebarCardContent } from "@/lib/types/types";
import analytics from "@/lib/utils/analytics";
import { openInNewTab, scrollToTopOfElement, templateEval } from "@/lib/utils/helpers";
import { Accordion, AccordionDetails, AccordionSummary } from "@mui/material";
import { ReactElement, useRef, useState } from "react";

export interface SidebarCardsListProps {
  sideBarCards: SidebarCardContent[];
  fundings: Funding[];
  hiddenFundings: Funding[];
  certifications: Certification[];
  hiddenCertifications: Certification[];
  isRemoteSellerWorker?: boolean;
  displayFundingCards?: boolean;
  displayCertificationsCards?: boolean;
  cardCount: number;
}

export const SidebarCardsList = (props: SidebarCardsListProps): ReactElement => {
  const [hiddenAccordionIsOpen, setHiddenAccordionIsOpen] = useState<boolean>(false);
  const { Config } = useConfig();
  const { userData } = useUserData();
  const accordionRef = useRef(null);

  const shouldPrioritizeFundingsOverCertifications =
    userData?.user.accountCreationSource === "investNewark" ||
    userData?.user.accountCreationSource === "NJEDA";

  const hiddenOpportunitiesCount = (): number => {
    if (props.displayCertificationsCards && props.displayFundingCards) {
      return props.hiddenCertifications.length + props.hiddenFundings.length;
    } else if (props.displayCertificationsCards) {
      return props.hiddenCertifications.length;
    } else if (props.hiddenFundings) {
      return props.hiddenFundings.length;
    } else {
      return 0;
    }
  };

  const showEmptyOpportunitiesMsg =
    props.displayCertificationsCards &&
    props.displayFundingCards &&
    props.certifications.length + props.fundings.length === 0;
  const showCompleteRequiredTasksMsg =
    !props.displayCertificationsCards && !props.displayFundingCards && props.sideBarCards.length === 0;
  const getEmptyForYouMessageTopText = (): string => {
    if (props.isRemoteSellerWorker) return Config.dashboardDefaults.emptyOpportunitiesRemoteSellerWorkerText;
    if (showCompleteRequiredTasksMsg) return Config.dashboardDefaults.completeRequiredTasksText;
    if (showEmptyOpportunitiesMsg) return Config.dashboardDefaults.emptyOpportunitiesHeader;
    return "";
  };
  const getEmptyForYouMessageBottomText = (): string => {
    if (showEmptyOpportunitiesMsg) return Config.dashboardDefaults.emptyOpportunitiesText;
    return "";
  };

  const renderEmptyForYouMessage =
    showEmptyOpportunitiesMsg || showCompleteRequiredTasksMsg || props.isRemoteSellerWorker;
  const renderFundingCards = props.displayFundingCards;
  const renderCertificationsCards = props.displayCertificationsCards;
  const renderHiddenOpportunitiesAccordian = props.displayCertificationsCards || props.displayFundingCards;
  const renderFundingsInHiddenOpportunitiesAccordian = props.displayFundingCards;
  const renderLearnMoreFundingOpportunities = props.displayFundingCards;

  return (
    <>
      {!renderEmptyForYouMessage && (
        <div className="desktop:display-none">
          <Heading level={2}>
            {Config.dashboardDefaults.sidebarHeading}
            {props.cardCount > 0 && (
              <span data-testid="for-you-counter" className="margin-left-05 text-base">
                ({props.cardCount})
              </span>
            )}
          </Heading>
        </div>
      )}
      <div className={"display-none desktop:display-block"}>
        <Heading level={2} className="margin-top-0 font-weight-normal">
          {Config.dashboardDefaults.sidebarHeading}
          <span data-testid="for-you-counter" className="margin-left-05 text-base">
            ({props.cardCount})
          </span>
        </Heading>
        <hr className="margin-top-2 margin-bottom-3 bg-cool-lighter" aria-hidden={true} />
      </div>

      {props.sideBarCards.map((card) => {
        return <SidebarCard card={card} key={card.id} />;
      })}
      {renderEmptyForYouMessage && (
        <div className="fdc fac margin-y-3" data-testid="empty-for-you-message">
          <div className="text-center margin-bottom-3">
            <div className="desktop:display-none">
              <Content>{getEmptyForYouMessageTopText()}</Content>
            </div>
            <div className="display-none desktop:display-block">
              <Heading level={3}>
                <Content>{getEmptyForYouMessageTopText()}</Content>
              </Heading>
            </div>
          </div>
          <img src={`/img/for-you-section.svg`} aria-hidden="true" alt="" />
          <p className="text-center">{getEmptyForYouMessageBottomText()}</p>
        </div>
      )}
      <div data-testid="visible-opportunities">
        {shouldPrioritizeFundingsOverCertifications &&
          props.fundings.map((funding) => {
            return <OpportunityCard key={funding.id} opportunity={funding} urlPath="funding" />;
          })}

        {renderCertificationsCards &&
          props.certifications.map((cert) => {
            return <OpportunityCard key={cert.id} opportunity={cert} urlPath="certification" />;
          })}

        {renderFundingCards &&
          !shouldPrioritizeFundingsOverCertifications &&
          props.fundings.map((funding) => {
            return <OpportunityCard key={funding.id} opportunity={funding} urlPath="funding" />;
          })}
      </div>
      {renderLearnMoreFundingOpportunities && (
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
      )}
      {renderHiddenOpportunitiesAccordian && (
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
                expandIcon={<Icon className="usa-icon--size-5 margin-left-1" iconName="expand_more" />}
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
                {renderFundingsInHiddenOpportunitiesAccordian &&
                  props.hiddenFundings.map((funding) => {
                    return <OpportunityCard key={funding.id} opportunity={funding} urlPath="funding" />;
                  })}
              </AccordionDetails>
            </Accordion>
          </div>
          <hr className="margin-bottom-3 bg-cool-lighter" aria-hidden={true} />
        </>
      )}
    </>
  );
};

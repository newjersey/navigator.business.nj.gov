import { Content } from "@/components/Content";
import { OpportunityCard } from "@/components/dashboard/OpportunityCard";
import { SidebarCard } from "@/components/dashboard/SidebarCard";
import { Icon } from "@/components/njwds/Icon";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { filterCertifications } from "@/lib/domain-logic/filterCertifications";
import { filterFundings } from "@/lib/domain-logic/filterFundings";
import { getVisibleCertifications } from "@/lib/domain-logic/getVisibleCertifications";
import { getVisibleFundings } from "@/lib/domain-logic/getVisibleFundings";
import { sortCertifications } from "@/lib/domain-logic/sortCertifications";
import { sortFundings } from "@/lib/domain-logic/sortFundings";
import { Certification, Funding, SidebarCardContent } from "@/lib/types/types";
import { templateEval } from "@/lib/utils/helpers";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { LookupOperatingPhaseById, UserData } from "@businessnjgovnavigator/shared";
import { Accordion, AccordionDetails, AccordionSummary } from "@mui/material";
import { ReactElement, useState } from "react";

interface Props {
  sidebarDisplayContent: Record<string, SidebarCardContent>;
  certifications: Certification[];
  fundings: Funding[];
}

export const SidebarCardsList = (props: Props): ReactElement => {
  const { userData } = useUserData();
  const [hiddenAccordionIsOpen, setHiddenAccordionIsOpen] = useState<boolean>(false);

  const filteredSortedFundings = userData ? sortFundings(filterFundings(props.fundings, userData)) : [];

  const filteredSortedCertifications = userData
    ? sortCertifications(filterCertifications(props.certifications, userData))
    : [];

  const visibleSortedFundings = getVisibleFundings(filteredSortedFundings, userData as UserData);

  const visibleSortedCertifications = getVisibleCertifications(
    filteredSortedCertifications,
    userData as UserData
  );

  const hiddenSortedCertifications = sortCertifications(
    (userData?.preferences.hiddenCertificationIds || [])
      .map((id) => props.certifications.find((it) => it.id === id))
      .filter((it) => it !== undefined) as Certification[]
  );

  const hiddenSortedFundings = sortFundings(
    (userData?.preferences.hiddenFundingIds || [])
      .map((id) => props.fundings.find((it) => it.id === id))
      .filter((it) => it !== undefined) as Funding[]
  );

  const displayFundingCards = () =>
    LookupOperatingPhaseById(userData?.profileData.operatingPhase).displayFundings;

  const displayCertificationsCards = () =>
    LookupOperatingPhaseById(userData?.profileData.operatingPhase).displayCertifications;

  const hiddenOpportunitiesCount = (): number => {
    if (!userData) return 0;

    const displayCertifications = displayCertificationsCards();
    const displayFunding = displayFundingCards();

    if (displayCertifications && displayFunding) {
      return (
        userData.preferences.hiddenFundingIds.length + userData.preferences.hiddenCertificationIds.length
      );
    } else if (displayCertifications) {
      return userData.preferences.hiddenCertificationIds.length;
    } else if (displayFunding) {
      return userData.preferences.hiddenFundingIds.length;
    } else {
      return 0;
    }
  };

  const visibleCardsOrderedByWeight = userData
    ? userData.preferences.visibleSidebarCards
        .map((id: string) => props.sidebarDisplayContent[id])
        .sort((cardA: SidebarCardContent, cardB: SidebarCardContent): number => {
          return cardA.weight < cardB.weight ? -1 : 1;
        })
    : [];

  const hiddenCardsAccordion = () => {
    if (displayCertificationsCards()) {
      return (
        <>
          <hr className="desktop:margin-right-1 margin-top-3 bg-cool-lighter" aria-hidden={true} />
          <div className="desktop:margin-right-3 desktop:margin-bottom-1">
            <Accordion
              elevation={0}
              expanded={hiddenAccordionIsOpen}
              onChange={() => setHiddenAccordionIsOpen((prevAccordionStatus) => !prevAccordionStatus)}
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
                {hiddenSortedCertifications.map((cert) => (
                  <OpportunityCard key={cert.id} opportunity={cert} urlPath="certification" />
                ))}
                {displayFundingCards() &&
                  hiddenSortedFundings.map((funding) => (
                    <OpportunityCard key={funding.id} opportunity={funding} urlPath="funding" />
                  ))}
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

  const learnMoreAboutFundingsLink = () => (
    <>
      <hr className="desktop:margin-right-1 margin-top-3 bg-cool-lighter" aria-hidden={true} />
      <div className="margin-y-205 weight-unset-override">
        <Content>{Config.dashboardDefaults.learnMoreFundingOpportunities}</Content>
      </div>
    </>
  );

  const topCardIds = new Set(["funding-nudge"]);
  const getTopCards = () =>
    visibleCardsOrderedByWeight
      .filter((card) => {
        return topCardIds.has(card.id);
      })
      .map((card: SidebarCardContent) => <SidebarCard card={card} key={card.id} />);

  const getBottomCards = () =>
    visibleCardsOrderedByWeight
      .filter((card) => {
        return !topCardIds.has(card.id);
      })
      .map((card: SidebarCardContent) => <SidebarCard card={card} key={card.id} />);

  const showEmptyState = () =>
    displayCertificationsCards() &&
    displayFundingCards() &&
    visibleSortedCertifications.length + visibleSortedFundings.length === 0;

  return (
    <>
      <h2>{Config.dashboardDefaults.sidebarHeading}</h2>
      <hr
        className="desktop:margin-right-1 margin-top-2 margin-bottom-3 bg-cool-lighter"
        aria-hidden={true}
      />

      <div className="dashboard-opportunities-list desktop:margin-right-1">
        <>{getTopCards()}</>
        <div className="desktop:padding-right-105" data-testid="visible-opportunities">
          {displayCertificationsCards() &&
            visibleSortedCertifications.map((cert) => (
              <OpportunityCard key={cert.id} opportunity={cert} urlPath="certification" />
            ))}

          {displayFundingCards() &&
            visibleSortedFundings.map((funding) => (
              <OpportunityCard key={funding.id} opportunity={funding} urlPath="funding" />
            ))}
          {showEmptyState() && (
            <div className="fdc fac margin-y-3">
              <h3 className="text-normal">{Config.dashboardDefaults.emptyOpportunitiesHeader}</h3>
              <img src={`/img/signpost.svg`} className="" alt="" />
              <p className="text-center">{Config.dashboardDefaults.emptyOpportunitiesText}</p>
            </div>
          )}
        </div>
        <>{getBottomCards()}</>
      </div>
      {displayFundingCards() && learnMoreAboutFundingsLink()}
      {hiddenCardsAccordion()}
    </>
  );
};

import { Content } from "@/components/Content";
import { OpportunityCard } from "@/components/dashboard/OpportunityCard";
import { SidebarCard } from "@/components/dashboard/SidebarCard";
import { Heading } from "@/components/njwds-extended/Heading";
import { PrimaryButton } from "@/components/njwds-extended/PrimaryButton";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { openInNewTab } from "@/lib/utils/helpers";
import { Certification, Funding, SidebarCardContent } from "@businessnjgovnavigator/shared/types";
import { ReactElement } from "react";

export interface SidebarCardsListProps {
  sideBarCards: SidebarCardContent[];
  fundings: Funding[];
  certifications: Certification[];
  isRemoteSellerWorker?: boolean;
  displayFundingCards?: boolean;
  displayCertificationsCards?: boolean;
  cardCount: number;
}

export const SidebarCardsList = (props: SidebarCardsListProps): ReactElement => {
  const { Config } = useConfig();
  const { userData } = useUserData();

  const shouldPrioritizeFundingsOverCertifications =
    userData?.user.accountCreationSource === "investNewark" ||
    userData?.user.accountCreationSource === "NJEDA";
  const showEmptyOpportunitiesMsg =
    props.displayCertificationsCards &&
    props.displayFundingCards &&
    props.certifications.length + props.fundings.length === 0;
  const showCompleteRequiredTasksMsg =
    !props.displayCertificationsCards &&
    !props.displayFundingCards &&
    props.sideBarCards.length === 0;
  const getEmptyForYouMessageTopText = (): string => {
    if (props.isRemoteSellerWorker)
      return Config.dashboardDefaults.emptyOpportunitiesRemoteSellerWorkerText;
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
        <Heading level={2} className="margin-top-0">
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
              onClick={(): void =>
                openInNewTab(Config.dashboardDefaults.learnMoreFundingOpportunitiesLink)
              }
            >
              {Config.dashboardDefaults.learnMoreFundingOpportunitiesText}
            </PrimaryButton>
          </div>
        </>
      )}
    </>
  );
};

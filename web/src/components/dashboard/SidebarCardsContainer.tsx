import { SidebarCardsList } from "@/components/dashboard/SidebarCardsList";
import { useUserData } from "@/lib/data-hooks/useUserData";
import SidebarCardsHelpers from "@/lib/domain-logic/sidebarCardsHelpers";
import { Certification, Funding, SidebarCardContent } from "@/lib/types/types";
import { LookupOperatingPhaseById } from "@businessnjgovnavigator/shared/";
import { isRemoteWorkerOrSellerBusiness } from "@businessnjgovnavigator/shared/domain-logic/businessPersonaHelpers";
import { ReactElement } from "react";

interface Props {
  sidebarDisplayContent: Record<string, SidebarCardContent>;
  certifications: Certification[];
  fundings: Funding[];
}

export const SidebarCardsContainer = (props: Props): ReactElement => {
  const { business } = useUserData();
  const sidebarCardsHelpers = new SidebarCardsHelpers();

  const visibleSidebarCards = sidebarCardsHelpers.getVisibleSideBarCards(
    business,
    props.sidebarDisplayContent
  );
  const visibleSortedFundings = sidebarCardsHelpers.getVisibleFundings(
    sidebarCardsHelpers.sortFundings(
      sidebarCardsHelpers.filterFundings({ fundings: props.fundings, business: business })
    ),
    business
  );
  const hiddenSortedFundings = sidebarCardsHelpers.sortFundings(
    sidebarCardsHelpers.getHiddenFundings(business, props.fundings)
  );
  const visibleSortedCertifications = sidebarCardsHelpers.getVisibleCertifications(
    sidebarCardsHelpers.sortCertifications(
      sidebarCardsHelpers.filterCertifications({ certifications: props.certifications, business: business })
    ),
    business
  );
  const hiddenSortedCertifications = sidebarCardsHelpers.sortCertifications(
    sidebarCardsHelpers.getHiddenCertifications(business, props.certifications)
  );

  const remoteSellerWorker = isRemoteWorkerOrSellerBusiness(business);

  return (
    <SidebarCardsList
      sideBarCards={visibleSidebarCards}
      fundings={visibleSortedFundings}
      hiddenFundings={hiddenSortedFundings}
      certifications={visibleSortedCertifications}
      hiddenCertifications={hiddenSortedCertifications}
      isRemoteSellerWorker={remoteSellerWorker}
      displayFundingCards={LookupOperatingPhaseById(business?.profileData.operatingPhase).displayFundings}
      displayCertificationsCards={
        LookupOperatingPhaseById(business?.profileData.operatingPhase).displayCertifications
      }
      cardCount={sidebarCardsHelpers.getForYouCardCount(business, props.certifications, props.fundings)}
    />
  );
};

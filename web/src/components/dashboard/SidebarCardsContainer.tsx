import { SidebarCardsList } from "@/components/dashboard/SidebarCardsList";
import { useUserData } from "@/lib/data-hooks/useUserData";
import {
  filterCertifications,
  filterFundings,
  getForYouCardCount,
  getHiddenCertifications,
  getHiddenFundings,
  getVisibleCertifications,
  getVisibleFundings,
  getVisibleSideBarCards,
  sortCertifications,
  sortFundingsForUser,
} from "@/lib/domain-logic/sidebarCardsHelpers";
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
  const { business, userData } = useUserData();

  const visibleSidebarCards = getVisibleSideBarCards(business, props.sidebarDisplayContent);
  const visibleSortedFundings = getVisibleFundings(
    sortFundingsForUser(filterFundings({ fundings: props.fundings, business: business }), userData),
    business
  );
  const hiddenSortedFundings = sortFundingsForUser(getHiddenFundings(business, props.fundings), userData);
  const visibleSortedCertifications = getVisibleCertifications(
    sortCertifications(filterCertifications({ certifications: props.certifications, business: business })),
    business
  );
  const hiddenSortedCertifications = sortCertifications(
    getHiddenCertifications(business, props.certifications)
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
      cardCount={getForYouCardCount(business, props.certifications, props.fundings)}
    />
  );
};

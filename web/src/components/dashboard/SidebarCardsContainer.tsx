import { SidebarCardsList } from "@/components/dashboard/SidebarCardsList";
import { useUserData } from "@/lib/data-hooks/useUserData";
import {
  filterCertifications,
  filterFundings,
  getForYouCardCount,
  getVisibleFundings,
  getVisibleSideBarCards,
  sortCertifications,
  sortFundingsForUser,
} from "@/lib/domain-logic/sidebarCardsHelpers";
import { LookupOperatingPhaseById } from "@businessnjgovnavigator/shared/";
import { isRemoteWorkerOrSellerBusiness } from "@businessnjgovnavigator/shared/domain-logic/businessPersonaHelpers";
import { Certification, Funding, SidebarCardContent } from "@businessnjgovnavigator/shared/types";
import { ReactElement } from "react";

interface Props {
  sidebarDisplayContent: Record<string, SidebarCardContent>;
  certifications: Certification[];
  fundings: Funding[];
}

export const SidebarCardsContainer = (props: Props): ReactElement => {
  const { business, userData } = useUserData();

  const visibleSidebarCards = getVisibleSideBarCards(business, props.sidebarDisplayContent);
  const sortedFundings = getVisibleFundings(
    sortFundingsForUser(filterFundings({ fundings: props.fundings, business: business }), userData),
    business,
  );
  const sortedCertifications = business
    ? sortCertifications(
        filterCertifications({ certifications: props.certifications, business: business }),
      )
    : [];

  const remoteSellerWorker = isRemoteWorkerOrSellerBusiness(business);

  return (
    <SidebarCardsList
      sideBarCards={visibleSidebarCards}
      fundings={sortedFundings}
      certifications={sortedCertifications}
      isRemoteSellerWorker={remoteSellerWorker}
      displayFundingCards={
        LookupOperatingPhaseById(business?.profileData.operatingPhase).displayFundings
      }
      displayCertificationsCards={
        LookupOperatingPhaseById(business?.profileData.operatingPhase).displayCertifications
      }
      cardCount={getForYouCardCount(business, props.certifications, props.fundings)}
    />
  );
};

import { SidebarCardsList } from "@/components/dashboard/SidebarCardsList";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { filterCertifications } from "@/lib/domain-logic/filterCertifications";
import { filterFundings } from "@/lib/domain-logic/filterFundings";
import { getVisibleCertifications } from "@/lib/domain-logic/getVisibleCertifications";
import { getVisibleFundings } from "@/lib/domain-logic/getVisibleFundings";
import { sortCertifications } from "@/lib/domain-logic/sortCertifications";
import { sortFundings } from "@/lib/domain-logic/sortFundings";
import { Certification, Funding, SidebarCardContent } from "@/lib/types/types";
import { LookupOperatingPhaseById, UserData } from "@businessnjgovnavigator/shared";
import { ReactElement } from "react";

interface Props {
  sidebarDisplayContent: Record<string, SidebarCardContent>;
  certifications: Certification[];
  fundings: Funding[];
}

export const SidebarCardsContainer = (props: Props): ReactElement => {
  const { userData } = useUserData();

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
      .map((id) => {
        return props.certifications.find((it) => {
          return it.id === id;
        });
      })
      .filter((it) => {
        return it !== undefined;
      }) as Certification[]
  );

  const hiddenSortedFundings = sortFundings(
    (userData?.preferences.hiddenFundingIds || [])
      .map((id) => {
        return props.fundings.find((it) => {
          return it.id === id;
        });
      })
      .filter((it) => {
        return it !== undefined;
      }) as Funding[]
  );

  const displayFundingCards = () => {
    return LookupOperatingPhaseById(userData?.profileData.operatingPhase).displayFundings;
  };

  const displayCertificationsCards = () => {
    return LookupOperatingPhaseById(userData?.profileData.operatingPhase).displayCertifications;
  };

  const visibleCardsOrderedByWeight = userData
    ? userData.preferences.visibleSidebarCards
        .map((id: string) => {
          return props.sidebarDisplayContent[id];
        })
        .sort((cardA: SidebarCardContent, cardB: SidebarCardContent): number => {
          return cardA.weight < cardB.weight ? -1 : 1;
        })
    : [];

  const topCardIds = new Set(["funding-nudge", "welcome-up-and-running", "go-to-profile"]);
  const getTopCards = () => {
    return visibleCardsOrderedByWeight.filter((card) => {
      return topCardIds.has(card.id);
    });
  };

  const getBottomCards = () => {
    return visibleCardsOrderedByWeight.filter((card) => {
      return !topCardIds.has(card.id);
    });
  };

  return (
    <SidebarCardsList
      topCards={getTopCards()}
      bottomCards={getBottomCards()}
      fundings={visibleSortedFundings}
      hiddenFundings={hiddenSortedFundings}
      certifications={visibleSortedCertifications}
      hiddenCertifications={hiddenSortedCertifications}
      displayFundings={displayFundingCards()}
      displayCertifications={displayCertificationsCards()}
    />
  );
};

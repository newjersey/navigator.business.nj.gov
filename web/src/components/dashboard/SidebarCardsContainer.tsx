import { SidebarCardsList } from "@/components/dashboard/SidebarCardsList";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { filterCertifications } from "@/lib/domain-logic/filterCertifications";
import { filterFundings } from "@/lib/domain-logic/filterFundings";
import { getVisibleCertifications } from "@/lib/domain-logic/getVisibleCertifications";
import { getVisibleFundings } from "@/lib/domain-logic/getVisibleFundings";
import { sortCertifications } from "@/lib/domain-logic/sortCertifications";
import { sortFundings } from "@/lib/domain-logic/sortFundings";
import { Certification, Funding, SidebarCardContent } from "@/lib/types/types";
import { Business, LookupOperatingPhaseById } from "@businessnjgovnavigator/shared";
import { ReactElement } from "react";

interface Props {
  sidebarDisplayContent: Record<string, SidebarCardContent>;
  certifications: Certification[];
  fundings: Funding[];
}

export const SidebarCardsContainer = (props: Props): ReactElement => {
  const { business } = useUserData();

  const filteredSortedFundings = business ? sortFundings(filterFundings(props.fundings, business)) : [];

  const filteredSortedCertifications = business
    ? sortCertifications(filterCertifications(props.certifications, business))
    : [];

  const visibleSortedFundings = getVisibleFundings(filteredSortedFundings, business as Business);

  const visibleSortedCertifications = getVisibleCertifications(
    filteredSortedCertifications,
    business as Business
  );

  const hiddenSortedCertifications = sortCertifications(
    (business?.preferences.hiddenCertificationIds || [])
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
    (business?.preferences.hiddenFundingIds || [])
      .map((id) => {
        return props.fundings.find((it) => {
          return it.id === id;
        });
      })
      .filter((it) => {
        return it !== undefined;
      }) as Funding[]
  );

  const displayFundingCards = (): boolean => {
    return LookupOperatingPhaseById(business?.profileData.operatingPhase).displayFundings;
  };

  const displayCertificationsCards = (): boolean => {
    return LookupOperatingPhaseById(business?.profileData.operatingPhase).displayCertifications;
  };

  console.log('cards in container', business?.preferences.visibleSidebarCards)

  const visibleCardsOrderedByWeight = business
    ? business.preferences.visibleSidebarCards
        .map((id: string) => {
          return props.sidebarDisplayContent[id];
        })
        .sort((cardA: SidebarCardContent, cardB: SidebarCardContent): number => {
          return cardA.weight < cardB.weight ? -1 : 1;
        })
    : [];

  const getTopCards = (): SidebarCardContent[] => {
    return visibleCardsOrderedByWeight.filter((card) => {
      return card.section === "above-opportunities";
    });
  };

  const getBottomCards = (): SidebarCardContent[] => {
    return visibleCardsOrderedByWeight.filter((card) => {
      return card.section === "below-opportunities";
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

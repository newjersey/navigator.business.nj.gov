import { RoadmapSidebarCard } from "@/components/roadmap/RoadmapSidebarCard";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { SidebarCardContent } from "@/lib/types/types";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { ReactElement } from "react";

interface Props {
  sidebarDisplayContent: Record<string, SidebarCardContent>;
}

export const RoadmapSidebarList = (props: Props): ReactElement => {
  const { userData } = useUserData();
  const visibleCardsOrderedByWeight = userData
    ? userData.preferences.visibleRoadmapSidebarCards
        .map((id: string) => props.sidebarDisplayContent[id])
        .sort((cardA: SidebarCardContent, cardB: SidebarCardContent): number => {
          return cardA.weight < cardB.weight ? -1 : 1;
        })
    : [];

  return (
    <>
      <h2>{Config.roadmapDefaults.sidebarHeading}</h2>
      <hr className="bg-roadmap-blue-dark hr-2px margin-bottom-4" />

      {visibleCardsOrderedByWeight.map((card: SidebarCardContent) => (
        <RoadmapSidebarCard card={card} key={card.id} />
      ))}
    </>
  );
};

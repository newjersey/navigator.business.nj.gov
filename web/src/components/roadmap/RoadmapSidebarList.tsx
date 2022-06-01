import { RoadmapSidebarCard } from "@/components/roadmap/RoadmapSidebarCard";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { SidebarCardContent } from "@/lib/types/types";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { CircularProgress } from "@mui/material";
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
          return cardA.weight > cardB.weight ? -1 : 1;
        })
    : [];

  return (
    <>
      <h2>{Config.roadmapDefaults.sidebarHeading}</h2>
      <hr className="bg-roadmap-blue-dark hr-2px margin-bottom-4" />

      {!userData ? (
        <div className="flex flex-justify-center flex-align-center margin-top-3 desktop:margin-top-0 padding-top-0 desktop:padding-top-6 padding-bottom-15">
          <CircularProgress id="roadmapPage" aria-label="roadmap page progress bar" aria-busy={true} />
          <div className="margin-left-2 h3-styling margin-bottom-0">Loading...</div>
        </div>
      ) : (
        <>
          {visibleCardsOrderedByWeight.map((card: SidebarCardContent) => (
            <RoadmapSidebarCard card={card} key={card.id} />
          ))}
        </>
      )}
    </>
  );
};

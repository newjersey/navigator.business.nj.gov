import { UserData } from "@shared/userData";
import { UpdateRoadmapSidebarCards } from "./types";

export const updateRoadmapSidebarCards: UpdateRoadmapSidebarCards = (userData: UserData): UserData => {
  let cards = userData.preferences.visibleRoadmapSidebarCards;
  const operatingPhase = userData.profileData.operatingPhase;

  const showCard = (id: string): void => {
    const allCardsExceptDesired = cards.filter((cardId: string) => cardId !== id);
    cards = [...allCardsExceptDesired, id];
  };

  const hideCard = (id: string): void => {
    const allCardsExceptIdToHide = cards.filter((cardId: string) => cardId !== id);
    cards = [...allCardsExceptIdToHide];
  };

  if (operatingPhase !== "GUEST_MODE" && cards.includes("not-registered")) {
    showCard("successful-registration");
    hideCard("not-registered");
  }

  if (operatingPhase === "NEEDS_TO_FORM") {
    showCard("formation-nudge");
  } else {
    hideCard("formation-nudge");
  }

  if (operatingPhase === "NEEDS_TO_REGISTER_FOR_TAXES") {
    showCard("tax-registration-nudge");
  } else {
    hideCard("tax-registration-nudge");
  }

  return {
    ...userData,
    preferences: {
      ...userData.preferences,
      visibleRoadmapSidebarCards: cards,
    },
  };
};

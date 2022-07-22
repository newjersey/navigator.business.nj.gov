import { formationTaskId } from "@shared/gradualGraduationStages";
import { LookupLegalStructureById } from "@shared/legalStructure";
import { UserData } from "@shared/userData";
import { UpdateRoadmapSidebarCards } from "./types";

export const updateRoadmapSidebarCards: UpdateRoadmapSidebarCards = (userData: UserData): UserData => {
  let cards = userData.preferences.visibleRoadmapSidebarCards;

  const showCard = (id: string): void => {
    const allCardsExceptDesired = cards.filter((cardId: string) => cardId !== id);
    cards = [...allCardsExceptDesired, id];
  };

  const hideCard = (id: string): void => {
    const allCardsExceptIdToHide = cards.filter((cardId: string) => cardId !== id);
    cards = [...allCardsExceptIdToHide];
  };

  if (cards.includes("not-registered")) {
    showCard("successful-registration");
    hideCard("not-registered");
  }

  const isPublicFiling = LookupLegalStructureById(userData.profileData.legalStructureId).requiresPublicFiling;
  const hasCompletedFormation = userData.taskProgress[formationTaskId] === "COMPLETED";

  if (isPublicFiling) {
    if (!hasCompletedFormation) {
      showCard("formation-nudge");
    } else {
      hideCard("formation-nudge");
    }
  }

  const hasCompletedTaxes = userData.taskProgress["register-for-taxes"] === "COMPLETED";

  if (hasCompletedFormation && !hasCompletedTaxes) {
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

import { UserData } from "@shared/userData";
import { UpdateSidebarCards } from "./types";

export const updateSidebarCards: UpdateSidebarCards = (userData: UserData): UserData => {
  let cards = userData.preferences.visibleSidebarCards;
  const operatingPhase = userData.profileData.operatingPhase;

  const showCard = (id: string): void => {
    const allCardsExceptDesired = cards.filter((cardId: string) => {
      return cardId !== id;
    });
    cards = [...allCardsExceptDesired, id];
  };

  const hideCard = (id: string): void => {
    const allCardsExceptIdToHide = cards.filter((cardId: string) => {
      return cardId !== id;
    });
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
    showCard("registered-for-taxes-nudge");
  } else {
    hideCard("registered-for-taxes-nudge");
    hideCard("registered-for-taxes-nudge");
  }

  if (operatingPhase === "FORMED_AND_REGISTERED") {
    showCard("funding-nudge");
  } else {
    hideCard("funding-nudge");
  }

  if (operatingPhase === "UP_AND_RUNNING") {
    hideCard("task-progress");
  }

  if (
    (operatingPhase === "UP_AND_RUNNING_OWNING" || operatingPhase === "UP_AND_RUNNING") &&
    cards.includes("welcome")
  ) {
    showCard("welcome-up-and-running");
    hideCard("welcome");
  } else if (cards.includes("welcome-up-and-running")) {
    showCard("welcome");
    hideCard("welcome-up-and-running");
  }

  return {
    ...userData,
    preferences: {
      ...userData.preferences,
      visibleSidebarCards: cards,
    },
  };
};

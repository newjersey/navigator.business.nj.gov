import { getCurrentBusiness } from "@shared/domain-logic/getCurrentBusiness";
import { isFieldAnswered, OPPORTUNITY_FIELDS } from "@shared/domain-logic/opportunityFields";
import { LookupOperatingPhaseById } from "@shared/operatingPhase";
import { modifyCurrentBusiness } from "@shared/test";
import { UserData } from "@shared/userData";
import { UpdateSidebarCards } from "./types";

export const updateSidebarCards: UpdateSidebarCards = (userData: UserData): UserData => {
  const currentBusiness = getCurrentBusiness(userData);
  let cards = currentBusiness.preferences.visibleSidebarCards;
  const operatingPhase = currentBusiness.profileData.operatingPhase;

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

  if (LookupOperatingPhaseById(operatingPhase).displayGoToProfileNudge) {
    const isEveryOpportunityFieldAnswered = OPPORTUNITY_FIELDS.every((field) => {
      return isFieldAnswered(field, currentBusiness.profileData);
    });

    if (isEveryOpportunityFieldAnswered) {
      hideCard("go-to-profile");
    } else {
      showCard("go-to-profile");
    }
  }

  return modifyCurrentBusiness(userData, (business) => ({
    ...business,
    preferences: {
      ...business.preferences,
      visibleSidebarCards: cards
    }
  }));
};

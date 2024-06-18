import { UpdateSidebarCards } from "@domain/types";
import { getCurrentBusiness } from "@shared/domain-logic/getCurrentBusiness";
import { getFieldsForProfile, isFieldAnswered } from "@shared/domain-logic/opportunityFields";
import { SIDEBAR_CARDS } from "@shared/domain-logic/sidebarCards";
import { LookupOperatingPhaseById, OperatingPhaseId } from "@shared/operatingPhase";
import { modifyCurrentBusiness } from "@shared/test";
import { UserData } from "@shared/userData";

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

  if (operatingPhase !== OperatingPhaseId.GUEST_MODE && cards.includes(SIDEBAR_CARDS.notRegistered)) {
    hideCard(SIDEBAR_CARDS.notRegistered);
  }

  if (
    operatingPhase !== OperatingPhaseId.GUEST_MODE &&
    cards.includes(SIDEBAR_CARDS.notRegisteredUpAndRunning)
  ) {
    hideCard(SIDEBAR_CARDS.notRegisteredUpAndRunning);
  }

  if (operatingPhase === OperatingPhaseId.NEEDS_TO_FORM) {
    showCard(SIDEBAR_CARDS.formationNudge);
  } else {
    hideCard(SIDEBAR_CARDS.formationNudge);
  }

  if (operatingPhase === OperatingPhaseId.FORMED) {
    showCard(SIDEBAR_CARDS.fundingNudge);
  } else {
    hideCard(SIDEBAR_CARDS.fundingNudge);
  }

  if (LookupOperatingPhaseById(operatingPhase).displayGoToProfileNudge) {
    const isEveryOpportunityFieldAnswered = getFieldsForProfile(currentBusiness.profileData).every(
      (field) => {
        return isFieldAnswered(field, currentBusiness.profileData);
      }
    );

    if (isEveryOpportunityFieldAnswered) {
      hideCard(SIDEBAR_CARDS.goToProfile);
    } else {
      showCard(SIDEBAR_CARDS.goToProfile);
    }
  }

  return modifyCurrentBusiness(userData, (business) => ({
    ...business,
    preferences: {
      ...business.preferences,
      visibleSidebarCards: cards,
    },
  }));
};

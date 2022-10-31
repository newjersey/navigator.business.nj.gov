import { useUserData } from "@/lib/data-hooks/useUserData";

export const useSidebarCards = (): {
  showCard: (id: string) => Promise<void>;
  hideCard: (id: string) => Promise<void>;
} => {
  const { userData, update } = useUserData();

  const showCard = async (id: string): Promise<void> => {
    if (!userData) {
      return;
    }
    const allCardsExceptDesired = userData.preferences.visibleSidebarCards.filter((cardId: string) => {
      return cardId !== id;
    });
    await update({
      ...userData,
      preferences: {
        ...userData.preferences,
        visibleSidebarCards: [...allCardsExceptDesired, id],
      },
    });
  };

  const hideCard = async (id: string): Promise<void> => {
    if (!userData) {
      return;
    }
    const allCardsExceptIdToHide = userData.preferences.visibleSidebarCards.filter((cardId: string) => {
      return cardId !== id;
    });
    await update({
      ...userData,
      preferences: {
        ...userData.preferences,
        visibleSidebarCards: [...allCardsExceptIdToHide],
      },
    });
  };

  return { showCard, hideCard };
};

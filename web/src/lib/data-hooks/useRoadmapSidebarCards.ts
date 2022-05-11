import { useUserData } from "@/lib/data-hooks/useUserData";

export const useRoadmapSidebarCards = (): {
  showCard: (id: string) => Promise<void>;
  hideCard: (id: string) => Promise<void>;
} => {
  const { userData, update } = useUserData();

  const showCard = async (id: string): Promise<void> => {
    if (!userData) return;
    const allCardsExceptDesired = userData.preferences.visibleRoadmapSidebarCards.filter(
      (cardId: string) => cardId !== id
    );
    await update({
      ...userData,
      preferences: {
        ...userData.preferences,
        visibleRoadmapSidebarCards: [...allCardsExceptDesired, id],
      },
    });
  };

  const hideCard = async (id: string): Promise<void> => {
    if (!userData) return;
    const allCardsExceptIdToHide = userData.preferences.visibleRoadmapSidebarCards.filter(
      (cardId: string) => cardId !== id
    );
    await update({
      ...userData,
      preferences: {
        ...userData.preferences,
        visibleRoadmapSidebarCards: [...allCardsExceptIdToHide],
      },
    });
  };

  return { showCard, hideCard };
};

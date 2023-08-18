import { useUserData } from "@/lib/data-hooks/useUserData";

export const useSidebarCards = (): {
  showCard: (id: string) => Promise<void>;
  hideCard: (id: string) => Promise<void>;
} => {
  const { updateQueue } = useUserData();

  const showCard = async (id: string): Promise<void> => {
    if (!updateQueue) return;
    const allCardsExceptDesired = updateQueue
      .currentBusiness()
      .preferences.visibleSidebarCards.filter((cardId: string) => {
        return cardId !== id;
      });
    await updateQueue
      .queuePreferences({
        visibleSidebarCards: [...allCardsExceptDesired, id]
      })
      .update();
  };

  const hideCard = async (id: string): Promise<void> => {
    if (!updateQueue) return;
    const allCardsExceptIdToHide = updateQueue
      .currentBusiness()
      .preferences.visibleSidebarCards.filter((cardId: string) => {
        return cardId !== id;
      });
    await updateQueue
      .queuePreferences({
        visibleSidebarCards: [...allCardsExceptIdToHide]
      })
      .update();
  };

  return { showCard, hideCard };
};

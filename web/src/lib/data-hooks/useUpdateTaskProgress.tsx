import { CongratulatoryModal } from "@/components/CongratulatoryModal";
import { useRoadmap } from "@/lib/data-hooks/useRoadmap";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { SectionType, TaskProgress } from "@businessnjgovnavigator/shared";
import { ReactNode, useState } from "react";

export const useUpdateTaskProgress = (): {
  queueUpdateTaskProgress: (taskId: string, newValue: TaskProgress) => void;
  congratulatoryModal: ReactNode;
} => {
  const [nextSection, setNextSection] = useState<SectionType | undefined>(undefined);
  const { roadmap, isSectionCompleted, currentAndNextSection } = useRoadmap();
  const { business, updateQueue } = useUserData();
  const [congratulatoryModalIsOpen, setCongratulatoryModalIsOpen] = useState<boolean>(false);

  const queueUpdateTaskProgress = (taskId: string, newValue: TaskProgress): void => {
    if (!roadmap || !updateQueue || !business) {
      return;
    }

    updateQueue.queueTaskProgress({ [taskId]: newValue });
    const { current, next } = currentAndNextSection(taskId);
    const wasSectionPreviouslyCompleted = isSectionCompleted(current);
    const isSectionNowCompleted = isSectionCompleted(current, updateQueue.currentBusiness().taskProgress);

    if (!wasSectionPreviouslyCompleted && isSectionNowCompleted) {
      setNextSection(next);
      setCongratulatoryModalIsOpen(true);
      updateQueue.queuePreferences({
        roadmapOpenSections: business.preferences.roadmapOpenSections.filter((section) => {
          return section !== current;
        })
      });
    }
  };

  const handleModalClose = (): void => {
    setCongratulatoryModalIsOpen(false);
  };

  const congratulatoryModal = (
    <CongratulatoryModal
      nextSectionType={nextSection}
      handleClose={handleModalClose}
      open={congratulatoryModalIsOpen}
    />
  );

  return {
    queueUpdateTaskProgress,
    congratulatoryModal
  };
};

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
  const { currentBusiness, updateQueue } = useUserData();
  const [congratulatoryModalIsOpen, setCongratulatoryModalIsOpen] = useState<boolean>(false);

  const queueUpdateTaskProgress = (taskId: string, newValue: TaskProgress): void => {
    if (!roadmap || !updateQueue || !currentBusiness) {
      return;
    }

    updateQueue.queueTaskProgress({ [taskId]: newValue });
    const { current, next } = currentAndNextSection(taskId);
    const wasSectionPreviouslyCompleted = isSectionCompleted(current);
    const isSectionNowCompleted = isSectionCompleted(current, updateQueue.current().businesses[updateQueue.current().currentBusinessID].taskProgress);

    if (!wasSectionPreviouslyCompleted && isSectionNowCompleted) {
      setNextSection(next);
      setCongratulatoryModalIsOpen(true);
      updateQueue.queuePreferences({
        roadmapOpenSections: currentBusiness.preferences.roadmapOpenSections.filter((section) => {
          return section !== current;
        }),
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
    congratulatoryModal,
  };
};

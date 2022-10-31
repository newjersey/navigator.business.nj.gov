import { CongratulatoryModal } from "@/components/CongratulatoryModal";
import { useRoadmap } from "@/lib/data-hooks/useRoadmap";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { getSectionCompletion, getSectionPositions } from "@/lib/utils/helpers";
import { SectionType, TaskProgress } from "@businessnjgovnavigator/shared";
import { ReactNode, useState } from "react";

export const useUpdateTaskProgress = (): {
  queueUpdateTaskProgress: (taskId: string, newValue: TaskProgress) => void;
  congratulatoryModal: ReactNode;
} => {
  const [nextSection, setNextSection] = useState<SectionType | undefined>(undefined);
  const { roadmap, sectionCompletion, updateSectionCompletion } = useRoadmap();
  const { userData, updateQueue } = useUserData();
  const [congratulatoryModalIsOpen, setCongratulatoryModalIsOpen] = useState<boolean>(false);

  const queueUpdateTaskProgress = (taskId: string, newValue: TaskProgress): void => {
    if (!sectionCompletion || !roadmap || !updateQueue || !userData) {
      return;
    }

    updateQueue.queueTaskProgress({ [taskId]: newValue });

    const updatedSectionCompletion = getSectionCompletion(roadmap, updateQueue.current());
    const { currentSection, nextSection } = getSectionPositions(updatedSectionCompletion, roadmap, taskId);

    const sectionStatusHasChanged =
      updatedSectionCompletion[currentSection] !== sectionCompletion[currentSection];
    const sectionExists = updatedSectionCompletion[currentSection];

    if (sectionStatusHasChanged && sectionExists) {
      setNextSection(nextSection);
      setCongratulatoryModalIsOpen(true);
      updateQueue.queuePreferences({
        roadmapOpenSections: userData.preferences.roadmapOpenSections.filter((section) => {
          return section !== currentSection;
        }),
      });
    }

    updateSectionCompletion(updatedSectionCompletion);
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

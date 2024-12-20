import { BusinessStructurePrompt } from "@/components/dashboard/BusinessStructurePrompt";
import { SectionAccordion } from "@/components/dashboard/SectionAccordion";
import { MiniRoadmapStep } from "@/components/roadmap/MiniRoadmapStep";
import { useRoadmap } from "@/lib/data-hooks/useRoadmap";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { isStepCompleted } from "@/lib/domain-logic/isStepCompleted";
import analytics from "@/lib/utils/analytics";
import { hasCompletedBusinessStructure } from "@businessnjgovnavigator/shared/domain-logic/hasCompletedBusinessStructure";
import { LookupOperatingPhaseById } from "@businessnjgovnavigator/shared/operatingPhase";
import { ReactElement, useCallback } from "react";

interface Props {
  activeTaskId?: string | undefined;
  onTaskClick?: () => void;
}

export const MiniRoadmap = (props: Props): ReactElement<any> => {
  const { roadmap, sectionNamesInRoadmap } = useRoadmap();
  const { updateQueue, business } = useUserData();

  const displayBusinessStructurePrompt = LookupOperatingPhaseById(
    business?.profileData.operatingPhase
  ).displayBusinessStructurePrompt;
  const completedBusinessStructure = hasCompletedBusinessStructure(business);

  const onToggleStep = useCallback(
    async (stepNumber: number, setOpen: boolean, click: boolean): Promise<void> => {
      if (!business || !updateQueue) return;

      const openSteps = business.preferences.roadmapOpenSteps;
      click && analytics.event.task_mini_roadmap_step.click.expand_contract();
      if (openSteps.includes(stepNumber)) {
        if (setOpen) {
          return;
        }

        await updateQueue
          .queuePreferences({
            roadmapOpenSteps: openSteps.filter((openStep) => {
              return openStep !== stepNumber;
            }),
          })
          .update();
      } else {
        await updateQueue
          .queuePreferences({
            roadmapOpenSteps: [...openSteps, stepNumber],
          })
          .update();
      }
    },
    [updateQueue, business]
  );

  return (
    <>
      {sectionNamesInRoadmap.map((section) => {
        return (
          <SectionAccordion key={section} sectionType={section} mini={true}>
            {section === "START" && !completedBusinessStructure && displayBusinessStructurePrompt ? (
              <BusinessStructurePrompt isCTAButtonHidden={true} />
            ) : (
              roadmap?.steps
                .filter((step) => {
                  return step.section === section;
                })
                .map((step, index, array) => {
                  return (
                    <MiniRoadmapStep
                      step={step}
                      isLast={index === array.length - 1}
                      activeTaskId={props.activeTaskId}
                      completed={isStepCompleted(roadmap, step, business)}
                      isOpen={business?.preferences.roadmapOpenSteps.includes(step.stepNumber)}
                      toggleStep={onToggleStep}
                      onTaskClick={props.onTaskClick}
                      key={step.stepNumber}
                    />
                  );
                })
            )}
          </SectionAccordion>
        );
      })}
    </>
  );
};

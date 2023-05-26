import { BusinessStructurePrompt } from "@/components/dashboard/BusinessStructurePrompt";
import { SectionAccordion } from "@/components/dashboard/SectionAccordion";
import { MiniRoadmapStep } from "@/components/roadmap/MiniRoadmapStep";
import { useRoadmap } from "@/lib/data-hooks/useRoadmap";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { isStepCompleted } from "@/lib/domain-logic/isStepCompleted";
import analytics from "@/lib/utils/analytics";
import { LookupOperatingPhaseById } from "@businessnjgovnavigator/shared/operatingPhase";
import { ReactElement, useCallback } from "react";

interface Props {
  activeTaskId?: string | undefined;
  onTaskClick?: () => void;
}

export const MiniRoadmap = (props: Props): ReactElement => {
  const { roadmap, sectionNamesInRoadmap } = useRoadmap();
  const { updateQueue, userData } = useUserData();

  const displayBusinessStructurePrompt = LookupOperatingPhaseById(
    updateQueue?.current().profileData.operatingPhase
  ).displayBusinessStructurePrompt;

  const onToggleStep = useCallback(
    async (stepNumber: number, setOpen: boolean, click: boolean): Promise<void> => {
      if (!userData || !updateQueue) return;

      const openSteps = userData?.preferences.roadmapOpenSteps;
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
    [updateQueue, userData]
  );

  const renderPlanSection = (
    <SectionAccordion key={sectionNamesInRoadmap[0]} sectionType={sectionNamesInRoadmap[0]} mini={true}>
      {roadmap?.steps
        .filter((step) => {
          return step.section === sectionNamesInRoadmap[0];
        })
        .map((step, index, array) => {
          return (
            <MiniRoadmapStep
              step={step}
              isLast={index === array.length - 1}
              activeTaskId={props.activeTaskId}
              completed={isStepCompleted(roadmap, step, userData)}
              isOpen={userData?.preferences.roadmapOpenSteps.includes(step.stepNumber)}
              toggleStep={onToggleStep}
              onTaskClick={props.onTaskClick}
              key={step.stepNumber}
            />
          );
        })}
    </SectionAccordion>
  );

  const renderStartSection = (
    <SectionAccordion
      key={sectionNamesInRoadmap[1]}
      sectionType={sectionNamesInRoadmap[1]}
      mini={true}
      isDividerDisabled={displayBusinessStructurePrompt}
    >
      {displayBusinessStructurePrompt ? (
        <BusinessStructurePrompt isButtonHidden={true} />
      ) : (
        roadmap?.steps
          .filter((step) => {
            return step.section === sectionNamesInRoadmap[1];
          })
          .map((step, index, array) => {
            return (
              <MiniRoadmapStep
                step={step}
                isLast={index === array.length - 1}
                activeTaskId={props.activeTaskId}
                completed={isStepCompleted(roadmap, step, userData)}
                isOpen={userData?.preferences.roadmapOpenSteps.includes(step.stepNumber)}
                toggleStep={onToggleStep}
                onTaskClick={props.onTaskClick}
                key={step.stepNumber}
              />
            );
          })
      )}
    </SectionAccordion>
  );

  return (
    <>
      {sectionNamesInRoadmap[0] && renderPlanSection}
      {sectionNamesInRoadmap[1] && renderStartSection}
    </>
  );
};

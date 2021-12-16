import { MiniRoadmapStep } from "@/components/roadmap/MiniRoadmapStep";
import { SectionAccordion } from "@/components/roadmap/SectionAccordion";
import { useRoadmap } from "@/lib/data-hooks/useRoadmap";
import { useUserData } from "@/lib/data-hooks/useUserData";
import analytics from "@/lib/utils/analytics";
import { getSectionNames, isStepCompleted } from "@/lib/utils/helpers";
import React, { ReactElement, useCallback } from "react";

interface Props {
  activeTaskId?: string | undefined;
  onTaskClick?: () => void;
}

export const MiniRoadmap = (props: Props): ReactElement => {
  const { roadmap } = useRoadmap();
  const { userData, update } = useUserData();

  const onToggleStep = useCallback(
    async (stepNumber: number, setOpen: boolean): Promise<void> => {
      const updateSteps = (openSteps: number[]) => {
        return userData
          ? {
              ...userData,
              preferences: {
                ...userData.preferences,
                roadmapOpenSteps: openSteps,
              },
            }
          : undefined;
      };
      if (!userData) return;
      const openSteps = userData?.preferences.roadmapOpenSteps;
      analytics.event.task_mini_roadmap_step.click.expand_contract();
      if (openSteps.includes(stepNumber)) {
        if (setOpen) {
          return;
        }
        await update(updateSteps(openSteps?.filter((openStep) => openStep !== stepNumber)));
      } else {
        await update(updateSteps([...openSteps, stepNumber]));
      }
    },
    [update, userData]
  );

  return (
    <>
      {getSectionNames(roadmap).map((section) => (
        <SectionAccordion key={section} sectionType={section} mini={true}>
          {roadmap?.steps
            .filter((step) => step.section === section)
            .map((step, index, array) => (
              <MiniRoadmapStep
                step={step}
                isLast={index === array.length - 1}
                activeTaskId={props.activeTaskId}
                completed={isStepCompleted(step, userData)}
                isOpen={userData?.preferences.roadmapOpenSteps.includes(step.step_number)}
                toggleStep={onToggleStep}
                onTaskClick={props.onTaskClick}
                key={step.step_number}
              />
            ))}
        </SectionAccordion>
      ))}
    </>
  );
};

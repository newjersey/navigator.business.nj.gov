import { SectionAccordion } from "@/components/dashboard/SectionAccordion";
import { MiniRoadmapStep } from "@/components/roadmap/MiniRoadmapStep";
import { useRoadmap } from "@/lib/data-hooks/useRoadmap";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { isStepCompleted } from "@/lib/domain-logic/isStepCompleted";
import analytics from "@/lib/utils/analytics";
import { UserData } from "@businessnjgovnavigator/shared/userData";
import { ReactElement, useCallback } from "react";

interface Props {
  activeTaskId?: string | undefined;
  onTaskClick?: () => void;
}

export const MiniRoadmap = (props: Props): ReactElement => {
  const { roadmap, sectionNamesInRoadmap } = useRoadmap();
  const { userData, update } = useUserData();
  const onToggleStep = useCallback(
    async (stepNumber: number, setOpen: boolean, click: boolean): Promise<void> => {
      const updateSteps = (openSteps: number[]): UserData | undefined => {
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
      if (!userData) {
        return;
      }
      const openSteps = userData?.preferences.roadmapOpenSteps;
      click && analytics.event.task_mini_roadmap_step.click.expand_contract();
      if (openSteps.includes(stepNumber)) {
        if (setOpen) {
          return;
        }
        await update(
          updateSteps(
            openSteps?.filter((openStep) => {
              return openStep !== stepNumber;
            })
          )
        );
      } else {
        await update(updateSteps([...openSteps, stepNumber]));
      }
    },
    [update, userData]
  );

  return (
    <>
      {sectionNamesInRoadmap.map((section) => {
        return (
          <SectionAccordion key={section} sectionType={section} mini={true}>
            {roadmap?.steps
              .filter((step) => {
                return step.section === section;
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
      })}
    </>
  );
};

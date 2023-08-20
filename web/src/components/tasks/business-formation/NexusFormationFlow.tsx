import { Content } from "@/components/Content";
import { HorizontalStepper } from "@/components/njwds-extended/HorizontalStepper";
import { SecondaryButton } from "@/components/njwds-extended/SecondaryButton";
import { TaskCTA } from "@/components/TaskCTA";
import { BusinessFormationPaginator } from "@/components/tasks/business-formation/BusinessFormationPaginator";
import { DbaFormationPaginator } from "@/components/tasks/business-formation/DbaFormationPaginator";
import { NexusFormationStepsConfiguration } from "@/components/tasks/business-formation/NexusFormationStepsConfiguration";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { allowFormation } from "@/lib/domain-logic/allowFormation";
import { getNaicsDisplayMd } from "@/lib/domain-logic/getNaicsDisplayMd";
import analytics from "@/lib/utils/analytics";
import { templateEval } from "@/lib/utils/helpers";
import { FormationFormData } from "@businessnjgovnavigator/shared/formationData";
import { ReactElement, useContext } from "react";

export const NexusFormationFlow = (): ReactElement => {
  const { business } = useUserData();
  const { state, setStepIndex } = useContext(BusinessFormationContext);
  const { Config } = useConfig();

  const addNaicsCodeData = (contentMd: string): string => {
    const naicsCode = business?.profileData.naicsCode || "";
    const naicsTemplateValue = getNaicsDisplayMd(naicsCode);
    return templateEval(contentMd, { naicsCode: naicsTemplateValue });
  };

  const moveToStep = (stepIndex: number): void => {
    setStepIndex(stepIndex);
  };

  const onPreviousButtonClick = (): void => {
    moveToStep(state.stepIndex - 1);
  };

  const isNotDba = business?.profileData.businessName && !business.profileData.needsNexusDbaName;

  const onStepChangeAnalytics = (
    formationFormData: FormationFormData | undefined,
    nextStepIndex: number,
    moveType: "NEXT_BUTTON" | "STEPPER",
  ): void => {
    if (!formationFormData) {
      return;
    }

    if (moveType === "STEPPER" && nextStepIndex === 0) {
      analytics.event.business_formation_name_tab.click.arrive_on_business_formation_name_step();
    }
  };

  const onMoveToStep = async (
    stepIndex: number,
    config: { moveType: "NEXT_BUTTON" | "STEPPER" },
  ): Promise<void> => {
    onStepChangeAnalytics(business?.formationData.formationFormData, stepIndex, config.moveType);
    moveToStep(stepIndex);
  };

  if (state.stepIndex > 0 && isNotDba) {
    if (allowFormation(business.profileData.legalStructureId, business.profileData.businessPersona)) {
      return <BusinessFormationPaginator />;
    } else {
      return (
        <>
          <div>
            <div className="margin-top-3">
              <HorizontalStepper
                steps={NexusFormationStepsConfiguration.map((value, index) => {
                  return {
                    name: value.name,
                    hasError: false,
                    isComplete: index === 0,
                  };
                })}
                currentStep={state.stepIndex}
                onStepClicked={(step: number): void => {
                  onMoveToStep(step, { moveType: "STEPPER" });
                }}
              />
            </div>
          </div>
          <div data-testid="formation-nexus-task" className="fg1 flex flex-column space-between">
            <Content>{addNaicsCodeData(state.dbaContent.Formation.contentMd ?? "")}</Content>
            <TaskCTA
              link={state.dbaContent.Formation.callToActionLink}
              text={state.dbaContent.Formation.callToActionText}
            >
              <SecondaryButton
                isColor="primary"
                isNotFullWidthOnMobile={true}
                onClick={onPreviousButtonClick}
              >
                {Config.formation.general.previousButtonText}
              </SecondaryButton>
            </TaskCTA>
          </div>
        </>
      );
    }
  } else {
    return <DbaFormationPaginator />;
  }
};

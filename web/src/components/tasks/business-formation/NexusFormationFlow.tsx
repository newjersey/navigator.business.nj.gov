import { Content } from "@/components/Content";
import { HorizontalStepper } from "@/components/njwds-extended/HorizontalStepper";
import { PrimaryButton } from "@/components/njwds-extended/PrimaryButton";
import { SecondaryButton } from "@/components/njwds-extended/SecondaryButton";
import { CtaContainer } from "@/components/njwds-extended/cta/CtaContainer";
import { ActionBarLayout } from "@/components/njwds-layout/ActionBarLayout";
import { BusinessFormationPaginator } from "@/components/tasks/business-formation/BusinessFormationPaginator";
import { BusinessFormationStepsConfiguration } from "@/components/tasks/business-formation/BusinessFormationStepsConfiguration";
import { DbaFormationPaginator } from "@/components/tasks/business-formation/DbaFormationPaginator";
import { NexusFormationStepsConfiguration } from "@/components/tasks/business-formation/NexusFormationStepsConfiguration";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { allowFormation } from "@/lib/domain-logic/allowFormation";
import { getNaicsDisplayMd } from "@/lib/domain-logic/getNaicsDisplayMd";
import analytics from "@/lib/utils/analytics";
import { openInNewTab, templateEval, useMountEffect } from "@/lib/utils/helpers";
import { determineIfNexusDbaNameNeeded } from "@businessnjgovnavigator/shared/domain-logic/businessPersonaHelpers";
import { FormationFormData } from "@businessnjgovnavigator/shared/formationData";
import { ReactElement, useContext } from "react";

export const NexusFormationFlow = (): ReactElement => {
  const { business } = useUserData();
  const { state, setStepIndex } = useContext(BusinessFormationContext);
  const { Config } = useConfig();

  useMountEffect(() => {
    if (!business) return;
    const { lastVisitedPageIndex } = business.formationData;
    const largestValidPageIndex = BusinessFormationStepsConfiguration.length - 1;
    if (lastVisitedPageIndex > largestValidPageIndex || lastVisitedPageIndex < 0) {
      setStepIndex(0);
    } else {
      setStepIndex(lastVisitedPageIndex);
    }
  });

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

  const isNotDba = business?.profileData.businessName && !determineIfNexusDbaNameNeeded(business);

  const onStepChangeAnalytics = (
    formationFormData: FormationFormData | undefined,
    nextStepIndex: number,
    moveType: "NEXT_BUTTON" | "STEPPER"
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
    config: { moveType: "NEXT_BUTTON" | "STEPPER" }
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

            <CtaContainer>
              <ActionBarLayout>
                <div className="margin-top-2 mobile-lg:margin-top-0">
                  <SecondaryButton isColor="primary" onClick={onPreviousButtonClick}>
                    {Config.formation.general.previousButtonText}
                  </SecondaryButton>
                </div>
                <PrimaryButton
                  isColor="primary"
                  isRightMarginRemoved={true}
                  onClick={(): void => {
                    analytics.event.task_primary_call_to_action.click.open_external_website(
                      state.dbaContent.Formation.callToActionText ||
                        Config.taskDefaults.defaultCallToActionText,
                      state.dbaContent.Formation.callToActionLink as string
                    );
                    openInNewTab(state.dbaContent.Formation.callToActionLink);
                  }}
                >
                  {state.dbaContent.Formation.callToActionText || Config.taskDefaults.defaultCallToActionText}
                </PrimaryButton>
              </ActionBarLayout>
            </CtaContainer>
          </div>
        </>
      );
    }
  } else {
    return <DbaFormationPaginator />;
  }
};

import {
  SidebarPageLayout,
  SidebarPageLayoutProps,
} from "@/components/njwds-layout/SidebarPageLayout";
import { Icon } from "@/components/njwds/Icon";
import { LearnMiniRoadmap } from "@/components/roadmap/LearnMiniRoadmap";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { ReactElement } from "react";

interface Props extends Omit<SidebarPageLayoutProps, "navChildren"> {
  taskId: string | undefined;
  hideMiniRoadmap?: boolean;
}

export const LearnTaskSidebarPageLayout = ({ children, taskId, ...props }: Props): ReactElement => {
  const { Config } = useConfig();
  const activeStepIndex = Config.learnPages.steps.findIndex((step) => step.id === taskId);

  return (
    <main id="main">
      {!props.hideMiniRoadmap && activeStepIndex >= 0 && (
        <details className="learn-mobile-roadmap">
          <summary className="learn-mobile-roadmap__summary">
            <span>
              <span className="display-block font-body-2xs text-bold">
                {Config.learnPages.stepText} {activeStepIndex + 1} of{" "}
                {Config.learnPages.steps.length}
              </span>
              <span className="display-block text-bold learn-mobile-roadmap__title">
                {Config.learnPages.steps[activeStepIndex].name}
              </span>
            </span>
            <Icon
              className="usa-icon--size-4 learn-mobile-roadmap__chevron"
              iconName="expand_more"
            />
          </summary>
          <nav aria-label={Config.learnPages.stepsHeader} className="learn-mobile-roadmap__nav">
            <LearnMiniRoadmap activeTaskId={taskId} hideHeader />
          </nav>
        </details>
      )}
      <SidebarPageLayout
        navChildren={props.hideMiniRoadmap ? <></> : <LearnMiniRoadmap activeTaskId={taskId} />}
        belowBoxComponent={props.belowBoxComponent}
        outlineBox={false}
        showBackButton={false}
        divider={false}
      >
        {children}
      </SidebarPageLayout>
    </main>
  );
};

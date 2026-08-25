import {
  SidebarPageLayout,
  SidebarPageLayoutProps,
} from "@/components/njwds-layout/SidebarPageLayout";
import { LearnMiniRoadmap } from "@/components/roadmap/LearnMiniRoadmap";
import { ReactElement } from "react";

interface Props extends Omit<SidebarPageLayoutProps, "navChildren"> {
  taskId: string | undefined;
  hideMiniRoadmap?: boolean;
}

export const LearnTaskSidebarPageLayout = ({ children, taskId, ...props }: Props): ReactElement => {
  return (
    <main id="main">
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

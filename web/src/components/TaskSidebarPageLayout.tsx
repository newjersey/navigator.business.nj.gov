import type { Task } from "@businessnjgovnavigator/shared/types";
import type { ReactElement } from "react";
import {
  SidebarPageLayout,
  type SidebarPageLayoutProps,
} from "@/components/njwds-layout/SidebarPageLayout";
import { MiniRoadmap } from "@/components/roadmap/MiniRoadmap";

interface Props extends Omit<SidebarPageLayoutProps, "navChildren"> {
  task?: Task | undefined;
  hideMiniRoadmap?: boolean;
}

export const TaskSidebarPageLayout = ({ children, task, ...props }: Props): ReactElement => {
  return (
    <main id="main">
      <SidebarPageLayout
        navChildren={props.hideMiniRoadmap ? <></> : <MiniRoadmap activeTaskId={task?.id} />}
        {...props}
      >
        {children}
      </SidebarPageLayout>
    </main>
  );
};

import { SidebarPageLayout, SidebarPageLayoutProps } from "@/components/njwds-layout/SidebarPageLayout";
import { MiniRoadmap } from "@/components/roadmap/MiniRoadmap";
import { Task } from "@/lib/types/types";
import { ReactElement } from "react";

interface Props extends Omit<SidebarPageLayoutProps, "navChildren"> {
  task?: Task | undefined;
  hideMiniRoadmap?: boolean;
}

export const TaskSidebarPageLayout = ({ children, task, ...props }: Props): ReactElement<any> => {
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

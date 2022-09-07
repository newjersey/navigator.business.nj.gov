import { SidebarPageLayout, SidebarPageLayoutProps } from "@/components/njwds-extended/SidebarPageLayout";
import { MiniRoadmap } from "@/components/roadmap/MiniRoadmap";
import { OperateReference, Task } from "@/lib/types/types";
import { ReactElement } from "react";

interface Props extends Omit<SidebarPageLayoutProps, "navChildren"> {
  operateReferences?: Record<string, OperateReference>;
  task?: Task | undefined;
}

export const TaskSidebarPageLayout = ({
  children,
  operateReferences,
  task,
  ...props
}: Props): ReactElement => {
  return (
    <main id="main">
      <SidebarPageLayout
        navChildren={operateReferences ? <></> : <MiniRoadmap activeTaskId={task?.id} />}
        {...props}
      >
        {children}
      </SidebarPageLayout>
    </main>
  );
};

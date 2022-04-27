import { SidebarPageLayout, SidebarPageLayoutProps } from "@/components/njwds-extended/SidebarPageLayout";
import { MiniOperateSection } from "@/components/roadmap/MiniOperateSection";
import { MiniRoadmap } from "@/components/roadmap/MiniRoadmap";
import { OperateReference, Task } from "@/lib/types/types";
import React, { ReactElement } from "react";

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
  const navChildren =
    operateReferences != null && Object.keys(operateReferences).length > 0 ? (
      <MiniOperateSection operateReferences={operateReferences} />
    ) : (
      <MiniRoadmap activeTaskId={task?.id} />
    );
  return (
    <SidebarPageLayout navChildren={navChildren} {...props}>
      {children}
    </SidebarPageLayout>
  );
};

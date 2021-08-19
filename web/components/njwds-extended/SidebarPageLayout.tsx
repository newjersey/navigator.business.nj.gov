import React, { ReactElement } from "react";
import { MediaQueries } from "@/lib/PageSizes";
import { useMediaQuery } from "@material-ui/core";
import { Icon } from "@/components/njwds/Icon";
import analytics from "@/lib/utils/analytics";
import { TaskDefaults } from "@/display-content/tasks/TaskDefaults";
import Link from "next/link";
import { MiniRoadmap } from "@/components/MiniRoadmap";
import { Task } from "@/lib/types/types";

interface Props {
  children: React.ReactNode;
  task: Task;
}

const backButton = (
  <Link href="/roadmap" passHref>
    <a
      href="/roadmap"
      data-back-to-roadmap
      className="fdr fac"
      onClick={analytics.event.task_back_to_roadmap.click.view_roadmap}
    >
      <Icon>arrow_back</Icon> {TaskDefaults.backToRoadmapText}
    </a>
  </Link>
);

export const SidebarPageLayout = ({ children, task }: Props): ReactElement => {
  const isLargeScreen = useMediaQuery(MediaQueries.desktopAndUp);

  return (
    <>
      <div className={`usa-section`}>
        <div className="grid-container">
          <div className="grid-row grid-gap">
            <div className="usa-layout-docs__sidenav desktop:grid-col-4">
              {isLargeScreen && (
                <nav aria-label="Secondary navigation" className={`left-nav`}>
                  <div className="padding-top-2 padding-bottom-2 usa-prose">{backButton}</div>
                  <MiniRoadmap activeTaskId={task.id} />
                </nav>
              )}
            </div>
            <main className="usa-layout-docs__main desktop:grid-col-8 usa-layout-docs">
              {!isLargeScreen && <div className="padding-top-2 padding-bottom-2 usa-prose">{backButton}</div>}
              <div className="border-1px border-base-light usa-prose minh-40 fdc">{children}</div>
            </main>
          </div>
        </div>
      </div>
    </>
  );
};

import { Icon } from "@/components/njwds/Icon";
import { MiniOperateSection } from "@/components/roadmap/MiniOperateSection";
import { MiniRoadmap } from "@/components/roadmap/MiniRoadmap";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { MediaQueries } from "@/lib/PageSizes";
import { OperateReference, Task } from "@/lib/types/types";
import analytics from "@/lib/utils/analytics";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { useMediaQuery } from "@mui/material";
import Link from "next/link";
import React, { ReactElement } from "react";

interface Props {
  children: React.ReactNode;
  task?: Task | undefined;
  belowOutlineBoxComponent?: React.ReactNode;
  operateReferences?: Record<string, OperateReference>;
  isWidePage?: boolean;
}

export const SidebarPageLayout = ({
  children,
  task,
  belowOutlineBoxComponent,
  operateReferences,
  isWidePage,
}: Props): ReactElement => {
  const isLargeScreen = useMediaQuery(MediaQueries.desktopAndUp);
  const { userData } = useUserData();

  const mainPageLink = userData?.profileData.hasExistingBusiness ? "/dashboard" : "/roadmap";

  const backButton = (
    <Link href={mainPageLink} passHref>
      <a
        href={mainPageLink}
        data-testid="back-to-roadmap"
        className="usa-link fdr fac margin-top-3 margin-bottom-3 usa-link-hover-override desktop:margin-top-0 desktop:margin-bottom-4"
        onClick={analytics.event.task_back_to_roadmap.click.view_roadmap}
      >
        <div className="circle-3 bg-green icon-green-bg-color-hover">
          <Icon className="text-white usa-icon--size-3">arrow_back</Icon>
        </div>
        <div className="margin-left-2 margin-y-auto text-primary font-sans-xs usa-link text-green-color-hover">
          {Config.taskDefaults.backToRoadmapText}
        </div>
      </a>
    </Link>
  );

  return (
    <>
      <div className={`usa-section padding-top-0 desktop:padding-top-6`}>
        <div className={`grid-container${isWidePage ? "-widescreen desktop:padding-x-7" : ""}`}>
          <div className="grid-row grid-gap">
            <main
              className={`usa-layout-docs__main ${
                isWidePage ? "desktop:grid-col-9" : "desktop:grid-col-8"
              } usa-layout-docs`}
              id="main"
            >
              {!isLargeScreen && <div>{backButton}</div>}
              <div className="border-1px border-base-light usa-prose minh-40 padding-205">{children}</div>
              {belowOutlineBoxComponent}
            </main>
            <div
              className={`usa-layout-docs__sidenav ${
                isWidePage ? "desktop:grid-col-3" : "desktop:grid-col-4"
              } order-first`}
            >
              {isLargeScreen && (
                <nav aria-label="Secondary">
                  {" "}
                  {backButton}
                  <hr className="margin-bottom-1 margin-top-0" aria-hidden={true} />
                  {operateReferences != null && Object.keys(operateReferences).length > 0 ? (
                    <MiniOperateSection operateReferences={operateReferences} />
                  ) : (
                    <MiniRoadmap activeTaskId={task?.id} />
                  )}
                </nav>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

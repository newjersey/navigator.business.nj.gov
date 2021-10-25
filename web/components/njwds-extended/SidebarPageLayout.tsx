import React, { ReactElement } from "react";
import { MediaQueries } from "@/lib/PageSizes";
import { useMediaQuery } from "@mui/material";
import { Icon } from "@/components/njwds/Icon";
import analytics from "@/lib/utils/analytics";
import { TaskDefaults } from "@/display-content/tasks/TaskDefaults";
import Link from "next/link";
import { MiniRoadmap } from "@/components/roadmap/MiniRoadmap";
import { FilingReference, SectionType, Task } from "@/lib/types/types";
import { SectionAccordion } from "../roadmap/SectionAccordion";

interface Props {
  children: React.ReactNode;
  task?: Task | undefined;
  belowOutlineBoxComponent?: React.ReactNode;
  filingsReferences?: Record<string, FilingReference>;
}

const backButton = (
  <Link href="/roadmap" passHref>
    <a
      href="/roadmap"
      data-back-to-roadmap
      className="usa-link fdr fac margin-top-3 margin-bottom-3 usa-link-hover-override desktop:margin-top-0 desktop:margin-bottom-7"
      onClick={analytics.event.task_back_to_roadmap.click.view_roadmap}
    >
      <div className="circle-3 bg-green icon-green-bg-color-hover">
        <Icon className="text-white usa-icon--size-3">arrow_back</Icon>
      </div>
      <div className="margin-left-2 margin-y-auto text-primary font-sans-xs usa-link text-green-color-hover">
        {TaskDefaults.backToRoadmapText}
      </div>
    </a>
  </Link>
);

export const SidebarPageLayout = ({
  children,
  task,
  belowOutlineBoxComponent,
  filingsReferences,
}: Props): ReactElement => {
  const isLargeScreen = useMediaQuery(MediaQueries.desktopAndUp);
  const featureDisableOperate = process.env.FEATURE_DISABLE_OPERATE ?? false;

  return (
    <>
      <div className={`usa-section padding-top-0 desktop:padding-top-6`}>
        <div className="grid-container">
          <div className="grid-row grid-gap">
            <main className="usa-layout-docs__main desktop:grid-col-8 usa-layout-docs" id="main">
              {!isLargeScreen && <div>{backButton}</div>}
              <div className="border-1px border-base-light usa-prose minh-40 fdc">{children}</div>
              {belowOutlineBoxComponent}
            </main>
            <div className="usa-layout-docs__sidenav desktop:grid-col-4 order-first">
              {isLargeScreen && (
                <nav aria-label="Secondary">
                  {" "}
                  {backButton}
                  <MiniRoadmap activeTaskId={task?.id} />
                  {!featureDisableOperate && filingsReferences && (
                    <SectionAccordion sectionType={"OPERATE" as SectionType} mini={true}>
                      <div className="margin-y-2"></div>
                      {Object.keys(filingsReferences).map((filing) => (
                        <div key={filingsReferences[filing].name}>
                          <Link href={`/filings/${filingsReferences[filing].urlSlug}`} passHref>
                            <button
                              data-testid={filingsReferences[filing].name}
                              className="usa-link text-bold font-heading-sm text-no-underline clear-button"
                            >
                              {filingsReferences[filing].name}
                            </button>
                          </Link>
                        </div>
                      ))}
                    </SectionAccordion>
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

import { Content } from "@/components/Content";
import { TaskSidebarPageLayout } from "@/components/TaskSidebarPageLayout";
import { NavBar } from "@/components/navbar/NavBar";
import { PageSkeleton } from "@/components/njwds-layout/PageSkeleton";
import {
  ViolationUrlSlugParam,
  loadAllViolationUrlSlugs,
  loadViolationByUrlSlug,
} from "@/lib/static/loadViolations";
import { ViolationNotice } from "@/lib/types/types";
import { GetStaticPathsResult, GetStaticPropsResult } from "next";
import { ReactElement } from "react";
import { HorizontalLine } from "@/components/HorizontalLine";

interface Props {
  violation: ViolationNotice;
}

const DeviceViolation = () => {
  return (
    <div
    >
      <HorizontalLine />
      <div className="flex flex-align-center flex-wrap margin-top-0 margin-bottom-2"></div>
      <div>
        <span className={"font-weight-bold text-align-left"}>Violations Issued:</span>
        <span className={"float-right"}>March 28, 2024</span>
      </div>
      <h1>SAM</h1>
      <ViolationDueDate dueDate={"SAMTEST"} />
    </div>
  )
}

const ViolationDueDate = (props: {dueDate: string}) => {
  return (
    <span className={"border-2px border-error radius-md padding-x-1"}>
      Fix and Get Inspected By: {props.dueDate}
    </span>
  )
}

const ViolationsPage = (props: Props): ReactElement => {
  return (
    <>
      <PageSkeleton>
        <NavBar showSidebar={true} hideMiniRoadmap={true} />
        <TaskSidebarPageLayout>
          <div
            className={` bg-accent-cool-lightest margin-x-neg-4 margin-top-neg-4 padding-x-4 padding-bottom-1 padding-top-2 margin-bottom-2 radius-top-lg`}
          >
            <div className="flex flex-align-center flex-wrap margin-top-0 margin-bottom-2"></div>
            <h1>{`${props.violation.name}`}</h1>
          </div>
          <Content>{props.violation.contentMd}</Content>
          <DeviceViolation />
        </TaskSidebarPageLayout>
      </PageSkeleton>
    </>
  );
};

export const getStaticPaths = (): GetStaticPathsResult<ViolationUrlSlugParam> => {
  const paths = loadAllViolationUrlSlugs();
  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps = ({
  params,
}: {
  params: ViolationUrlSlugParam;
}): GetStaticPropsResult<Props> => {
  return {
    props: {
      violation: loadViolationByUrlSlug(params.violationUrlSlug),
    },
  };
};

export default ViolationsPage;

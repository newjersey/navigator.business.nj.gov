import { GetStaticPathsResult, GetStaticPropsResult } from "next";
import { ReactElement } from "react";
import { ViolationNotice } from "@/lib/types/types";
import { loadAllViolationUrlSlugs, loadViolationByUrlSlug, ViolationUrlSlugParam } from "@/lib/static/loadViolations";
import { PageSkeleton } from "@/components/njwds-layout/PageSkeleton";
import { NavBar } from "@/components/navbar/NavBar";
import { TaskSidebarPageLayout } from "@/components/TaskSidebarPageLayout";
import { Content } from "@/components/Content";


interface Props {
  violation: ViolationNotice;
}

const ViolationsPage = (props: Props): ReactElement => {
  console.log(props.violation)
  return (
    <>
      <PageSkeleton>
        <NavBar showSidebar={true} hideMiniRoadmap={true} />
        <TaskSidebarPageLayout>
          <div
            className={` bg-accent-cool-lightest margin-x-neg-4 margin-top-neg-4 padding-x-4 padding-bottom-1 padding-top-2 margin-bottom-2 radius-top-lg`}
          >
            <div
              className="flex flex-align-center flex-wrap margin-top-0 margin-bottom-2"
            >
            </div>
            <h1>{`${props.violation.name}`}</h1>
          </div>
          <Content>{props.violation.contentMd}</Content>
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

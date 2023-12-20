import { Content } from "@/components/Content";
import { HorizontalLine } from "@/components/HorizontalLine";
import { NavBar } from "@/components/navbar/NavBar";
import { SingleCtaLink } from "@/components/njwds-extended/cta/SingleCtaLink";
import { PageSkeleton } from "@/components/njwds-layout/PageSkeleton";
import { TaskSidebarPageLayout } from "@/components/TaskSidebarPageLayout";
import { getMergedConfig } from "@/contexts/configContext";
import {
  loadAllQuickActionTaskUrlSlugs,
  loadQuickActionTaskByUrlSlug,
  QuickActionTaskUrlSlugParam,
} from "@/lib/static/loadQuickActionTasks";
import { QuickActionTask } from "@/lib/types/types";
import { GetStaticPathsResult, GetStaticPropsResult } from "next";
import { NextSeo } from "next-seo";
import { ReactElement } from "react";

interface Props {
  quickActionTask: QuickActionTask;
}

const Config = getMergedConfig();

export const QuickActionElement = (props: Props): ReactElement => {
  return (
    <div className="minh-38">
      <div className="bg-base-extra-light margin-x-neg-4 margin-top-neg-4 radius-top-lg">
        <div className="padding-y-4 margin-x-4 margin-bottom-2">
          <h1>{props.quickActionTask.name}</h1>
        </div>
      </div>
      <Content>{props.quickActionTask.contentMd}</Content>
      {props.quickActionTask.form && (
        <>
          <HorizontalLine />
          <span className="h5-styling" data-testid="form-id-header">
            {Config.filingDefaults.formText} &nbsp;
          </span>
          <span className="h6-styling">{props.quickActionTask.form}</span>
        </>
      )}
      {props.quickActionTask.callToActionLink && props.quickActionTask.callToActionText && (
        <SingleCtaLink
          link={props.quickActionTask.callToActionLink}
          text={props.quickActionTask.callToActionText}
        />
      )}
    </div>
  );
};

const QuickActionPage = (props: Props): ReactElement => {
  return (
    <>
      <NextSeo title={`${Config.pagesMetadata.titlePrefix} - ${props.quickActionTask.name}`} />
      <PageSkeleton>
        <NavBar showSidebar={true} hideMiniRoadmap={true} />
        <TaskSidebarPageLayout hideMiniRoadmap={true}>
          <QuickActionElement quickActionTask={props.quickActionTask} />
        </TaskSidebarPageLayout>
      </PageSkeleton>
    </>
  );
};

export const getStaticPaths = (): GetStaticPathsResult<QuickActionTaskUrlSlugParam> => {
  const paths = loadAllQuickActionTaskUrlSlugs();
  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps = ({
  params,
}: {
  params: QuickActionTaskUrlSlugParam;
}): GetStaticPropsResult<Props> => {
  return {
    props: {
      quickActionTask: loadQuickActionTaskByUrlSlug(params.quickActionTaskUrlSlug),
    },
  };
};

export default QuickActionPage;

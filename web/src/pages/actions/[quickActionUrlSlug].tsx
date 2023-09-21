import { Content } from "@/components/Content";
import { HorizontalLine } from "@/components/HorizontalLine";
import { NavBar } from "@/components/navbar/NavBar";
import { PageSkeleton } from "@/components/PageSkeleton";
import { TaskCTA } from "@/components/TaskCTA";
import { TaskSidebarPageLayout } from "@/components/TaskSidebarPageLayout";
import { useConfig } from "@/lib/data-hooks/useConfig";
import {
  loadAllQuickActionUrlSlugs,
  loadQuickActionByUrlSlug,
  QuickActionUrlSlugParam,
} from "@/lib/static/loadQuickActions";
import { QuickAction } from "@/lib/types/types";
import { GetStaticPathsResult, GetStaticPropsResult } from "next";
import { NextSeo } from "next-seo";
import { ReactElement } from "react";

interface Props {
  quickAction: QuickAction;
}

export const QuickActionElement = (props: { quickAction: QuickAction; preview?: boolean }): ReactElement => {
  const { Config } = useConfig();

  return (
    <div className="minh-38">
      <div className="bg-base-extra-light margin-x-neg-4 margin-top-neg-4 radius-top-lg">
        <div className="padding-y-4 margin-x-4 margin-bottom-2">
          <h1>{props.quickAction.name}</h1>
        </div>
      </div>
      <Content>{props.quickAction.contentMd}</Content>
      {props.quickAction.form && (
        <>
          <HorizontalLine />
          <span className="h5-styling" data-testid="form-id-header">
            {Config.filingDefaults.formText} &nbsp;
          </span>
          <span className="h6-styling">{props.quickAction.form}</span>
        </>
      )}
      {props.quickAction.callToActionLink && props.quickAction.callToActionText && (
        <TaskCTA link={props.quickAction.callToActionLink} text={props.quickAction.callToActionText} />
      )}
    </div>
  );
};

const QuickActionPage = (props: Props): ReactElement => {
  return (
    <>
      <NextSeo title={`Business.NJ.gov Navigator - ${props.quickAction.name}`} />
      <PageSkeleton>
        <NavBar showSidebar={true} hideMiniRoadmap={true} />
        <TaskSidebarPageLayout hideMiniRoadmap={true}>
          <QuickActionElement quickAction={props.quickAction} />
        </TaskSidebarPageLayout>
      </PageSkeleton>
    </>
  );
};

export const getStaticPaths = (): GetStaticPathsResult<QuickActionUrlSlugParam> => {
  const paths = loadAllQuickActionUrlSlugs();
  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps = ({
  params,
}: {
  params: QuickActionUrlSlugParam;
}): GetStaticPropsResult<Props> => {
  return {
    props: {
      quickAction: loadQuickActionByUrlSlug(params.quickActionUrlSlug),
    },
  };
};

export default QuickActionPage;

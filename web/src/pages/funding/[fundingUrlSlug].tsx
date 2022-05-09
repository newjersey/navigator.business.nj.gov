import { Content } from "@/components/Content";
import { NavBar } from "@/components/navbar/NavBar";
import { PageSkeleton } from "@/components/PageSkeleton";
import { TaskCTA } from "@/components/TaskCTA";
import { TaskSidebarPageLayout } from "@/components/TaskSidebarPageLayout";
import { FundingUrlSlugParam, loadAllFundingUrlSlugs, loadFundingByUrlSlug } from "@/lib/static/loadFundings";
import { loadOperateReferences } from "@/lib/static/loadOperateReferences";
import { Funding, OperateReference } from "@/lib/types/types";
import { GetStaticPathsResult, GetStaticPropsResult } from "next";
import { NextSeo } from "next-seo";
import React, { ReactElement } from "react";

interface Props {
  funding: Funding;
  operateReferences: Record<string, OperateReference>;
}

export const FundingElement = (props: { funding: Funding }): ReactElement => {
  return (
    <>
      <div className="minh-38">
        <div className="margin-bottom-2">
          <h1>{props.funding.name}</h1>
          <div>
            {props.funding.dueDate ? (
              <span className="margin-right-2 border padding-x-1 border-base text-base">
                DUE: {props.funding.dueDate}{" "}
              </span>
            ) : (
              <></>
            )}
            <span className="text-base">{props.funding.status.toUpperCase()}</span>
          </div>
        </div>
        <Content>{props.funding.contentMd}</Content>
      </div>
      <TaskCTA link={props.funding.callToActionLink} text={props.funding.callToActionText} />
    </>
  );
};

const FundingPage = (props: Props): ReactElement => {
  return (
    <>
      <NextSeo title={`Business.NJ.gov Navigator - ${props.funding.name}`} />
      <PageSkeleton>
        <NavBar sideBarPageLayout={true} operateReferences={props.operateReferences} />
        <TaskSidebarPageLayout operateReferences={props.operateReferences} isWidePage>
          <FundingElement funding={props.funding} />
        </TaskSidebarPageLayout>
      </PageSkeleton>
    </>
  );
};

export const getStaticPaths = (): GetStaticPathsResult<FundingUrlSlugParam> => {
  const paths = loadAllFundingUrlSlugs();
  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps = ({ params }: { params: FundingUrlSlugParam }): GetStaticPropsResult<Props> => {
  return {
    props: {
      funding: loadFundingByUrlSlug(params.fundingUrlSlug),
      operateReferences: loadOperateReferences(),
    },
  };
};

export default FundingPage;

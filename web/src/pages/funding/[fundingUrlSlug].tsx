import { Content } from "@/components/Content";
import { NavBar } from "@/components/navbar/NavBar";
import { SidebarPageLayout } from "@/components/njwds-extended/SidebarPageLayout";
import { PageSkeleton } from "@/components/PageSkeleton";
import { TaskCTA } from "@/components/TaskCTA";
import { useAuthProtectedPage } from "@/lib/auth/useAuthProtectedPage";
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
      <div className="flex flex-column space-between minh-37">
        <div>
          <div role="heading" aria-level={1} className="margin-top-0 margin-bottom-2 h2-styling">
            {props.funding.name}
          </div>
          <Content>{props.funding.contentMd}</Content>
        </div>
        <TaskCTA link={props.funding.callToActionLink} text={props.funding.callToActionText} />
      </div>
    </>
  );
};

const FundingPage = (props: Props): ReactElement => {
  useAuthProtectedPage();

  return (
    <>
      <NextSeo title={`Business.NJ.gov Navigator - ${props.funding.name}`} />
      <PageSkeleton>
        <NavBar sideBarPageLayout={true} operateReferences={props.operateReferences} />
        <SidebarPageLayout operateReferences={props.operateReferences}>
          <FundingElement funding={props.funding} />
        </SidebarPageLayout>
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

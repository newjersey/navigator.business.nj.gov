import { Content } from "@/components/Content";
import { NavBar } from "@/components/navbar/NavBar";
import { SidebarPageLayout } from "@/components/njwds-extended/SidebarPageLayout";
import { PageSkeleton } from "@/components/PageSkeleton";
import { TaskCTA } from "@/components/TaskCTA";
import { useAuthProtectedPage } from "@/lib/auth/useAuthProtectedPage";
import { loadOperateReferences } from "@/lib/static/loadOperateReferences";
import {
  loadAllOpportunityUrlSlugs,
  loadOpportunityByUrlSlug,
  OpportunityUrlSlugParam,
} from "@/lib/static/loadOpportunities";
import { OperateReference, Opportunity } from "@/lib/types/types";
import { GetStaticPathsResult, GetStaticPropsResult } from "next";
import { NextSeo } from "next-seo";
import React, { ReactElement } from "react";

interface Props {
  opportunity: Opportunity;
  operateReferences: Record<string, OperateReference>;
}

export const OpportunityElement = (props: { opportunity: Opportunity }): ReactElement => {
  return (
    <>
      <div className="flex flex-column space-between minh-37">
        <div>
          <div role="heading" aria-level={1} className="margin-top-0 margin-bottom-2 h2-styling">
            {props.opportunity.name}
          </div>
          <Content>{props.opportunity.contentMd}</Content>
        </div>
        <TaskCTA link={props.opportunity.callToActionLink} text={props.opportunity.callToActionText} />
      </div>
    </>
  );
};
const OpportunityPage = (props: Props): ReactElement => {
  useAuthProtectedPage();

  return (
    <>
      <NextSeo title={`Business.NJ.gov Navigator - ${props.opportunity.name}`} />
      <PageSkeleton>
        <NavBar sideBarPageLayout={true} operateReferences={props.operateReferences} />
        <SidebarPageLayout operateReferences={props.operateReferences}>
          <OpportunityElement opportunity={props.opportunity} />
        </SidebarPageLayout>
      </PageSkeleton>
    </>
  );
};

export const getStaticPaths = (): GetStaticPathsResult<OpportunityUrlSlugParam> => {
  const paths = loadAllOpportunityUrlSlugs();
  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps = ({
  params,
}: {
  params: OpportunityUrlSlugParam;
}): GetStaticPropsResult<Props> => {
  return {
    props: {
      opportunity: loadOpportunityByUrlSlug(params.opportunityUrlSlug),
      operateReferences: loadOperateReferences(),
    },
  };
};

export default OpportunityPage;

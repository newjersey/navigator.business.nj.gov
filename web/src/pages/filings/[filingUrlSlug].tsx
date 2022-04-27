import { Content } from "@/components/Content";
import { NavBar } from "@/components/navbar/NavBar";
import { Tag } from "@/components/njwds-extended/Tag";
import { PageSkeleton } from "@/components/PageSkeleton";
import { TaskCTA } from "@/components/TaskCTA";
import { TaskSidebarPageLayout } from "@/components/TaskSidebarPageLayout";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { FilingUrlSlugParam, loadAllFilingUrlSlugs, loadFilingByUrlSlug } from "@/lib/static/loadFilings";
import { loadOperateReferences } from "@/lib/static/loadOperateReferences";
import { Filing, OperateReference } from "@/lib/types/types";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { parseDate } from "@businessnjgovnavigator/shared/dateHelpers";
import { GetStaticPathsResult, GetStaticPropsResult } from "next";
import { NextSeo } from "next-seo";
import React, { ReactElement } from "react";

interface Props {
  filing: Filing;
  operateReferences: Record<string, OperateReference>;
}

const FilingPage = (props: Props): ReactElement => {
  const { userData } = useUserData();
  const matchingFiling = userData?.taxFilingData.filings.find((it) => it.identifier === props.filing.id);
  const dueDate = matchingFiling ? parseDate(matchingFiling.dueDate).format("MM/DD/YYYY") : "";

  return (
    <>
      <NextSeo title={`Business.NJ.gov Navigator - ${props.filing.name}`} />
      <PageSkeleton isWidePage>
        <NavBar sideBarPageLayout={true} operateReferences={props.operateReferences} isWidePage />
        <TaskSidebarPageLayout operateReferences={props.operateReferences} isWidePage>
          <div className="minh-38">
            <div className="margin-bottom-2">
              <h1>{props.filing.name}</h1>
            </div>
            <div className="display-inline-flex margin-bottom-4" data-testid="due-date">
              <Tag tagVariant="baseDark" bold={true}>
                {Config.filingDefaults.tagContentBeforeDueDate} {dueDate}
              </Tag>
            </div>
            <Content>{props.filing.contentMd}</Content>
          </div>
          <TaskCTA link={props.filing.callToActionLink} text={props.filing.callToActionText} />
        </TaskSidebarPageLayout>
      </PageSkeleton>
    </>
  );
};

export const getStaticPaths = (): GetStaticPathsResult<FilingUrlSlugParam> => {
  const paths = loadAllFilingUrlSlugs();
  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps = ({ params }: { params: FilingUrlSlugParam }): GetStaticPropsResult<Props> => {
  return {
    props: {
      filing: loadFilingByUrlSlug(params.filingUrlSlug),
      operateReferences: loadOperateReferences(),
    },
  };
};

export default FilingPage;
